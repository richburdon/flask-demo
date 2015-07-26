#
# Copyright 2015 Alien Laboratories, Inc.
#

import flask
import os
import re
import subprocess
from easydict import EasyDict
from injector import Module, inject, singleton


@singleton
@inject(app=flask.Flask)
class Config(object):

    def __init__(self):
        # Defaults.
        self.config = EasyDict({
            # Client configuration.
            'client': {
                'app': {
                    'name': self.app.config['APP_NAME'],
                    'server': flask.request.remote_addr + ':' + str(self.app.config['PORT'])
                }
            },
            # Service configurations.
            'service': {
            }
        })

        self.init()

    def __getitem__(self, index):
        obj = self.config
        for part in index.split('.'):
            obj = obj[part]
        return obj

    def init(self):
        pass


@singleton
class DevConfig(Config):

    def init(self):
        # TODO(burdon): Allow user to spec any IP (not docker) in case running neo locally.
        # Assume neo is running in a local VM.
        host = os.environ.get('DOCKER_HOST')
        if host:
            self.config.service.neo = re.match(r'(.*)://(.*):(.*)', host).group(1)
        else:
            # NOTE: When running from PyCharm, the DOCKER environment variable is not set.
            p = subprocess.Popen('/usr/local/bin/boot2docker ip', shell=True, stdout=subprocess.PIPE)
            neo_url = p.stdout.read().strip()
            self.config.service.neo = neo_url + ':7474'


@singleton
class ProdConfig(Config):

    def init(self):
        # https://docs.docker.com/userguide/dockerlinks
        self.config.service.neo = os.environ['NEO_PORT_7474_TCP_ADDR'] + ':7474'


@inject(app=flask.Flask)
class ConfigModule(Module):

    def configure(self, binder):
        if self.app.config['PROD']:
            binder.bind(Config, to=ProdConfig)
        else:
            binder.bind(Config, to=DevConfig)
