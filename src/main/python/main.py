#
# Copyright 2015 Alien Laboratories, Inc.
#

import logging
import logging.config
LOG = logging.getLogger()

import flask
import os
import yaml

from flask_environments import Environments
from flask_injector import FlaskInjector, Injector
from injector import inject
from jinja2 import Environment

from config import ConfigModule
from websocket import SocketModule, SocketHandler
from view import ViewModule


# TODO(burdon): Inherit the Flask app; i.e., Main(Flask)
class Main(object):
    """
    Main server.
    """

    # Main app instance.
    app = flask.Flask(
        __name__,
        static_folder='../webapp/resources',
        static_url_path='/res',
        template_folder='templates')

    def __init__(self):

        # Runtime environment (e.g., export FLASK_ENV=PRODUCTION)
        # https://pythonhosted.org/Flask-Environments
        env = Environments(self.app)
        env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

        # Config logging.
        # https://docs.python.org/2/howto/logging.html
        logging.config.dictConfig(yaml.load(open(self.app.config['LOG_CONFIG'])))

        # Jinja2 templates.
        # http://jinja.pocoo.org/docs/dev/api
        # http://flask.pocoo.org/docs/0.10/api/#flask.Flask.jinja_options
        self.app.jinja_options = flask.Flask.jinja_options.copy()
        self.app.jinja_options.update(dict(
            trim_blocks=True,
            lstrip_blocks=True
        ))

        # TODO(burdon): Config caching.
        # http://stackoverflow.com/questions/16741834/how-to-add-stdout-and-stderr-to-logger-file-in-flask
        # https://github.com/mitsuhiko/werkzeug/blob/60670cb98db1934b7aa7df454cbe4508c467f403/werkzeug/serving.py#L680
        @self.app.after_request
        def add_header(response):
            response.cache_control.max_age = 0
            return response

        # Enable injection within this class.
        # https://github.com/alecthomas/injector
        injector = Injector()
        injector.install_into(self)

        # Flask injection.
        LOG.info('### %s ###' % self.app.config['ENVIORNMENT'])
        FlaskInjector(app=self.app, injector=injector, modules=[
            ConfigModule,
            SocketModule,
            ViewModule
        ])

    # TODO(burdon): Create config with no socket server.
    @inject(handler=SocketHandler)
    def run(self, handler):
        LOG.info('Starting server...')
        handler.socketio.run(self.app,
                             use_reloader=self.app.config['PROD'],
                             host=self.app.config['HOST'],
                             port=self.app.config['PORT'])

if __name__ == '__main__':
    Main().run()
