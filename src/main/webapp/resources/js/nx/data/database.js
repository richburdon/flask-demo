// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['nx/util/core'], function() {
  var NS = $.nx.namespace('nx.data.database');

  // TODO(burdon): Port from alien/frontend.

  NS.Database = function(proxy) {
    var self = this;

    // TODO(burdon): Is the database the only communicator? Split out by namespace?
    // If namespace extend to AJAX-only (i.e., part of message header).
    self._proxy = proxy;
    self._proxy.setCallback(function(message) {
      console.log('INBOUND:', message);
    });
  };

  NS.Query = function() {};

  return NS;
});
