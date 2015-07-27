// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define([
    'angular',
    'view/home/menu',
    'nx/ui/table',
    'nx/ui/status',
    'nx/ui/graph'
  ], function(angular) {

	return angular.module('demo.view.home', [
      'demo.view.home.menu',
      'nx.ui.table',
      'nx.ui.status',
      'nx.ui.graph'
    ])

    .controller('MainViewController', ['$scope', 'AppInfo', function($scope, info) {}]);

});
