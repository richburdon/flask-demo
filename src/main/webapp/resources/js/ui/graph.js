// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular', 'd3', 'util/plugin'], function(angular) {

  // https://docs.angularjs.org/guide/directive
  // http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-6-using-controllers
  // https://github.com/allenhwkim/angularjs-google-maps/blob/master/directives/map.js

  // TODO(burdon): Keep Graph Control pure from Angular? Managed by Angular controller. Factor out?
  // TODO(burdon): Init Graph with attrs?
  var GraphControl = function(root) {
    this.root = $(root);
    this.svg = d3.select(this.root[0]).select('svg');

    // Model.
    // TODO(burdon): Binding ($watch?)
    this.model = {
      nodes: [],
      links: []
    };

    // https://github.com/mbostock/d3/wiki/Force-Layout
    this.force = d3.layout.force()
      .linkDistance(50)
      .charge(-400)
      .on('tick', this.tick.bind(this));

    // SVG elements.
    this.node = this.svg.selectAll('.node');
    this.link = this.svg.selectAll('.link');

    // Resize handler.
    d3.select(window).on('resize', $.defer(this.resize.bind(this), 100));
    this.resize();

    // TODO(burdon): Remove.
    var self = this;
    d3.json('/res/data/test.json?ts' + new Date().getTime(), function(error, model) {
      if (error) throw error;
      self.update(model);
    });
  };

  /**
   * Resize the SVG element to expand to its container.
   */
  GraphControl.prototype.resize = function() {
    var parent = this.root.parent();
    var width = parent.width();
    var height = parent.height();

    this.svg
      .attr('width', width)
      .attr('height', height);

    this.force.size([width, height]);

    this.start();
  };

  /**
   * D3 force ticker.
   */
  GraphControl.prototype.tick = function() {
    this.link
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    this.node
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  };

  /**
   * Start the force.
   */
  GraphControl.prototype.start = function() {

    // https://github.com/mbostock/d3/wiki/Force-Layout#links
    this.link = this.link.data(this.model.links, function(d) { return d.source.id + '-' + d.target.id; });
    this.link
      .enter()
      .insert('line', '.node')
        .attr('class', 'link');
    this.link
      .exit()
        .remove();

    // TODO(burdon): Set initial position at center (or parent).
    this.node = this.node.data(this.model.nodes, function(d) { return d.id; });
    this.node
      .enter()
      .append('circle')
        .attr('class', function(d) { return 'node g-' + d.group; })
        .attr('r', 16);
    this.node
      .exit()
        .remove();

    this.force.start();
  };

  /**
   * Set model.
   * @param model
   */
  GraphControl.prototype.update = function(model) {
    console.log('update: %o', model);

    this.model = model;

    // Preserve current x, y coordinates.
    var node_map = {};
    var nodes = this.force.nodes();
    var node;
    var i;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      node_map[node.id] = node;
    }
    for (i = 0; i < model.nodes.length; i++) {
      node = model.nodes[i];
      var current = node_map[node.id];
      if (current) {
        node.x = current.x;
        node.y = current.y;
        node.px = current.px;
        node.py = current.py;
      }
    }

    this.force
      .nodes(model.nodes)
      .links(model.links)
      .start(); // NOTE: start() converts link source/target indexes to objects.

    this.start();
  };

	return angular.module('ui.graph', [])

    .controller('GraphController', ['$scope', '$element', function($scope, $element) {
      $scope.graph = new GraphControl($element);
    }])

    .directive('uiGraph', [function() {
      return {
        template: '<svg></svg>',

        controller: 'GraphController',

        link: function(scope, element, attrs, ctrl) {
          console.log('scope', scope);
          console.log('element', element);
          console.log('attrs', attrs);
          console.log('ctrl', ctrl);
        }
      }
    }]);

});
