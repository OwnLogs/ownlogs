#!/bin/bash

# Function to add colored prefix
prefix_output() {
  local color="$1"
  local prefix="$2"
  while IFS= read -r line; do
    echo -e "${color}${prefix}\033[0m ${line}"
  done
}

options=(
  "dev"
  "format"
  "build"
  "docker preview dev"
  "docker build prod"
  "docker preview prod"
  "docker push"
  "docker run prod"
)

for i in ${!options[@]}; do
  echo "[$i] ${options[$i]}"
done

# Choice
read -p "Choose an option: " choice

case $choice in
  0)
    # Start the frontend server with colored output
    (
      cd frontend
      pnpm dev 2>&1 | prefix_output "\033[1;34m" "[FRONTEND]"
    ) &

    # Start the backend server with colored output
    (
      cd backend
      pnpm dev 2>&1 | prefix_output "\033[1;32m" "[BACKEND]"
    ) &

    # Wait for both servers to exit
    wait
    ;;
  1)
    # Format the code
    (
      cd frontend
      pnpm format 2>&1 | prefix_output "\033[1;34m" "[FRONTEND]"
    ) &

    # Start the backend server with colored output
    (
      cd backend
      pnpm format 2>&1 | prefix_output "\033[1;32m" "[BACKEND]"
    ) &

    # Wait for both servers to exit
    wait
    ;;
  2)
    # Build the code
    (
      cd frontend
      pnpm build 2>&1 | prefix_output "\033[1;34m" "[FRONTEND]"
    ) &

    # Start the backend server with colored output
    (
      cd backend
      pnpm build 2>&1 | prefix_output "\033[1;32m" "[BACKEND]"
    ) &

    # Wait for both servers to exit
    wait
    ;;
  3)
    # Test the code in a Docker container
    ./docker/test/test.sh
    ;;
  4)
    # Build prod
    ./docker/build.sh
    ;;
  5)
    # Push the Docker image to the registry
    ./docker/preview.sh
    ;;
  6)
    # Push the Docker image to the registry
    ./docker/build.sh
    ./docker/push.sh
    ;;
  7)
    # Run the prod server
    ./docker/run.sh
    ;;
  *)
    echo "Invalid option"
    ;;
esac
