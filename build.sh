#!/bin/sh

# Stop on error
set -e

function ECHO {
  echo "\n###\n### $@\n###"
}

function EXEC {
  echo "\n> $@\n"
  $@
}

# Start VM.
ECHO "Init..."
EXEC boot2docker start && $(boot2docker shellinit)

# Build image.
ECHO "Building..."
EXEC docker build -t richburdon/flask-demo .
EXEC docker images

# Run container.
ECHO "Running..."
EXEC docker rm -f flask-demo
EXEC docker run -d -P --name flask-demo -t richburdon/flask-demo
EXEC docker ps -n=1

# Test output.
IP=$(boot2docker ip)
PORT=$(docker ps -n=1 | sed -n -e 's/^.*:\([0-9]*\).*$/\1/p')

ECHO "Testing..."
EXEC curl -i $IP:$PORT

ECHO "OK"