// Copyright 2015 Alien Laboratories, Inc.

'use strict';

define(['angular', 'd3', 'nx/util/callback'], function(angular) {
  var NS = $.nx.namespace('nx.ui.graph');

  angular.module('nx.ui.graph', [])

    /**
     * <ui-graph model="NAME"></ui-graph>
     */
    .directive('uiGraph', [function() {
      return {
        template: '<svg></svg>',
        controller: 'GraphController',
        scope: {
          bind: '@bind' // Bind the element's attribute to the scope.
        }
      }
    }])

    .controller('GraphController', ['$injector', '$scope', '$element', function($injector, $scope, $element) {
      var model = $scope.bind && $injector.get($scope.bind);
      $scope.graph = new NS.GraphControl($element).setModel(model);
    }]);

  // https://docs.angularjs.org/guide/directive
  // http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-6-using-controllers
  // https://github.com/allenhwkim/angularjs-google-maps/blob/master/directives/map.js

  // TODO(burdon): Base class for model.
  // TODO(burdon): Pass in query (shared) and mutator.
  NS.GraphModel = $.nx.extend(nx.util.callback.Listeners, function(database) {
    var self = NS.GraphModel.super(this);
    self._database = database;
    self._graph = {
      nodes: [],
      links: []
    };
  });

  NS.GraphModel.prototype.clear = function() {
    var self = this;
    self._graph = {
      nodes: [],
      links: []
    };
    self.fireListeners();
  };

  // TestGraphModel

  NS.TestGraphModel = $.nx.extend(NS.GraphModel, function() {
    var self = NS.TestGraphModel.super(this);
  });

  NS.TestGraphModel.prototype.load = function() {
    var self = this;
    // TODO(burdon): DO NOT USE NETWORK FOR TEST.
    d3.json('/res/data/test.json?ts' + new Date().getTime(), function(error, graph) {
      if (error) throw error;
      self._graph = graph;
      self.fireListeners('LOADED');
    });
  };

  NS.TestGraphModel.prototype.add = function() {
    var self = this;
    var source = self._graph.nodes[Math.floor(Math.random() * self._graph.nodes.length)];
    var target = {
      'id': 'node' + new Date().getTime(),
      'type': Math.floor(Math.random() * 3) + 1
    };

    self._graph.nodes.push(target);
    if (source) {
      self._graph.links.push({
        source: source,
        target: target
      });
    }

    self.fireListeners();
  };

  // DatabaseGraphModel

  NS.DatabaseGraphModel = $.nx.extend(NS.GraphModel, function(database) {
    var self = NS.DatabaseGraphModel.super(this);
    self._database = database;
    self._query = self._database.createQuery(self._onQueryUpdate.bind(self));
  });

  NS.DatabaseGraphModel.prototype._onQueryUpdate = function(message) {
    var self = this;

    // TODO(burdon): Parse.
    var graph = message;

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

    // TODO(burdon): Merge.
    self._graph = graph;
    self.fireListeners();
  };

  NS.DatabaseGraphModel.prototype.clear = function() {
    var self = this;
    // TODO(burdon): Action (i.e., not mutation).
    self._database.createMutation().commit(function() {
      self.load();
    });
  };

  NS.DatabaseGraphModel.prototype.load = function() {
    var self = this;
    self._query.execute();
  };

  NS.DatabaseGraphModel.prototype.add = function() {
    var self = this;
    self._database.createMutation().commit(function() {
      console.log('!!!!');
      self.load();
    });
  };

  // TODO(burdon): Keep Graph Control pure from Angular? Managed by Angular controller. Factor out?
  // TODO(burdon): Config Graph with DOM attrs?
  NS.GraphControl = function(root) {

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
    d3.select(window).on('resize', $.nx.defer(this.resize.bind(this), 100));
    this.resize();
  };

  /**
   * Sets the model.
   * @param model
   * @returns {NS.GraphControl}
   */
  NS.GraphControl.prototype.setModel = function(model) {
    if (this.model) {
      this.model.removeListener(this.update.bind(this));
    }
    this.model = model;
    if (this.model) {
      this.model.addListener(this.update.bind(this));
    }
    return this;
  };

  /**
   * Resize the SVG element to expand to its container.
   */
  NS.GraphControl.prototype.resize = function() {
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
  NS.GraphControl.prototype.tick = function() {
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
  NS.GraphControl.prototype.start = function() {
    var links = this.model && this.model._graph.links || [];
    var nodes = this.model && this.model._graph.nodes || [];

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
        .attr('class', function(d) { return 'node type-' + d.type; })
        .attr('r', 16);
    this.node
      .exit()
        .remove();

    this.force.start();
  };

  /**
   * Set model.
   */
  NS.GraphControl.prototype.update = function(event) {
    var links = this.model && this.model._graph.links || [];
    var nodes = this.model && this.model._graph.nodes || [];

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

  return NS;
});
