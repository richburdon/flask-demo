// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(
  [
    'angular',
    'angular-ui-router',
    'nx/data/database',
    'nx/net/proxy',
    'nx/util/config',
    'view/home/view',
    'view/test/view'
  ], function() {

    // TODO(burdon): Create options server page to configure app.
    // TODO(burdon): Create network abstraction (Proxy) for Request/Response and inject this (wraps all ajax/socket IO)
    // https://github.com/socketio/socket.io-client
    console.log('Configuring websockest...');

    // Define the main app.
    return angular.module('demo',
      [
        'ui.router',
        'demo.view.home',
        'demo.view.test'
      ])

      // Error handling.
      .factory('$exceptionHandler', function() {
        return function(exception, cause) {
          // TODO(burdon): Wrap with object.
          $('#app-debug').addClass('app-error');
          exception.message += ' (caused by "' + cause + '")';
          throw exception;
        };
      })

      // Config
      .factory('Config', [function() {
        return new nx.util.config.Config();
      }])

      // Database.
      .factory('Database', ['Proxy', function(proxy) {
        return new nx.data.database.Database(proxy);
      }])

      // Network proxy.
      .factory('Proxy', ['Config', function(config) {
        return new nx.net.proxy.AjaxProxy(config.get('app.server') + '/data');
//      return new nx.net.proxy.WebSocketsProxy(config.get('app.server') + '/nx');
      }])

      // App info.
      .factory('AppInfo', ['Config', 'GraphModel', function(config, model) {
        var app = config.get('app');
        model.addListener(function() {
          app.nodes = model._graph.nodes.length;
        });

        return app;
      }])

      // Graph Model.
      .factory('GraphModel', ['Database', function(database) {
        // TODO(burdon): Runtime param.
//      var model = new nx.ui.graph.TestGraphModel(database);
        var model = new nx.ui.graph.DatabaseGraphModel(database);
        model.load();
        return model;
      }])

      // App state machine.
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
