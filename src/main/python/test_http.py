#
# Copyright 2014 Alien Laboratories, Inc.
#

import unittest

import requests
import requests.packages.urllib3
import httpretty


class Test(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    @httpretty.activate
    def test_sanity(self):
        self.assertTrue(True)

        httpretty.register_uri(httpretty.GET, 'http://richburdon.com/request', body='Demo')

        response = requests.get('http://richburdon.com/request')
        self.assertEqual(response.text, 'Demo')
