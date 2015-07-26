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

    // TODO(burdon): Get from server in global JS variable.
    // TODO(burdon): Util to manage array as sorted map.
    var APP_INFO = [
      {
        key: 'App',
        value: 'Demo'
      },
      {
        key: 'Version',
        value: '0.0.1'
      }
    ];



    // TODO(burdon): Socket test.
    // https://github.com/socketio/socket.io-client
    var socket = io.connect('http://localhost:5000/nx'); // TODO(burdon): Config from global vars.
    socket.on('connect', function() {
      console.log('Connected');
      console.log('Sending...');
      socket.emit('MyEvent', { data: 'test' });
    });
    socket.on('disconnect', function() {
      console.log('Disconnected');
    });
    socket.on('MyEvent', function(data, ack) {
      console.log('Received: ' + JSON.stringify(data));
      ack();
    });




    // Define the main app.
    return angular.module('demo',
      [
        'ui.router',
        'demo.view.home',
        'demo.view.test'
      ])

      // Provide App Data.
      .factory('AppInfo', function() {
        return APP_INFO;
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
