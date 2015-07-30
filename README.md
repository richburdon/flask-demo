# flask-demo
# Uses Flask and Angular.

#1). Set-up:

a). Requirements:

brew install npm
npm install -g npm-check-updates

brew upgrade python
sudo -H pip install --upgrade pip
sudo -H pip install --upgrade virtualenv

b). Install python virtual env:

virtualenv tools/python


#2). Update deps:

a). Install/update NPM deps (packages.json):

npm-check-updates -u
npm update

b). Install/update python deps (requirements.txt).

tools/python/bin/pip install -r requirements.txt
tools/python/bin/pip list


#3). Run the app:

tools/python/bin/python src/main/python/main.py


#4). Test in dev container:

boot2docker up && $(boot2docker shellinit)

docker build -t richburdon/flask-demo .
docker images
docker run -d -P --name flask-demo -t richburdon/flask-demo
docker ps -n=1

OR

docker-compose build
docker-compose up

curl $(boot2docker ip):$(docker ps -n=1 | sed -n -e 's/^.*:\([0-9]*\).*$/\1/p')


#5). Push image to the docker repo (to deploy to the cloud):

docker push richburdon/flask-demo


#6). Testing

./tools/python/bin/nosetests

