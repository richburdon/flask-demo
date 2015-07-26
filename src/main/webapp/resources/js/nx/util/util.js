// Copyright 2014 Alien Laboratories, Inc.

define(['nx/util/core'], function() {
  var NS = $.nx.namespace('nx.util');

  /**
   * Manages a collection of listener callbacks.
   * @constructor
   */
  NS.Listeners = function() {
    var self = this;

    self._listeners = [];
    self._fire = $.nx.defer(self._fireListeners.bind(self), 0);
  };

  /**
   * Adds the listener.
   * @param listener
   * @returns {*}
   */
  NS.Listeners.prototype.addListener = function(listener) {
    var self = this;

    self._listeners.push($.nx.assert(listener));
    return self;
  };

  /**
   * Removes the listener.
   * @param listener
   */
  NS.Listeners.prototype.removeListener = function(listener) {
    var self = this;

    $.nx.assert(listener);
    $.each(self._listeners, function(i, l) {
      if (l == listener) {
        self._listeners.splice(i, 1);
        return false;
      }
    });
  };

  /**
   * Fire the listeners; passes all arguments to each listener.
   * NOTE: only called once per stack.
   */
  NS.Listeners.prototype.fireListeners = function() {
    var self = this;

    self._fire.apply(self, arguments);
  };

  NS.Listeners.prototype._fireListeners = function() {
    var self = this;

    // Preserve arguments.
    var args = Array.prototype.slice.call(arguments, 0);
    $.each(self._listeners, function(i, listener) {
      listener.apply(self, args);
    });
  }

});