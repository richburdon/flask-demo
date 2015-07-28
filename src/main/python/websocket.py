#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import logging
from flask.ext.socketio import SocketIO
from injector import Module, inject

# Main instance.
# https://flask-socketio.readthedocs.org/en/latest/
# TODO(burdon): Investigate pubnub/pusher API (to enable scaling at later date).
# TODO(burdon): Configure nginx for sticky sessions.
socketio = SocketIO()

NS = '/nx'
EVENT_NAME = 'Message'


@socketio.on_error_default
def default_error_handler(e):
    logging.info('ERROR', e)


@socketio.on('connect', namespace=NS)
def test_connect():
    logging.info('Connected')


@socketio.on('disconnect', namespace=NS)
def test_disconnect():
    logging.info('Disconnected')


# TODO(burdon): Inject request handler?
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

    # TODO(burdon): Move DataView here; impl. multiplexing on event type (normalize socket/ajax comms).
    # Respond asynchronously to connected client.
    @staticmethod
    def ping():
        # Trigger async response.
        socketio.emit(EVENT_NAME, {'data': 'PONG'}, namespace=NS)
        return flask.json.jsonify({})
