#
# Copyright 2014 Alien Laboratories, Inc.
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

# Runtime environment (set-via FLASK_ENV)
# https://pythonhosted.org/Flask-Environments
env = Environments(app)
env.from_yaml(os.path.join(os.getcwd(), 'config/config.yml'))

# Flask injection modules.
# https://github.com/alecthomas/injector
FlaskInjector(app=app, modules=[
    ConfigModule,
    ViewModule
])

# Start
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=app.config['PORT'])
