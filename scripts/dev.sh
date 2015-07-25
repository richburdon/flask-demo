#!/bin/sh

set -x

boot2docker start && $(boot2docker shellinit)

# Start neo
`dirname $0`/neo.sh

# Start flask
cd src/main/python
../../../tools/python/bin/python main.py
