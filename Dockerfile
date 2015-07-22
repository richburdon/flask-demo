# https://registry.hub.docker.com/_/python/
# https://registry.hub.docker.com/u/library/python/
# https://github.com/docker-library/python/blob/master/2.7/Dockerfile

# Base python image (includes tools).
FROM python:2.7

# Add sources.
ADD requirements.txt  /home/demo/build/
ADD src/main/python   /home/demo/app/python
ADD src/main/webapp   /home/demo/app/webapp

# Install Python modules.
WORKDIR /home/demo/build
RUN pip install -r requirements.txt

# Expose (default Flask port).
EXPOSE 5000 

# Flask Env
ENV FLASK_ENV=PRODUCTION

# Run the server.
WORKDIR /home/demo/app/python
CMD ["python", "main.py"]
