#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Module, inject, singleton

from config import CONFIG
from oauth import TwitterModule, HOME_ENDPOINT


@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DemoView)

        binder.bind(HOME_ENDPOINT, HomeView.NAME)


@singleton
@inject(config=CONFIG)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        # TODO(burdon): Get from service manager.
        user = flask.session.get(TwitterModule.USER)
        return flask.render_template('home.html', config=self.config, user=user)


# TODO(burdon): Require to be logged in.
# @oauth.require_oauth('twitter')
@singleton
@inject(config=CONFIG)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html', config=self.config)
