#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Module, inject, singleton
from config import Config
from data import Database, RequestHandler


@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DemoView)
        self.add_view(DataView)


@singleton
@inject(config=Config, db=Database)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        return flask.render_template('home.html', config=self.config, db=self.db)


@singleton
@inject(config=Config)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html', config=self.config['client'])


@singleton
@inject(handler=RequestHandler)
class DataView(flask.views.MethodView):

    ROUTE = '/data'
    NAME = 'Data API'

    # TODO(burdon): Change to proto.
    def post(self):
        try:
            request = flask.request.json
            response = self.handler.process_request(request)
            return flask.json.jsonify(response)

        except:
            import logging
            logging.exception('Request Error')
            return flask.abort(500)
