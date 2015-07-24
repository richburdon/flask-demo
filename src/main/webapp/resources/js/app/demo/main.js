// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(
  [
    'angular',
    'angular-ui-router',
    'view/home/view',
    'view/test/view'
  ], function(angular) {

  // TODO(burdon): How to trigger update when values change ($watch: https://docs.angularjs.org/api/ng/type/$rootScope.Scope)
  // TODO(burdon): Get from server in global JS variable.
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

  // Define the main app.
	return angular.module('demo',
    [
      'ui.router',
      'demo.view.home',
      'demo.view.test'
    ])

    // Provide App Data.
    .factory('app_info', function() {
      return APP_INFO;
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
