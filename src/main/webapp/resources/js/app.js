// Copyright 2015 Alien Laboratories, Inc.

requirejs(['jquery', 'd3'], function() {

  // http://bl.ocks.org/mbostock/4062045

  var div = $('.x-d3');

  var width = div.width();
  var height = div.height();

  var svg = d3.select('.x-d3').append('svg');

  var color = d3.scale.category20();

  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height]);

  var data = null;

  d3.json('/res/data/test.json', function(error, graph) {
    if (error) throw error;
    data = graph;
    render();
  });

  // TODO(burdon): After delay (i.e., after stopped resizing).
  d3.select(window).on('resize', function() { trigger(render, 200); });

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

  function render() {
    console.log('Render');

    var graph = data;

    width = div.width();
    height = div.height();

    force = d3.layout.force().size([width, height]);

    svg
      .attr('width', width)
      .attr('height', height);

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = svg.selectAll('.link')
        .data(graph.links)
      .enter().append('line')
        .attr('class', 'link')
        .style('stroke-width', function(d) { return Math.sqrt(d.value); });

    var node = svg.selectAll('.node')
        .data(graph.nodes)
      .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 5)
        .style('fill', function(d) { return color(d.group); })
        .call(force.drag);

    node.append('title')
        .text(function(d) { return d.name; });

    force.on('tick', function() {
      link.attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

      node.attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
    });

  } // render

});
