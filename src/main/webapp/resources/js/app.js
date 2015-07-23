// Copyright 2015 Alien Laboratories, Inc.

// NOTE: JS error: bubble_compiled.js is part of the Google Translate Chrome Extension.

requirejs(['jquery', 'd3'], function() {

  // http://bl.ocks.org/mbostock/4062045

  var EMPTY = {
    nodes: [],
    links: []
  };

  var graph = EMPTY;

  // https://github.com/mbostock/d3/wiki/Force-Layout
  var force = d3.layout.force()
    .linkDistance(50)
    .charge(-400)
    .on('tick', tick);

  var svg = d3.select('.x-d3').append('svg');

  var node = svg.selectAll('.node');
  var link = svg.selectAll('.link');

  d3.select(window).on('resize', function() { trigger(resize, 200); });
  resize();

  // Load data.
  // TODO(burdon): Cache control.
  d3.json('/res/data/test.json?ts' + new Date().getTime(), function(error, graph) {
    if (error) throw error;
    update(graph);
  });

  //
  // Controls
  //

  $('button.x-reset').click(function() {
    update(EMPTY);
  });

  $('button.x-load').click(function() {
    load();
  });

  $('button.x-refresh').click(function() {
    start();
  });

  $('button.x-create').click(function() {
    post();
  });

  // TODO(burdon): Factor out.
  var timeout;
  function trigger(f, delay) {
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(function() {
      timeout = null;
      f();
    }, delay);
  }

  function post() {
    $.ajax({
      type: 'POST',
      url: '/data',
      dataType: 'json',
      data: {},
      success: function() {
        console.log('OK');
        load();
      }
    });
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

  function resize() {
    var container = $('.x-d3');

    var width = container.width();
    var height = container.height();
    console.log('resize: [%d, %d]', width, height);

    svg
      .attr('width', width)
      .attr('height', height);

    force.size([width, height]);

    start();
  }

  function update(data) {
    console.log('update: %o', data);

    graph = data;

    $('.x-status').text(JSON.stringify(graph));

    // Preserve current x, y coordinates.
    var node_map = {};
    var nodes = force.nodes();
    var node;
    var i;
    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      node_map[node.id] = node;
      console.log('FOUND: ' + node.id);
    }
    for (i = 0; i < graph.nodes.length; i++) {
      node = graph.nodes[i];
      var current = node_map[node.id];
      if (current) {
        node.x = current.x;
        node.y = current.y;
        node.px = current.px;
        node.py = current.py;
      } else {
        console.log('NOT FOUND: ' + node.id);
      }
    }

    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start(); // NOTE: start() converts link source/target indexes to objects.

    start();
  }

  function start() {

    // https://github.com/mbostock/d3/wiki/Force-Layout#links
    link = link.data(graph.links, function(d) { return d.source.id + '-' + d.target.id; });
    link
      .enter()
      .insert('line', '.node')
        .attr('class', 'link');
    link
      .exit()
      .remove();

    node = node.data(graph.nodes, function(d) { return d.id; });
    node
      .enter()
      .append('circle')
        .attr('class', function(d) { return 'node g-' + d.group; }).attr('r', 16);
    node
      .exit()
      .remove();

    force.start();
  }

  function tick() {
    link
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    node
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  }

});
