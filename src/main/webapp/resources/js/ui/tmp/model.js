// Copyright 2015 Alien Laboratories, Inc.

define(['jquery'], function() {

  var EMPTY = {
    nodes: [],
    links: []
  };

  var graph = EMPTY;

  // TODO(burdon): Cache control.
  function load_test() {
    d3.json('/res/data/test.json?ts' + new Date().getTime(), function(error, graph) {
      if (error) throw error;
      update(graph);
    });
  }

  function clear() {
    update(EMPTY);
  }

  function load() {
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

      update(graph);
    });
  }

  function post() {
    $.ajax({
      type: 'POST',
      url: '/data',
      dataType: 'json',
      data: {},
      success: function() {
        load();
      }
    });
  }

});
