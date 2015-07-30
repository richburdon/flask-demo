#
# Copyright 2015 Alien Laboratories, Inc.
#

import logging
import flask
import flask.views
from injector import Module, inject, singleton
from flask.ext.socketio import SocketIO

from data import RequestHandler, Notifier


# TODO(burdon): Export to JS client.
NS = '/nx'
EVENT = 'Message'


@singleton
@inject(socketio=SocketIO, handler=RequestHandler)
class SocketHandler(object):

    def __init__(self):
        logging.info('Initializing WebSockets...')
        self.socketio.on_error_default(self.on_error)
        self.socketio.on('connect', namespace=NS)(self.on_connect)
        self.socketio.on('disconnect', namespace=NS)(self.on_disconnect)
        self.socketio.on(EVENT, namespace=NS)(self.on_message)

    @staticmethod
    def on_error(error):
        logging.error(error)

    @staticmethod
    def on_connect():
        logging.info('Connected')

    @staticmethod
    def on_disconnect():
        logging.info('Disconnected')

    def on_message(self, request):
        logging.info('Received')
        response = self.handler.process_request(request)
        logging.info('Responding...')
        self.socketio.emit(EVENT, response, namespace=NS, callback=lambda: logging.info('ACK'))


@singleton
@inject(socketio=SocketIO)
class SocketNotifier(Notifier):

    def notify(self, message={}):
        # TODO(burdon): Pass list of invalidated query/versions.
        logging.info('Notify...')
        # self.socketio.emit(EVENT, message, broadcast=True)  # TODO(burdon): Not working?
        self.socketio.emit(EVENT, message, namespace=NS)  # NOTE: Does broadcast.


@inject(app=flask.Flask)
class SocketModule(Module):

    def configure(self, binder):
        binder.bind(SocketIO, SocketIO(self.app))
        binder.bind(Notifier, SocketNotifier)
