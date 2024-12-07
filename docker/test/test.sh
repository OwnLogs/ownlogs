#!/bin/bash

bash "$(dirname "$0")/../set-env.sh"
bash "$(dirname "$0")/build-images.sh"

dockerfileLocation="$(dirname "$0")/docker-compose.test.yaml"

docker compose -f $dockerfileLocation up
