// Copyright 2015 Alien Laboratories, Inc.

define(['jquery'], function() {

  /**
   * Returns a functor that calls the callback after a delay.
   * Subsequent calls cancel any pending callbacks.
   *
   * @param callback (e.g., self.foo.bind(self) to call member function).
   * @param delay Defaults to 1000 ms.
   * @returns {Function}
   */
  $.defer = function(callback, delay) {
    delay = delay || 0;

    var timeout = null;
    return function() {
      // Preserve arguments.
      var args = Array.prototype.slice.call(arguments, 0);

      // Cancel previous calls.
      if (timeout) {
        window.clearTimeout(timeout);
      }

      // Set timeout.
      timeout = window.setTimeout(function() {
        timeout = null;
        callback.apply(null, args);
      }, delay);
    }
  }

});
