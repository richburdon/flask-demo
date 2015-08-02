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
from flask.ext.session import Session

from view import ViewModule
from config import ConfigModule


class Main(flask.Flask):
    """
    Main Flask app.
    """
    def __init__(self):
        super(Main, self).__init__(
            __name__,
            static_url_path='/res',
            static_folder='../webapp/resources',
            template_folder='templates')

        # Runtime environment (e.g., export FLASK_ENV=PRODUCTION)
        # https://pythonhosted.org/Flask-Environments
        env = Environments(self)
        env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

        # TODO(burdon): Move session config to file (not in source).
        self.config['SECRET_KEY'] = 'FLASK_DEMO_KEY'

        # http://pythonhosted.org/Flask-Session
        # http://flask.pocoo.org/docs/0.10/quickstart/#sessions
        self.config['SESSION_TYPE'] = 'filesystem'
        session = Session(self)

        # Config logging.
        # https://docs.python.org/2/howto/logging.html
        logging.config.dictConfig(yaml.load(open(self.config['LOG_CONFIG'])))

        # Jinja2 templates.
        # http://jinja.pocoo.org/docs/dev/api
        # http://flask.pocoo.org/docs/0.10/api/#flask.Flask.jinja_options
        self.jinja_options = flask.Flask.jinja_options.copy()
        self.jinja_options.update(dict(
            trim_blocks=True,
            lstrip_blocks=True
        ))

        # Enable injection within this class.
        # https://github.com/alecthomas/injector
        injector = Injector()
        injector.install_into(self)

        # Flask injection.
        LOG.info('### %s ###' % self.config['ENVIORNMENT'])
        FlaskInjector(app=self, injector=injector, modules=[
            ConfigModule,
            ViewModule
        ])

    def start(self):
        LOG.info('Starting server...')
        self.run(use_reloader=self.config['PROD'],
                 host=self.config['HOST'],
                 port=self.config['PORT'])

if __name__ == '__main__':
    Main().start()
