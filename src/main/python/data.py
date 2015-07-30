#
# Copyright 2015 Alien Laboratories, Inc.
#

from injector import inject, singleton
from config import Config
from py2neo import Graph, Node, Relationship
import random

import logging
LOG = logging.getLogger('view')


@singleton
@inject(config=Config)
class Database(object):
    """
    http://neo4j.com/developer/python
    http://neo4j.com/docs/stable
    http://py2neo.org/2.0
    """

    # TODO(burdon): Logging (http).

    TYPE = 'Item'
    REL = 'linked'

    def __init__(self):
        self.graph = Graph('http://' + self.config['service.neo4j'] + '/db/data/')

    def __str__(self):
        items = self.graph.cypher.execute('MATCH (item:{type}) RETURN item'.format(type=Database.TYPE))
        return 'Graph({:d})'.format(len(items))

    def clear(self):
        self.graph.cypher.execute('MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r')

    def select(self):
        relationships = self.graph.cypher.execute('MATCH ()-[r:{rel}]->() RETURN r'.format(rel=Database.REL))
        return relationships

    # TODO(burdon): Specify source node ID.
    def add(self):
        items = self.graph.cypher.execute('MATCH (item:{type}) RETURN item'.format(type=Database.TYPE))
        name = 'Item-{:d}'.format(len(items) + 1)
        target = Node(Database.TYPE, name=name, type=random.randint(1, 3))

        if items:
            source = random.sample(items.to_subgraph().nodes, 1)[0]
            relationship = Relationship(source, Database.REL, target)
            self.graph.create(relationship)
        else:
            self.graph.create(target)


class Notifier(object):

    def notify(self, message):
        pass


@singleton
@inject(database=Database, notifier=Notifier)
class RequestHandler(object):
    """
    Handles all inbound data requests (queries and mutations).
    """

    def process_request(self, request):
        response = {}

        # Handle queries.
        if request.get('query'):
            result = {
                'query_id': request['query']['id'],
                'nodes': [],
                'links': []
            }

            records = self.database.select()
            graph = records.to_subgraph()
            # LOG.info(graph.nodes)
            # LOG.info(graph.relationships)

            node_map = {}
            for node in graph.nodes:
                # TODO(burdon): Why are nodes showing up multiple times?
                if node.ref not in node_map:
                    node_map[node.ref] = node
                    result['nodes'].append({
                        'id': node.ref,
                        'name': node['name'],
                        'type': node['type']
                    })

            for relationship in graph.relationships:
                result['links'].append({
                    'source': relationship.start_node.ref,
                    'target': relationship.end_node.ref
                })

            response['query_result'] = result

        # Handle mutations
        if request.get('mutation'):
            self.database.add()
            response['mutation_result'] = {
                'mutation_id': request['mutation']['id'],
            }

            self.notifier.notify()

        return response
