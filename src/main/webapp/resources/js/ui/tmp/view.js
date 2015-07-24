// Copyright 2015 Alien Laboratories, Inc.

// NOTE: JS error: bubble_compiled.js is part of the Google Translate Chrome Extension.

define(['jquery', 'd3'], function() {

  // http://bl.ocks.org/mbostock/4062045

  // https://github.com/mbostock/d3/wiki/Force-Layout
  var force = d3.layout.force()
    .linkDistance(50)
    .charge(-400)
    .on('tick', tick);

  var svg = d3.select('.x-graph').append('svg');

  var node = svg.selectAll('.node');
  var link = svg.selectAll('.link');

  var trigger = $.trigger(resize, 200);
  d3.select(window).on('resize', function() { trigger.fire(); }); // TODO(burdon): pass function only.
  resize();

  function resize() {
    var container = $('.x-graph');

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
    }
    for (i = 0; i < graph.nodes.length; i++) {
      node = graph.nodes[i];
      var current = node_map[node.id];
      if (current) {
        node.x = current.x;
        node.y = current.y;
        node.px = current.px;
        node.py = current.py;
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

    // TODO(burdon): Set initial position at center (or parent).
    node = node.data(graph.nodes, function(d) { return d.id; });
    node
      .enter()
      .append('circle')
        .attr('class', function(d) { return 'node g-' + d.group; })
        //.attr('cx', function(d) { return 10; }) // TODO(burdon): ???
        //.attr('cy', function(d) { return 10; })
        .attr('r', 16);
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
