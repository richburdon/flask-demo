// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('ui.graph', [])

    .controller('GraphController', ['$scope', function($scope) {
      $scope.message = 'GraphController';
    }]);

});
