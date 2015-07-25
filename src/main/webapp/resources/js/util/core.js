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

});
