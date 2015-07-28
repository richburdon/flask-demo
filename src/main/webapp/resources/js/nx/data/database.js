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

  NS.Database._executeQuery = function(query) {
    var self = this;
    // TODO(burdon): Track pending queries (for routing).
    self._proxy.send({
      query: query._spec
    });
  };

  NS.Database.prototype.createQuery = function(callback) {
    var self = this;
    return new NS.Query(self, callback);
  };

  NS.Query = function(database, callback) {
    var self = this;
    self._database = database;
    self._callback = callback;
    self._spec = {
      id: new Date().getTime()
    };
  };

  NS.Query.prototype.execute = function() {
    var self = this;
    self._executeQuery(self);
  };

  return NS;
});
