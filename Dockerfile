# https://registry.hub.docker.com/_/python/
# https://registry.hub.docker.com/u/library/python/
# https://github.com/docker-library/python/blob/master/2.7/Dockerfile

# Base python image (includes tools).
FROM python:2.7

# Add source.
ADD requirements.txt /home/demo/build/
ADD src/main/python /home/demo/app/

# Base dir for build.
WORKDIR /home/demo/build

# Install Python modules.
RUN pip install -r requirements.txt

# Expose (default Flask port).
EXPOSE 5000 

# Run the server.
WORKDIR /home/demo/app
CMD ["python", "main.py"]
