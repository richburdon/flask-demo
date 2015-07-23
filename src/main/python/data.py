#
# Copyright 2015 Alien Laboratories, Inc.
#

# http://neo4j.com/developer/python/
# http://py2neo.org/2.0/

from injector import inject, singleton
from config import Config
from py2neo import Graph, Node, Relationship
import random


@singleton
@inject(config=Config)
class Database(object):

    def __init__(self):
        self.graph = Graph('http://' + self.config.neo_url + '/db/data/')

    def __str__(self):
        items = self.graph.cypher.execute('MATCH (item:Item) RETURN item')
        return 'Graph({:d})'.format(len(items))

    def select(self):
        items = self.graph.cypher.execute('MATCH (item:Item) RETURN item')
        return items

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
