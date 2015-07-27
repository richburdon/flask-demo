// Copyright 2014 Alien Laboratories, Inc.

define(['nx/util/core'], function() {
  var NS = $.nx.namespace('nx.util.config');

  NS.Config = function(opt_obj) {
    var self = this;
    var obj = opt_obj || window[NS.Config.APP_CONFIG];
    self._obj = $.nx.assert(obj);
  };

  // Default global variable.
  NS.Config.APP_CONFIG = '__APP_CONFIG__';

  NS.Config.prototype.get = function(path, opt_default) {
    var self = this;
    return $.nx.get(self._obj, path, opt_default);
  };

  return NS;
});
