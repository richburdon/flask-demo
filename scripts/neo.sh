#!/bin/sh

# Start neo4j (accessible from local machine).
docker rm -f neo
docker run -d -p 7474:7474 --name neo kbastani/docker-neo4j
