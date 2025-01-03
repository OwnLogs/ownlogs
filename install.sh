#!/bin/bash

# Usage:
# curl -s https://raw.githubusercontent.com/ownlogs/ownlogs/main/install.sh | bash

# Check if docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

# Getting the environment variable setting script
curl -s https://raw.githubusercontent.com/ownlogs/ownlogs/main/docker/set-env.sh -o set-env.sh

# Setting the environment variables
./set-env.sh

# Removing the environment variable setting script
rm set-env.sh

# Getting the docker compose file
curl -s https://raw.githubusercontent.com/ownlogs/ownlogs/main/docker/docker-compose.yaml -o docker-compose.yaml

# Start the docker containers
docker compose up -d
