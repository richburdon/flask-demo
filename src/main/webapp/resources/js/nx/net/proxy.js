// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['socketio', 'nx/util/core'], function() {
  var NS = $.nx.namespace('nx.net.proxy');

  // TODO(burdon): Rename Channel?
  // TODO(burdon): Enable routing by event/namespace/room? (e.g., database, etc.) Part of message payload.
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
    console.log('Received: %o', data);
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

  NS.AjaxProxy.prototype.toString = function() {
    return 'AjaxProxy()';
  };

  NS.AjaxProxy.prototype.send = function(data) {
    var self = this;
    console.log('Sending: %o', data);
    $.ajax({
      type: 'POST',
      url: self._url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(data),
      success: function(data, status, xhr) {
        // TODO(burdon): Error handling.
        self._fireCallback(data);
      }
    });
  };

  /**
   * WebSocket proxy.
   * https://github.com/socketio/socket.io-client
   */
  NS.WebSocketsProxy = $.nx.extend(NS.Proxy, function(url) {
    console.log('Connecting...', url);
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
    });
  });

  NS.WebSocketsProxy.EVENT_TYPE = 'Message';

  NS.WebSocketsProxy.prototype.toString = function() {
    return 'WebSocketsProxy()';
  };

  NS.WebSocketsProxy.prototype.send = function(data) {
    var self = this;
    console.log('Sending: %o', data);
    self._socket.emit(NS.WebSocketsProxy.EVENT_TYPE, data);
  };

  return NS;
});
