#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import flask.views
from injector import Key, Module, inject, singleton

CONFIG = Key('configuration')


@singleton
@inject(app=flask.Flask)
class ConfigModule(Module):

    def configure(self, binder):
        binder.bind(CONFIG, {
            'app': {
                'name': 'Demo'
            },
            'client': {
                'debug': True
            }
        })
