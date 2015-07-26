// Copyright 2015 Alien Laboratories, Inc.

define(['jquery'], function() {

  /**
   * NX global extensions.
   * WARNING: Same namespace as widgets. (e.g., $.nx.widget).
   *
   * @param el
   * @returns {*|jQuery}
   */
  $.nx = function(el) {
    return $(el).nx();
  };

  /**
   * Wraps console.assert
   * NOTE: does not stop execution in chrome.
   *
   * @returns {*}
   */
  $.nx.assert = function() {
    // TODO(burdon): Doesn't always show full stack?
    console.assert.apply(console, arguments);
//  if (!arguments[0]) { console.log(new Error().stack); }
    if (!arguments[0]) { throw new Error(); }
    return arguments[0];
  };

  /**
   * Sets the value to the given dot-path subtree of the parent object.
   *
   * @param obj         Object to set.
   * @param path        Array of part names, or ot-path of variable to set.
   * @param value       Value to set.
   * @param [opt_merge] True if (object) value should be merged (otherwise replace).
   */
  $.nx.set = function(obj, path, value, opt_merge) {
    $.nx.assert(obj, path);

    // Create intermediate objects if missing.
    var parts = $.isArray(path) ? path : path.split('.');
    for (var i = 0; i < parts.length - 1; i++) {
      var part = parts[i];
      if (obj[part] === undefined) {
        // Create intermediate object.
        obj[part] = {};
      }

      obj = obj[part];
    }

    // Set or merge value.
    part = parts[i];
    if (opt_merge && obj[part] !== undefined && $.type(value) === 'object') {
      // Merge value.
      $.extend(obj[part], value);
    } else {
      // Set value.
      obj[part] = value;
    }

    return obj[part];
  };

  /**
   * Create a namespace.
   * Example:
   * var NS = $.nx.namespace('foo.bar');
   *
   * @param ns Dot separated namespace.
   */
  $.nx.namespace = function(ns) {
    return $.nx.set(window, $.nx.assert(ns), {}, true);
  };

  /**
   * Class inheritance.
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript
   * http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
   * https://github.com/google/closure-library/blob/master/closure/goog/base.js
   * http://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class
   *
   * See Backbone.extend
   *
   * var Foo = function(name) {
   *   var self = this;
   * };
   * Foo.prototype.foo = function() {};
   *
   * var Bar = $.nx.extend(Foo, function(name, count) {
   *   var self = Bar.super(this, name);
   * });
   * Bar.prototype.foo = function() {
   *   Bar._super.foo.call(self);
   * };
   *
   * @param base Base class constructor.
   * @param constructor Constructor function.
   */
  // TODO(burdon): Allow for multiple inheritance.
  $.nx.extend = function(base, constructor) {
    // Class being extended.
    constructor = constructor || function() {};
    constructor.prototype = Object.create(base.prototype);
    constructor.prototype.constructor = constructor;

    // Convenience proprety.
    constructor._super = base.prototype;

    // Super constructor method.
    // See jquery-ui $.widget().
    constructor.super = function(self) {
      base.prototype.constructor.apply(self, Array.prototype.slice.call(arguments, 1));
      return arguments[0];
    };

    return constructor;
  };

  /**
   * Returns a functor that calls the callback after a delay.
   * Subsequent calls cancel any pending callbacks.
   *
   * @param callback (e.g., self.foo.bind(self) to call member function).
   * @param delay Defaults to 1000 ms.
   * @returns {Function}
   */
  $.nx.defer = function(callback, delay) {
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
