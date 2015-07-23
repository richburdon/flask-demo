// Copyright 2015 Alien Laboratories, Inc.

'use strict';

//
// Configuration
//
// Combine jquery with angular.
// https://github.com/tnajdek/angular-requirejs-seed/tree/master/app
// http://stackoverflow.com/questions/16108207/does-angularjs-support-amd-like-requirejs
//
require.config({

  baseUrl: '/res/js',

  // http://stackoverflow.com/questions/23112316/using-flask-how-do-i-modify-the-cache-control-header-for-all-output
  //urlArgs: "nocache=" + new Date().getTime(),

  paths: {
    'angular':        '../lib/angular/angular',
    'angular-route':  '../lib/angular-route/angular-route',
    'd3':             '../lib/d3/d3',
    'jquery':         '../lib/jquery/dist/jquery'
  },

	shim: {
    'angular': {
      'exports': 'angular'
    },
		'angular-route': ['angular']
  },

  priority: [
		'angular'
	]

});

//
// App
//
require(['jquery', 'angular', 'app/demo/main'], function(jquery, angular) {

  // Wait for DOM.
  angular.element($('#app')[0]).ready(function() {
    console.log('Starting...');

    // Manually start the app.
    // https://docs.angularjs.org/guide/bootstrap
    angular.bootstrap(document, ['demo']);

    console.log('OK');
  });

});
