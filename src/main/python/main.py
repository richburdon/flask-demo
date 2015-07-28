#
# Copyright 2015 Alien Laboratories, Inc.
#

import logging
LOG = logging.getLogger()

import flask
import os
import yaml

from flask_environments import Environments
from flask_injector import FlaskInjector

from config import ConfigModule
from websocket import SocketModule, socketio
from view import ViewModule


# Main app
app = flask.Flask(
    __name__,
    static_folder='../webapp/resources',
    static_url_path='/res',
    template_folder='templates')

# Runtime environment (e.g., export FLASK_ENV=PRODUCTION)
# https://pythonhosted.org/Flask-Environments
env = Environments(app)
env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

# Config logging.
# https://docs.python.org/2/howto/logging.html
# http://flask.pocoo.org/docs/0.10/errorhandling
import logging.config
logging.config.dictConfig(yaml.load(open('config/logging.yml')))


# TODO(burdon): Config caching.
# http://stackoverflow.com/questions/16741834/how-to-add-stdout-and-stderr-to-logger-file-in-flask
# https://github.com/mitsuhiko/werkzeug/blob/60670cb98db1934b7aa7df454cbe4508c467f403/werkzeug/serving.py#L680
@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response


# Flask injection modules.
# https://github.com/alecthomas/injector
FlaskInjector(app=app, modules=[
    SocketModule,
    ConfigModule,
    ViewModule
])

# Start
if __name__ == '__main__':
    LOG.info('### STARTING ###')
    socketio.run(app,
                 use_reloader=app.config['PROD'],
                 host=app.config['HOST'],
                 port=app.config['PORT'])
