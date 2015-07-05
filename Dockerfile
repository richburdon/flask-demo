# Base python image (includes tools).
# https://registry.hub.docker.com/_/python/
# https://registry.hub.docker.com/u/library/python/
# https://github.com/docker-library/python/blob/master/2.7/Dockerfile
FROM python:2.7.9

# Add source.
ADD src/main/python /app

# Base dir for build.
WORKDIR /app

# Install Python modules.
RUN pip install -r requirements.txt

# Expose (default Flask port).
EXPOSE 5000 

# Base dir for server.
WORKDIR /app

# Run the server.
CMD ["python", "main.py"]
