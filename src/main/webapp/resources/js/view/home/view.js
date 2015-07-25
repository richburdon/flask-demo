// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define([
    'angular',
    'view/home/menu',
    'ui/table',
    'ui/status',
    'ui/graph'
  ], function(angular) {

	return angular.module('demo.view.home', [
      'demo.view.home.menu',
      'ui.table',
      'ui.status',
      'ui.graph'
    ])

    .controller('MainViewController', ['$scope', 'AppInfo', function($scope, info) {

      // TODO(burdon): Trigger update to App Info.
      var KEY = 'Update';
      setInterval(function() {
        var kv = null;
        $.each(info, function(i, test) {
          if (test.key == KEY) {
            kv = test;
            return true;
          }
        });
        if (!kv) {
          kv = {
            key: KEY
          };
          info.push(kv);
        }
        kv.value = new Date().getTime();
        $scope.$digest();
      }, 1000);

    }]);

});
