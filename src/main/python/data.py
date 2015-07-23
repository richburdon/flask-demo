#
# Copyright 2015 Alien Laboratories, Inc.
#

from injector import inject, singleton
from config import Config
from py2neo import Graph, Node, Relationship
import random


@singleton
@inject(config=Config)
class Database(object):
    """
    http://neo4j.com/developer/python
    http://neo4j.com/docs/stable
    http://py2neo.org/2.0
    """

    def __init__(self):
        self.graph = Graph('http://' + self.config.neo_url + '/db/data/')

    def __str__(self):
        items = self.graph.cypher.execute('MATCH (item:Item) RETURN item')
        return 'Graph({:d})'.format(len(items))

    def clear(self):
        self.graph.cypher.execute('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r')

    def select(self):
        relationships = self.graph.cypher.execute('MATCH ()-[r:linked]->() RETURN r')
        return relationships

    # TODO(burdon): Optionally specify source node ID.
    def add(self):
        items = self.graph.cypher.execute('MATCH (item:Item) RETURN item')
        name = 'Item-{:d}'.format(len(items) + 1)
        target = Node('Item', name=name)

        if items:
            source = random.sample(items.to_subgraph().nodes, 1)[0]
            relationship = Relationship(source, 'linked', target)
            self.graph.create(relationship)
        else:
            self.graph.create(target)
