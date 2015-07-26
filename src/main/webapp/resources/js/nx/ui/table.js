// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular'], function(angular) {

	return angular.module('nx.ui.table', [])

    /**
     * <ui-table data="NAME"></ui-table>
     */
    .directive('uiTable', function() {
      return {
        controller: 'TableController',
        templateUrl: '/res/js/nx/ui/table.html',
        scope: {
          data: '@data' // Bind the element's attribute to the scope.
        }
      }
    })

    .controller('TableController', ['$injector', '$scope', function($injector, $scope) {
      $scope.rows = $scope.data && $injector.get($scope.data);
//    $scope.$watch('rows', function() {}, true);
    }]);

});
