#
# Copyright 2015 Alien Laboratories, Inc.
#

from flask_oauthlib.client import OAuth
from injector import Module, inject

from oauth import OAuthService, OAuthServiceManager


@inject(oauth=OAuth)
class TwitterModule(Module):
    """
    Configures Twitter services.
    """

    SERVICE = 'twitter'
    ADMIN_URL = 'https://apps.twitter.com/app/8619350'

    def configure(self, binder):

        # OAuth config: https://dev.twitter.com/web/sign-in/implementing
        remote = self.oauth.remote_app(
            TwitterModule.SERVICE,
            app_key='TWITTER',  # Reference conf.
            base_url='https://api.twitter.com/1/',
            request_token_url='https://api.twitter.com/oauth/request_token',
            access_token_url='https://api.twitter.com/oauth/access_token',
            authorize_url='https://api.twitter.com/oauth/authenticate')

        service = OAuthService(OAuthServiceManager.SERVICE, remote)
        binder.bind(OAuthServiceManager.SERVICE, {TwitterModule.SERVICE: service})
