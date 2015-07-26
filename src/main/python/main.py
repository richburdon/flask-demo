#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import os
import logging
from flask_environments import Environments
from flask_injector import FlaskInjector
from config import ConfigModule
#from websocket import SocketModule, socketio
from view import ViewModule


# Main app
app = flask.Flask(
    __name__,
    static_folder='../webapp/resources',
    static_url_path='/res',
    template_folder='templates')


# TODO(burdon): Config caching.
@app.after_request
def add_header(response):
    response.cache_control.max_age = 0
    return response

# TODO(burdon): Config logging.
# Runtime environment (e.g., export FLASK_ENV=PRODUCTION)
# https://pythonhosted.org/Flask-Environments
env = Environments(app)
env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

logging.basicConfig(filename=app.config['LOG_FILE'], level=logging.getLevelName(app.config['LOG_LEVEL']))
logging.getLogger().addHandler(logging.StreamHandler())

# Flask injection modules.
# https://github.com/alecthomas/injector
FlaskInjector(app=app, modules=[
#    SocketModule,
    ConfigModule,
    ViewModule
])

# Start
if __name__ == '__main__':
    logging.info('Starting...')
#    socketio.run(app, port=app.config['PORT'])
    app.run(port=app.config['PORT'])
