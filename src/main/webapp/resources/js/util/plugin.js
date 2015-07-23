// Copyright 2015 Alien Laboratories, Inc.

define(['jquery'], function() {

  var Trigger = function(callback, delay) {
    this.timeout = null;
    this.callback = callback;
    this.delay = delay || 0;
  };

  Trigger.prototype.fire = function() {
    var self = this;

    if (self.timeout) {
      window.clearTimeout(self.timeout);
    }

    self.timeout = window.setTimeout(function() {
      self.timeout = null;
      self.callback();
    }, self.delay);
  };

  $.trigger = function(callback, delay) {
    return new Trigger(callback, delay);
  };

});
