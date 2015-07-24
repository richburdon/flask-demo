// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('ui.status', [])

    .controller('StatusController', ['$scope', function($scope) {
      $scope.message = 'StatusController';
    }]);

});
