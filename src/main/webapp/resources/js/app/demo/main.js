// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(
  [
    'socketio',
    'angular',
    'angular-ui-router',
    'view/home/view',
    'view/test/view'
  ], function(io) {

    // TODO(burdon): Create options server page to configure app.
    // TODO(burdon): Create network abstraction (Proxy) for Request/Response and inject this (wraps all ajax/socket IO)
    // https://github.com/socketio/socket.io-client
    if ($.nx.queryParam('test')) {
      console.log('Configuring websockest...');

      // TODO(burdon): Get URL form config (with namespace) if server is configured for websocket.
      var socket = io.connect(window['__APP_CONFIG__'].app.server + '/nx');

      socket.on('connect', function() {
        console.log('Connected');
        console.log('Sending...');
        socket.emit('MyEvent', {data: 'test'});
      });

      socket.on('disconnect', function() {
        console.log('Disconnected');
      });

      // TODO(burdon): Extract event type names as constant (part of __APP_CONFIG__?).
      socket.on('MyEvent', function(data, ack) {
        console.log('Received: ' + JSON.stringify(data));
        ack && ack();
      });
    }

    // Define the main app.
    return angular.module('demo',
      [
        'ui.router',
        'demo.view.home',
        'demo.view.test'
      ])

      // Provide App Data.
      .factory('AppInfo', ['GraphModel', function(model) {
        // TODO(burdon): Wrap AppConfig with object.
        var app = window['__APP_CONFIG__']['app'];
        model.addListener(function() {
          app.nodes = model.graph.nodes.length;
        });

        return app;
      }])

      // Graph Model.
      .factory('GraphModel', [function() {
        var model = new nx.ui.graph.GraphModel();
        model.load();
        return model;
      }])

      .config(['$urlRouterProvider', '$stateProvider',
        function($urlRouterProvider, $stateProvider) {

          $urlRouterProvider
            // Redirect if the url is invalid.
            .otherwise('/home');

          // http://angular-ui.github.io/ui-router/site/#/api/ui.router
          $stateProvider
            .state('home', {
              url: '/home',
              templateUrl: '/res/js/view/home/view.html',
              controller: 'MainViewController'
            })
            .state('test', {
              url: '/test',
              templateUrl: '/res/js/view/test/view.html',
              controller: 'TestViewController'
            });
        }
      ])

      // Set initial state.
      .run(['$state', function($state) {
        $state.transitionTo('home');
      }]);

});
