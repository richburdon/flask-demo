#!/bin/sh

set -x

brew update
brew upgrade

npm install
npm update
bower update

pip install virtualenv
pip install --upgrade virtualenv
virtualenv tools/python
tools/python/bin/pip install --upgrade -r requirements.txt

