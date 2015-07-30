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

      $scope.add = function() {
        model.add();
      };

      $scope.start = function() {
        robot.start();
      };

      $scope.stop = function() {
        robot.stop();
      };

      $scope.ping = function() {
        $.get('/notify');
      };

      // Test robot
      var Robot = function() {
        this._interval = null;
      };
      Robot.prototype.start = function() {
        this.stop();
        this._interval = setInterval(function() {
          model.add();
        }, 200);
      };
      Robot.prototype.stop = function() {
        clearInterval(this._interval);
        this._interval = null;
      };
      var robot = new Robot();

    }]);

});
