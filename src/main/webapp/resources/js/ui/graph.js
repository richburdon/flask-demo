// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular', 'd3', 'util/plugin'], function(angular) {

  // TODO(burdon): Split Control(View?)/Model and Controller (pattern). In same directory?

  // https://docs.angularjs.org/guide/directive
  // http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-6-using-controllers
  // https://github.com/allenhwkim/angularjs-google-maps/blob/master/directives/map.js

  var GraphModel = function() {
    this.graph = {
      nodes: [],
      links: []
    };

    // TODO(burdon): Util.
    this.listeners = [];
  };

  GraphModel.prototype.addListener = function(listener) {
    this.listeners.push(listener);
  };

  GraphModel.prototype.fireListeners = function(event) {
    $.each(this.listeners, function(i, listener) {
      listener(event);
    })
  };

  GraphModel.prototype.clear = function() {
    this.graph = {
      nodes: [],
      links: []
    };
    this.fireListeners();
  };

  GraphModel.prototype.load = function() {
    var self = this;
    // TODO(burdon): Use jquery.
    d3.json('/res/data/test.json?ts' + new Date().getTime(), function(error, graph) {
      if (error) throw error;
      self.graph = graph;
      self.fireListeners();
    });
  };

  GraphModel.prototype.load_remote = function() {
    var self = this;
    d3.json('/data', function(error, graph) {
      if (error) throw error;

      // TODO(burdon): Create D3 wrapper.
      var node_map = {};
      var i;
      for (i = 0; i < graph.nodes.length; i++) {
        var node = graph.nodes[i];
        node_map[node.id] = node;
      }

      // Map IDs to objects (D3 can handle objects or indexed by not IDs).
      for (i = 0; i < graph.links.length; i++) {
        var link = graph.links[i];
        link.source = node_map[link.source];
        link.target = node_map[link.target];
      }

      self.fireListeners();
    });
  };

  GraphModel.prototype.post = function() {
    var self = this;
    $.ajax({
      type: 'POST',
      url: '/data',
      dataType: 'json',
      data: {},
      success: function() {
        self.load_remote();
      }
    });
  };

  // TODO(burdon): Keep Graph Control pure from Angular? Managed by Angular controller. Factor out?
  // TODO(burdon): Init Graph with attrs?
  var GraphControl = function(root) {

    // Get elements.
    this.root = $(root);
    this.svg = d3.select(this.root[0]).select('svg');

    // Model.
    this.model = null;

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
  };

  /**
   * Sets the model.
   * @param model
   * @returns {GraphControl}
   */
  GraphControl.prototype.setModel = function(model) {
    // TODO(burdon): Unlink existing.
    this.model = model;
    this.model.addListener(this.update.bind(this));
    return this;
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
    var links = this.model && this.model.graph.links || [];
    var nodes = this.model && this.model.graph.nodes || [];

    // https://github.com/mbostock/d3/wiki/Force-Layout#links
    this.link = this.link.data(links, function(d) { return d.source.id + '-' + d.target.id; });
    this.link
      .enter()
      .insert('line', '.node')
        .attr('class', 'link');
    this.link
      .exit()
        .remove();

    // TODO(burdon): Set initial position at center (or parent).
    this.node = this.node.data(nodes, function(d) { return d.id; });
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
   */
  GraphControl.prototype.update = function() {
    var links = this.model && this.model.graph.links || [];
    var nodes = this.model && this.model.graph.nodes || [];

    // Preserve current x, y coordinates.
    var node_map = {};
    var current_nodes = this.force.nodes();
    var node;
    var i;
    for (i = 0; i < current_nodes.length; i++) {
      node = current_nodes[i];
      node_map[node.id] = node;
    }
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      var current = node_map[node.id];
      if (current) {
        node.x = current.x;
        node.y = current.y;
        node.px = current.px;
        node.py = current.py;
      }
    }

    this.force
      .links(links)
      .nodes(nodes)
      .start(); // NOTE: start() converts link source/target indexes to objects.

    this.start();
  };

	return angular.module('ui.graph', [])

    // TODO(burdon): Move to main. Defaults? What if unbound?
    .factory('GraphModel', function() {
      return new GraphModel();
    })

    .controller('GraphController', ['$scope', '$element', 'GraphModel', function($scope, $element, model) {
      $scope.graph = new GraphControl($element).setModel(model);
      // TODO(burdon): Connect to controls.
      model.load();
    }])

    .directive('uiGraph', [function() {
      return {
        template: '<svg></svg>',
        controller: 'GraphController'
      }
    }]);

});
