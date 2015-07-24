// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('demo.view.home.controls', [])

    .controller('ControlsController', ['$scope', function($scope) {

      $scope.test = function() {
        console.log('TEST');
      };

      /*
      $('button.x-reset').click(function() {
        model.clear();
      });

      $('button.x-load').click(function() {
        model.load();
      });

      $('button.x-create').click(function() {
        model.post();
      });

      $('button.x-refresh').click(function() {
        view.refresh();
      });
      */

    }]);

});
