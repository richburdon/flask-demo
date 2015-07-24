// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('ui.table', [])

    .controller('TableController', ['$scope', 'data', function($scope, data) {
      $scope.data = data;
    }])

    // https://docs.angularjs.org/guide/directive
    .directive('uiTable', function() {
      return {
        templateUrl: '/res/js/ui/table.html'
      }
    });

});
