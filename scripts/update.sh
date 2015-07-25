#!/bin/sh

set -x

brew update
brew upgrade
npm install
npm update
bower update

