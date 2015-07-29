#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import logging
from flask.ext.socketio import SocketIO
from injector import Injector, Module, inject

from data import RequestHandler


# Main instance.
# https://flask-socketio.readthedocs.org
# TODO(burdon): Investigate pubnub/pusher API (to enable scaling at later date).
# TODO(burdon): Configure nginx for sticky sessions.
socketio = SocketIO()

NS = '/nx'
EVENT_NAME = 'Message'


# Adapter necessary for global socket bindings.
# TODO(burdon): https://github.com/miguelgrinberg/Flask-SocketIO/issues/129
class Adapter(object):

    instance = None

    def __init__(self, injector):
        self.injector = injector

    def on_error(self, error):
        logging.error(error)

    def on_connect(self):
        logging.info('Connected')

    def on_disconnect(self):
        logging.info('Disconnected')

    def on_message(self, request):
        handler = self.injector.get(RequestHandler)
        response = handler.process_request(request)
        socketio.emit(EVENT_NAME, response, namespace=NS, callback=lambda: logging.info('ACK'))


@socketio.on_error_default
def default_error_handler(error):
    Adapter.instance.on_error(error)


@socketio.on('connect', namespace=NS)
def test_connect():
    Adapter.instance.on_connect()


@socketio.on('disconnect', namespace=NS)
def test_disconnect():
    Adapter.instance.on_disconnect()


@socketio.on(EVENT_NAME, namespace=NS)
def handle_message(message):
    Adapter.instance.on_message(message)


@inject(app=flask.Flask, injector=Injector)
class SocketModule(Module):

    def __init__(self):
        # TODO(burdon): Move to action.
        self.app.add_url_rule('/ping', 'ping', self.ping)

        # NOTE: Injector cannot be used during module set-up (otherwise context error).
        Adapter.instance = Adapter(self.injector)

        socketio.init_app(self.app)

    # Respond asynchronously to connected client.
    @staticmethod
    def ping():
        # Trigger async response.
        socketio.emit(EVENT_NAME, {'data': 'PONG'}, namespace=NS)
        return flask.json.jsonify({})
