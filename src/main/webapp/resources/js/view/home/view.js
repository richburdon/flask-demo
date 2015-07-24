// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define([
    'angular',
    'view/home/controls',
    'ui/table',
    'ui/status',
    'ui/graph'
  ], function(angular) {

	return angular.module('demo.view.home', [
      'demo.view.home.controls',
      'ui.table',
      'ui.status',
      'ui.graph'
    ])

    // Specialize the TableController binding the app info provider.
    .controller('AppInfoTableController', ['$scope', '$controller', function($scope, $controller) {
      angular.extend(this, $controller('TableController', {$scope: $scope, data: $scope.app_info}));
    }])

    // Injects the app info (i.e., factory from main app).
    .controller('MainViewController', ['$scope', 'app_info', function($scope, app_info) {
      $scope.app_info = app_info;
    }]);

});
