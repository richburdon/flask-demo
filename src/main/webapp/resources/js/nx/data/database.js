// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['nx/util/core'], function() {
  var NS = $.nx.namespace('nx.data.database');

  // TODO(burdon): Port from alien/frontend.

  NS.Database = function(proxy) {
    var self = this;

    // Routing tables.
    self._queryMap = {};
    self._mutationMap = {};

    // If namespace extend to AJAX-only (i.e., part of message header).
    self._proxy = proxy;
    self._proxy.setCallback(function(message) {

      // Handle query results.
      if (message['query_result']) {
        // TODO(burdon): Route to query.
        $.each(self._queryMap, function(id, query) {
          query._callback(message['query_result']);
        });
        delete self._queryMap[message['query_result']['query_id']];
      }

      // Handle mutation acks.
      if (message['mutation_result']) {
        var mutation = self._mutationMap[message['mutation_result']['mutation_id']];
        delete self._queryMap[message['mutation_result']['mutation_id']];
        mutation && mutation._callback && mutation._callback();
      }
    });
  };

  NS.Database.prototype._executeQuery = function(query) {
    var self = this;
    self._queryMap[$.nx.assert(query._spec.id)] = query;
    self._proxy.send({
      query: query._spec
    });
  };

  NS.Database.prototype._executeMutation = function(mutation) {
    var self = this;
    self._mutationMap[$.nx.assert(mutation._spec.id)] = mutation;
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

  // TODO(burdon): Cannot be called twice.
  NS.Mutation.prototype.commit = function(opt_callback) {
    var self = this;
    self._callback = opt_callback;
    self._database._executeMutation(self);
  };

  return NS;
});
