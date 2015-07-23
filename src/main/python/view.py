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
        self.add_view(DataView)


@inject(config=Config, db=Database)
class HomeView(flask.views.MethodView):

    ROUTE = '/'
    NAME = 'Home'

    def get(self):
        return flask.render_template('home.html', config=self.config, db=self.db)


@inject(db=Database)
class DataView(flask.views.MethodView):

    ROUTE = '/data'
    NAME = 'Data API'

    def get(self):
        try:
            self.db.add()
            result = {
                'nodes': [],
                'links': []
            }

            # TODO(burdon): Select relationships also.
            records = self.db.select()
            for record in records:
                LOG.info(record[0])
                result['nodes'].append({
                    'id': record[0].ref,
                    'name': record[0]['name']
                })

            return flask.json.jsonify(result)

        except:
            LOG.exception('Data API')
            return flask.abort(500)
