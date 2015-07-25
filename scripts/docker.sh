#!/bin/sh

#
# NOTE: Use the following commands:
# docker-compose build
# docker-compose up -d
#

function ECHO {
  echo "\n###\n### $@\n###"
}

function EXEC {
  echo "\n> $@\n"
  $@
}

TAG=richburdon/flask-demo
NAME=flask-demo

# Start VM.
ECHO "Init..."
EXEC boot2docker start && $(boot2docker shellinit)

# Build image.
ECHO "Building: $TAG"
EXEC docker build -t $TAG .
EXEC docker images

# Run container.
ECHO "Running: $NAME"
EXEC docker rm -f $NAME
EXEC docker run -d -P --name $NAME -t $TAG
# EXEC docker run -d -p 5000:5000 --name $NAME -t $TAG
EXEC docker ps -n=1

# Test output.
IP=$(boot2docker ip)
PORT=$(docker ps -n=1 | sed -n -e 's/^.*:\([0-9]*\).*$/\1/p')

ECHO "Testing..."
EXEC curl -i $IP:$PORT

ECHO "OK"
