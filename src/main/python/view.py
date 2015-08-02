#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Key, Module, inject, singleton
from config import CONFIG


class TwitterService(object):

    TWITTER_USER = 'twitter_user'
    TWITTER_TOKEN = 'twitter_token'



@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DemoView)

        # http://flask-oauthlib.readthedocs.org/en/latest/index.html
        # Deprecated: https://pythonhosted.org/Flask-OAuth
        from flask_oauthlib.client import OAuth
        oauth = OAuth()

        # https://dev.twitter.com/web/sign-in/implementing
        # https://apps.twitter.com/app/8619350
        # TODO(burdon): Refactor.
        twitter = oauth.remote_app(
            'twitter',
            base_url='https://api.twitter.com/1/',
            request_token_url='https://api.twitter.com/oauth/request_token',
            access_token_url='https://api.twitter.com/oauth/access_token',
            authorize_url='https://api.twitter.com/oauth/authenticate',

            # TODO(burdon): Move to config (use app_key)
            consumer_key='FbvfS8UoEv6QMOT6vSozI7XHS',
            consumer_secret='GZw0CdtX1rKYt18MHFtid2j7SDQByhe8DQ122nBeLautHa6HBm')

        @twitter.tokengetter
        def get_twitter_token(token=None):
            # TODO(burdon): Temp store token in session.
            return flask.session.get(TwitterService.TWITTER_TOKEN)

        @self.app.route('/login')
        def login():
            # https://flask-oauthlib.readthedocs.org/en/latest/client.html#signing-in-authorizing
            return twitter.authorize(
                callback=flask.url_for('oauth_callback',
                                       next=flask.request.args.get('next') or flask.request.referrer or None))

        @self.app.route('/logout')
        def logout():
            # TODO(burdon): Revoke also: https://twitter.com/settings/applications
            flask.session.pop(TwitterService.TWITTER_USER, None)
            flask.session.pop(TwitterService.TWITTER_TOKEN, None)
            return flask.redirect(flask.url_for(HomeView.NAME))

        @self.app.route('/oauth_callback')
        def oauth_callback():
            # TODO(burdon): Determine which provider (pass args to authorize).
            response = twitter.authorized_response()
            next_url = flask.request.args.get('next') or flask.url_for(HomeView.NAME)

            if response is None:
                flask.flash('Login failed!')

            else:
                flask.session[TwitterService.TWITTER_TOKEN] = (
                    response['oauth_token'],
                    response['oauth_token_secret']
                )

                flask.session[TwitterService.TWITTER_USER] = response['screen_name']
                flask.flash('You were signed in as %s' % response['screen_name'])

            return flask.redirect(next_url)


@singleton
@inject(config=CONFIG)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'   # TODO(burdon): Rename endpoint.

    def get(self):
        user = flask.session.get(TwitterService.TWITTER_USER)
        return flask.render_template('home.html', config=self.config, user=user)


# TODO(burdon): Require to be logged in.
@singleton
@inject(config=CONFIG)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html', config=self.config)
