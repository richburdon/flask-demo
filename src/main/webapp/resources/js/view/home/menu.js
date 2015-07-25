// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('demo.view.home.menu', [])

    .controller('MenuController', ['$scope', 'GraphModel', function($scope, model) {

      $scope.clear = function() {
        model.clear();
      };

      $scope.load = function() {
        model.load();
      };

    }]);

});
