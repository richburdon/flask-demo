// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('nx.ui.status', [])

    .controller('StatusController', ['$scope', function($scope) {
      $scope.message = 'StatusController';
    }]);

});
