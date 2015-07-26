#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Module, inject
from config import Config
from data import Database

import logging
LOG = logging.getLogger('view')


@inject(app=flask.Flask)
class ViewModule(Module):

    def add_view(self, view):
        self.app.add_url_rule(view.ROUTE, view_func=view.as_view(view.NAME))

    def configure(self, binder):
        self.add_view(HomeView)
        self.add_view(DemoView)
        self.add_view(DataView)


@inject(config=Config, db=Database)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        return flask.render_template('home.html', config=self.config, db=self.db)


@inject(config=Config)
class DemoView(flask.views.MethodView):

    ROUTE = '/demo'
    NAME = 'Demo'

    def get(self):
        return flask.render_template('demo.html')


@inject(db=Database)
class DataView(flask.views.MethodView):

    ROUTE = '/data'
    NAME = 'Data API'

    def get(self):
        try:
            result = {
                'nodes': [],
                'links': []
            }

            # TODO(burdon): Select relationships also.
            records = self.db.select()
            graph = records.to_subgraph()
            LOG.info(graph.nodes)
            LOG.info(graph.relationships)

            node_map = {}
            for node in graph.nodes:
                # TODO(burdon): Why are nodes showing up multiple times?
                if node.ref not in node_map:
                    node_map[node.ref] = node
                    result['nodes'].append({
                        'id': node.ref,
                        'name': node['name']
                    })

            for relationship in graph.relationships:
                result['links'].append({
                    'source': relationship.start_node.ref,
                    'target': relationship.end_node.ref
                })

            return flask.json.jsonify(result)

        except:
            LOG.exception('Data API')
            return flask.abort(500)

    def post(self):
        try:
            # TODO(burdon): Part mutation.
            self.db.add()
            return flask.json.jsonify({})

        except:
            LOG.exception('Data API')
            return flask.abort(500)
