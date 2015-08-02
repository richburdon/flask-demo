#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
from injector import Key, MappingKey, Module, inject, singleton

# http://flask-oauthlib.readthedocs.org/en/latest/client.html
# http://flask-oauthlib.readthedocs.org/en/latest/api.html
# Deprecated: https://pythonhosted.org/Flask-OAuth
from flask_oauthlib.client import OAuth


class OAuthService(object):
    """

    """

    def __init__(self, remote):
        self.remote = remote

    # TODO(burdon): Factor out session consts.

    def authorized(self, response):
        flask.session[TwitterModule.TOKEN] = (
            response['oauth_token'],
            response['oauth_token_secret']
        )

        flask.session[TwitterModule.USER] = {
            'id': response['user_id'],
            'name': response['screen_name']
        }

        return flask.session.get(TwitterModule.USER)

    def logout(self):
        # TODO(burdon): Revoke also: https://twitter.com/settings/applications
        flask.session.pop(TwitterModule.TOKEN, None)
        flask.session.pop(TwitterModule.USER, None)


# TODO(burdon): Inject set.
@singleton
class OAuthServiceManager(object):
    """

    """

    SERVICE = MappingKey('services')

    @inject(services=SERVICE)
    def __init__(self, services):
        self.services = services

    def get_service(self, name):
        return self.services[name]


@inject(oauth=OAuth)
class TwitterModule(Module):
    """

    """

    KEY = Key('twitter')

    SERVICE = 'twitter'
    ADMIN_URL = 'https://apps.twitter.com/app/8619350'

    TOKEN = 'twitter_token'
    USER = 'twitter_user'

    def configure(self, binder):

        # https://dev.twitter.com/web/sign-in/implementing
        remote = self.oauth.remote_app(
            TwitterModule.SERVICE,
            app_key='TWITTER',  # Reference conf.
            base_url='https://api.twitter.com/1/',
            request_token_url='https://api.twitter.com/oauth/request_token',
            access_token_url='https://api.twitter.com/oauth/access_token',
            authorize_url='https://api.twitter.com/oauth/authenticate')

        # TODO(burdon): Remove.
        binder.bind(TwitterModule.KEY, remote)

        service = OAuthService(remote)
        binder.bind(OAuthServiceManager.SERVICE, { TwitterModule.SERVICE: service })

        @remote.tokengetter
        def get_twitter_token(token=None):
            # TODO(burdon): Store in DB in prod.
            return flask.session.get(TwitterModule.TOKEN)


@singleton
@inject(app=flask.Flask)
class OAuthConfigModule(Module):
    """

    """

    def configure(self, binder):

        # Bind main instance.
        binder.bind(OAuth, OAuth(self.app), scope=singleton)


HOME_ENDPOINT = Key('OAuthServiceModule.HOME_ENDPOINT')


@singleton
@inject(
    app=flask.Flask,
    oauth=OAuth,
    home_endpoint=HOME_ENDPOINT,
    service_manager=OAuthServiceManager)
class OAuthRouterModule(Module):
    """

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
                user = oauth_service.authorized(response)
                flask.flash('You were signed in as %s' % user['name'])

            return flask.redirect(next_url)


