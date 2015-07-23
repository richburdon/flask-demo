// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular', 'angular-route', 'view/main/view'], function(angular) {

  // Define the main app.
	return angular.module('demo', ['ngRoute', 'demo.view.main'])

    .config(['$routeProvider', function($routeProvider) {
		  $routeProvider.otherwise({
        redirectTo: '/view/main'
      });
	  }]);

});
