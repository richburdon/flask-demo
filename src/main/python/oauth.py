#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
from injector import Key, MappingKey, Module, inject, singleton
from flask_oauthlib.client import OAuth


class OAuthService(object):
    """
    Manages OAuth flow for a given service provider.
    """

    def __init__(self, prefix, remote):
        self.remote = remote

        self.token_key = '%s_token' % prefix
        self.user_key = '%s_user' % prefix

        @remote.tokengetter
        def get_token(token=None):
            return flask.session.get(self.token_key)

    def authorized(self, response):
        flask.session[self.token_key] = (
            response['oauth_token'],
            response['oauth_token_secret']
        )

        flask.session[self.user_key] = {
            'id': response['user_id'],
            'name': response['screen_name']
        }

    def logout(self):
        # TODO(burdon): Revoke also: https://twitter.com/settings/applications
        flask.session.pop(self.token_key, None)
        flask.session.pop(self.user_key, None)

    def get_user(self, require=False):
        user = flask.session.get(self.user_key)
        if require and not user:
            return flask.abort(401)
        return user


@singleton
class OAuthServiceManager(object):
    """
    Manages a collection of OAuth service instances.
    """

    SERVICE = MappingKey('services')

    @inject(services=SERVICE)
    def __init__(self, services):
        self.services = services

    def get_service(self, name):
        return self.services[name]


@singleton
@inject(app=flask.Flask)
class OAuthConfigModule(Module):
    """
    Initial OAuth configuration.
    """

    def configure(self, binder):

        # Bind main instance.
        binder.bind(OAuth, OAuth(self.app), scope=singleton)


# Configure this key to route login flow on success.
LOGIN_SUCCESS_ENDPOINT = Key('OAuthServiceModule.HOME_ENDPOINT')


@singleton
@inject(
    app=flask.Flask,
    home_endpoint=LOGIN_SUCCESS_ENDPOINT,
    service_manager=OAuthServiceManager)
class OAuthRouterModule(Module):
    """
    Configures OAuth routes.

    http://flask-oauthlib.readthedocs.org/en/latest/client.html
    http://flask-oauthlib.readthedocs.org/en/latest/api.html
    Deprecated: https://pythonhosted.org/Flask-OAuth
    """

    def configure(self, binder):

        @self.app.route('/login/<service>')
        def login(service):
            oauth_service = self.service_manager.get_service(service)
            # https://flask-oauthlib.readthedocs.org/en/latest/client.html#signing-in-authorizing
            return oauth_service.remote.authorize(
                state='XYZ',  # NOTE: Not supported by twitter.
                callback=flask.url_for('oauth_callback',
                                       service=service,
                                       next=flask.request.args.get('next') or flask.request.referrer or None))

        @self.app.route('/logout/<service>')
        def logout(service):
            oauth_service = self.service_manager.get_service(service)
            oauth_service.logout()
            return flask.redirect(flask.url_for(self.home_endpoint))

        @self.app.route('/oauth_callback/<service>')
        def oauth_callback(service):
            oauth_service = self.service_manager.get_service(service)

            # TODO(burdon): Not supported by twitter.
            # http://stackoverflow.com/questions/17333008/getting-around-twitters-lack-of-a-state-parameter
            state = flask.request.args.get('state')

            next_url = flask.request.args.get('next') or flask.url_for(self.home_endpoint)
            response = oauth_service.remote.authorized_response()

            if response is None:
                flask.flash('Login failed!')

            else:
                oauth_service.authorized(response)
                user = oauth_service.get_user()
                flask.flash('You were signed in as %s' % user['name'])

            return flask.redirect(next_url)
