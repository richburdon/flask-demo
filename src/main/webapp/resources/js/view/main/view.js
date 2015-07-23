// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular', 'angular-route', 'ui/graph'], function(angular) {

	return angular.module('demo.view.main', ['ngRoute', 'ui.graph'])

    .config(['$routeProvider', function($routeProvider) {
      $routeProvider.when('/view/main', {
        templateUrl: '/res/js/view/main/view.html',
        controller: 'MainViewController'
      });
    }])

    .controller('MainViewController', [function() {

      // TODO(burdon): Config buttons.

    }]);

});

  /*
  var model = new GraphModel('/data');
  var view = $('.x-d3').new GraphView().setModel(model);

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
