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


    // TODO(burdon): Socket test.
    // https://github.com/socketio/socket.io-client
    if ($.nx.queryParam('test')) {
      // TODO(burdon): Get from AppInfo
      var socket = io.connect('http://' + window['__APP_CONFIG__'].app.server + '/nx');

      socket.on('connect', function() {
        console.log('Connected');
        console.log('Sending...');
        socket.emit('MyEvent', {data: 'test'});
      });

      socket.on('disconnect', function() {
        console.log('Disconnected');
      });

      socket.on('MyEvent', function(data, ack) {
        console.log('Received: ' + JSON.stringify(data));
        ack();
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
      .factory('AppInfo', function() {
        // TODO(burdon): Wrap AppConfig with object.
        return window['__APP_CONFIG__']['app'];
      })

      // Graph Model.
      .factory('GraphModel', function() {
        var model = new nx.ui.graph.GraphModel();
        model.load();
        return model;
      })

      .config([
        '$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {

          $urlRouterProvider
            // Redirect if the url is ever invalid.
            .otherwise('/home');

          // http://angular-ui.github.io/ui-router/site/#/api/ui.router
          // https://github.com/angular-ui/ui-router/wiki
          // https://github.com/angular-ui/ui-router/blob/master/sample/app/app.js

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
