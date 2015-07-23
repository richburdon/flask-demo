#
# Copyright 2015 Alien Laboratories, Inc.
#

from flask import Flask
from injector import Module, inject, singleton
import os
import re
import subprocess


@singleton
class Config(object):
    def __init__(self, neo_url):
        self.title = 'Neo Demo'
        self.neo_url = neo_url


@singleton
class DevConfig(Config):

    def __init__(self):
        # TODO(burdon): Allow user to spec any IP (not docker) in case running neo locally.
        # Assume neo is running in a local VM.
        host = os.environ.get('DOCKER_HOST')
        if host:
            neo_url = re.match(r'(.*)://(.*):(.*)', host).group(1)
        else:
            # NOTE: When running from PyCharm, the DOCKER environment variable is not set.
            p = subprocess.Popen('/usr/local/bin/boot2docker ip', shell=True, stdout=subprocess.PIPE)
            neo_url = p.stdout.read().strip()
        super(DevConfig, self).__init__(neo_url + ':7474')


@singleton
class ProdConfig(Config):

    ENV = {
        # https://docs.docker.com/userguide/dockerlinks
        'NEO': 'NEO_PORT_7474_TCP_ADDR'
    }

    def __init__(self):
        neo_url = os.environ[ProdConfig.ENV['NEO']] + ':7474'
        super(ProdConfig, self).__init__(neo_url)


@inject(app=Flask)
class ConfigModule(Module):

    def configure(self, binder):
        if self.app.config['PROD']:
            config = ProdConfig()
        else:
            config = DevConfig()

        binder.bind(Config, to=config)