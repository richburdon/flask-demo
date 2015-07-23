#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import os
from flask_environments import Environments
from flask_injector import FlaskInjector
from config import ConfigModule
from view import ViewModule

# Main app
app = flask.Flask(
    __name__,
    static_folder='../webapp/resources',
    static_url_path='/res',
    template_folder='templates')


# Config caching.
@app.after_request
def add_header(response):
    response.cache_control.max_age = 300
    return response

# Runtime environment (e.g., export FLASK_ENV=PRODUCTION)
# https://pythonhosted.org/Flask-Environments
env = Environments(app)
env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

import logging
logging.basicConfig(filename=app.config['LOG_FILE'], level=logging.getLevelName(app.config['LOG_LEVEL']))
logging.getLogger().addHandler(logging.StreamHandler())

# Flask injection modules.
# https://github.com/alecthomas/injector
FlaskInjector(app=app, modules=[
    ConfigModule,
    ViewModule
])

# Start
if __name__ == '__main__':
    logging.info('Starting...')
    app.run(
        host='0.0.0.0',
        port=app.config['PORT'])
