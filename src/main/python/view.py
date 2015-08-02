#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Key, Module, inject, singleton
from config import CONFIG


@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DemoView)


@singleton
@inject(config=CONFIG)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        return flask.render_template('home.html', config=self.config)


@singleton
@inject(config=CONFIG)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html', config=self.config)
