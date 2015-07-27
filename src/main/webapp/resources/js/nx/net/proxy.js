// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['socketio', 'nx/util/core'], function() {
  var NS = $.nx.namespace('nx.net.proxy');

  // TODO(burdon): Error handling.
  // TODO(burdon): Manage reconnection.
  // TODO(burdon): Message logger.

  /**
   * Abstract base class for proxies.
   * @constructor
   */
  NS.Proxy = function() {
    var self = this;
  };

  NS.Proxy.prototype.setCallback = function(callback) {
    var self = this;
    self._callback = callback;
  };

  NS.Proxy.prototype.send = function(data) {};

  NS.Proxy.prototype._fireCallback = function(data) {
    var self = this;
    console.log('Received: ' + JSON.stringify(data));
    // TODO(burdon): Buffer until callback is set?
    self._callback(data);
  };

  /**
   * Ajax proxy.
   */
  NS.AjaxProxy = $.nx.extend(NS.Proxy, function(url) {
    var self = NS.AjaxProxy.super(this);
    self._url = $.nx.assert(url);
  });

  NS.AjaxProxy.prototype.send = function(data) {
    var self = this;
    console.log('Sending: ' + JSON.stringify(data));
    $.ajax({
      type: 'POST',
      url: self._url,
      data: data,
      dataType: 'json',
      success: function(data, status, xhr) {
        self._fireCallback(data);
      }
    });
  };

  /**
   * WebSocket proxy.
   */
  NS.WebSocketsProxy = $.nx.extend(NS.Proxy, function(url) {
    var self = NS.WebSocketsProxy.super(this);

    // TODO(burdon): Provision unique ID from server to create room?
    self._socket = io.connect(url);

    self._socket.on('connect', function() {
      console.log('Connected');
    });

    // TODO(burdon): Buffer messages until reconnected?
    self._socket.on('disconnect', function() {
      console.log('Disconnected');
    });

    self._socket.on(NS.WebSocketsProxy.EVENT_TYPE, function(data, ack) {
      self._fireCallback(data);
      ack && ack();
    })
  });

  NS.WebSocketsProxy.EVENT_TYPE = 'Message';

  NS.WebSocketsProxy.prototype.send = function(data) {
    var self = this;
    console.log('Sending: ' + JSON.stringify(data));
    self._socket.emit(NS.WebSocketsProxy.EVENT_TYPE, data);
  };

  return NS;
});
