#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Module, inject, singleton
from config import Config
from data import Database, RequestHandler, Notifier


@singleton
@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DebugView)
        self.add_view(OptionsView)
        self.add_view(DemoView)
        self.add_view(DataView)
        self.add_view(ActionView)
        self.add_view(NotifierView)


@singleton
@inject(config=Config, db=Database)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        return flask.render_template('home.html', config=self.config, db=self.db)


@singleton
@inject(config=Config, db=Database)
class DebugView(flask.views.MethodView):

    ROUTE = '/debug'
    NAME = 'Debug'

    def get(self):
        print str(self.config['client.app.name'])
        return flask.render_template('debug.html', config=self.config)

    def post(self):
        request = flask.request.json
        result = self.db.graph.cypher.execute(request['query'])
        count = len(result)
        response = {
            'count': count
        }
        return flask.json.jsonify(response)


@singleton
@inject(config=Config, db=Database)
class OptionsView(flask.views.MethodView):

    ROUTE = '/options'
    NAME = 'Options'

    def get(self):
        return flask.render_template('options.html', config=self.config)


@singleton
@inject(config=Config)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html', config=self.config.get_client_config())


@singleton
@inject(handler=RequestHandler)
class DataView(flask.views.MethodView):

    ROUTE = '/data'
    NAME = 'Data API'

    # TODO(burdon): Change to proto.
    def post(self):
        try:
            request = flask.request.json
            # TODO(burdon): Dispatch to query/mutation request processor (based on permissions).
            response = self.handler.process_request(request)
            return flask.json.jsonify(response)

        except:
            import logging
            logging.exception('Request Error')
            return flask.abort(500)


@singleton
@inject(database=Database)
class ActionView(flask.views.MethodView):

    ROUTE = '/action'
    NAME = 'Action API'

    # TODO(burdon): Change to proto.
    def post(self):
        # TODO(burdon): Logging hidden.
        import logging
        logging.info('ACTION')
        self.database.clear()
        return flask.json.jsonify({
            'notify': {}
        })


@singleton
@inject(notifier=Notifier)
class NotifierView(flask.views.MethodView):

    ROUTE = '/notify'
    NAME = 'Notify WebSocket clients'

    def get(self):
        self.notifier.notify({
            'notify': {}
        })
        return flask.json.jsonify({})
