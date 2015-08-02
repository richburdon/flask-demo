// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(
  [
    'angular',
    'angular-ui-router',
    'view/home/view',
    'view/test/view'
  ], function() {

    // TODO(burdon): Create options server page to configure app.
    // TODO(burdon): IOLogger panel/directive.

    // Define the main app.
    return angular.module('demo',
      [
        'ui.router',
        'view.home',
        'view.test'
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
