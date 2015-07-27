#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import logging
from flask.ext.socketio import SocketIO
from injector import Module, inject

# Main instance.
# TODO(burdon): Investigate pubnub/pusher API (to enable scaling at later date).
# TODO(burdon): Configure nginx for sticky sessions.
socketio = SocketIO()

NS = '/nx'
EVENT_NAME = 'MyEvent'


@socketio.on_error_default
def default_error_handler(e):
    logging.info('ERROR', e)


@socketio.on('connect', namespace=NS)
def test_connect():
    logging.info('Connected')


@socketio.on('disconnect', namespace=NS)
def test_disconnect():
    logging.info('Disconnected')


@socketio.on(EVENT_NAME, namespace=NS)
def handle_message(data):
    logging.info('Received: ' + str(data))
    socketio.emit(EVENT_NAME, {'data': 'TEST'}, namespace=NS, callback=lambda: logging.info('ACK'))


# Websockets
# https://flask-socketio.readthedocs.org
@inject(app=flask.Flask)
class SocketModule(Module):

    def __init__(self):
        self.app.add_url_rule('/ping', 'ping', self.ping)
        socketio.init_app(self.app)

    # Respond asynchronously to connected client.
    @staticmethod
    def ping():
        socketio.emit(EVENT_NAME, {'data': 'PING'}, namespace=NS)
        return flask.json.jsonify({})
