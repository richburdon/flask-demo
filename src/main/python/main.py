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

from config import ConfigModule
from oauth import OAuthConfigModule, OAuthRouterModule
from twitter import TwitterModule
from view import ViewModule


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

        # http://pythonhosted.org/Flask-Session
        # http://flask.pocoo.org/docs/0.10/quickstart/#sessions
        self.session = Session(self)

        # Enable injection within this class.
        # https://github.com/alecthomas/injector
        injector = Injector()
        injector.install_into(self)

        # Flask injection.
        # NOTE: Order of modules is important.
        LOG.info('### %s ###' % self.config['ENVIORNMENT'])
        FlaskInjector(app=self, injector=injector, modules=[
            ConfigModule,
            OAuthConfigModule,
            TwitterModule,
            ViewModule,
            OAuthRouterModule
        ])

    def start(self):
        LOG.info('Starting server...')
        self.run(use_reloader=self.config['PROD'],
                 host=self.config['HOST'],
                 port=self.config['PORT'])

if __name__ == '__main__':
    Main().start()
