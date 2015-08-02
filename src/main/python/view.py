#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Module, inject, singleton

from config import CONFIG
from oauth import OAuthServiceManager, LOGIN_SUCCESS_ENDPOINT
from twitter import TwitterModule


@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        # Set Post login URL.
        binder.bind(LOGIN_SUCCESS_ENDPOINT, HomeView.NAME)

        # TODO(burdon): Set SERVER_NAME for favicon redirect.
        # http://flask.pocoo.org/docs/0.10/config/

        # View.
        self.add_view(HomeView)
        self.add_view(DemoView)

        # Error handling.
        @self.app.errorhandler(401)
        def page_not_found(error):
            flask.flash('Not authorized.')
            return flask.redirect(flask.url_for(HomeView.NAME))


@singleton
@inject(config=CONFIG, service_manager=OAuthServiceManager)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        service = self.service_manager.get_service(TwitterModule.SERVICE)
        user = service.get_user()
        return flask.render_template('home.html', config=self.config, user=user)


@singleton
@inject(config=CONFIG, service_manager=OAuthServiceManager)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        service = self.service_manager.get_service(TwitterModule.SERVICE)
        user = service.get_user(True)  # Require
        return flask.render_template('demo.html', config=self.config, user=user)
