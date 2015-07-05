# flask-demo

1). Set-up

a). Requirements:

brew install npm
npm install -g npm-check-updates

brew upgrade python
sudo -H pip install --upgrade pip
sudo -H pip install --upgrade virtualenv

b). Install python virtual env:

virtualenv tools/python


2). Update

a). Install/update NPM deps (packages.json):

npm-check-updates -u
npm update

b). Install/update python deps (requirements.txt).

tools/python/bin/pip install -r requirements.txt
tools/python/bin/pip list

3). Run the app

tools/python/bin/python main.py
