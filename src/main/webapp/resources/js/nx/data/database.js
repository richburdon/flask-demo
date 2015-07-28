// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['nx/util/core'], function() {
  var NS = $.nx.namespace('nx.data.database');

  // TODO(burdon): Port from alien/frontend.

  NS.Database = function(proxy) {
    var self = this;

    // Routing table for queries.
    self._queryMap = {};

    // TODO(burdon): Is the database the only communicator? Split out by namespace?
    // If namespace extend to AJAX-only (i.e., part of message header).
    self._proxy = proxy;
    self._proxy.setCallback(function(message) {
      // TODO(burdon): Routing: get query ID from response and route to individual query. Need proto.
      // TODO(burdon): Mutation should trigger queries from server. Ignore here (otherwise empty).
      $.each(self._queryMap, function(id, query) {
        query._callback(message);
      });
    });
  };

  NS.Database.prototype._executeQuery = function(query) {
    var self = this;
    // TODO(burdon): Track pending queries (for routing).
    self._queryMap[query.id] = query;
    self._proxy.send({
      query: query._spec
    });
  };

  NS.Database.prototype._executeMutation = function(mutation) {
    var self = this;
    // TODO(burdon): Track pending queries (for routing).
    self._proxy.send({
      mutation: mutation._spec
    });
  };

  NS.Database.prototype.createQuery = function(callback) {
    var self = this;
    return new NS.Query(self, callback);
  };

  NS.Database.prototype.createMutation = function() {
    var self = this;
    return new NS.Mutation(self);
  };

  /**
   *
   * @param database
   * @param callback
   * @constructor
   */
  NS.Query = function(database, callback) {
    var self = this;
    self._database = $.nx.assert(database);
    self._callback = $.nx.assert(callback);
    self._spec = {
      id: new Date().getTime()
    };
  };

  NS.Query.prototype.execute = function() {
    var self = this;
    self._database._executeQuery(self);
  };

  /**
   *
   * @param database
   * @constructor
   */
  NS.Mutation = function(database) {
    var self = this;
    self._database = $.nx.assert(database);
    self._spec = {
      id: new Date().getTime()
    };
  };

  NS.Mutation.prototype.commit = function() {
    var self = this;
    self._database._executeMutation(self);
  };

  return NS;
});
