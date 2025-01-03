#!/bin/bash

function generateRandomString() {
  echo $(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
}

function getDotEnvValue() {

  # Check if file exists
  if [ ! -f $1 ]; then
    echo $(generateRandomString)
  fi
  echo $(grep $2 $1 | cut -d '=' -f2)
}

frontendEnvFilePath="$(dirname "$0")/../frontend/.env"
backendEnvFilePath="$(dirname "$0")/../backend/.env"
dockerEnvFilePath="$(dirname "$0")/.env"

PUBLIC_FRONTEND_PORT='4173'
PUBLIC_FRONTEND_ORIGIN='http://localhost'
PUBLIC_FRONTEND_HOST='0.0.0.0'
PUBLIC_BACKEND_PORT='3000'
PUBLIC_OLLAMA_URL="http://localhost:11434"
MYSQL_USER='ownlogs'
MYSQL_DATABASE='ownlogs'
MYSQL_PASSWORD='ownlogs'
JWT_SECRET=$(getDotEnvValue $dockerEnvFilePath 'JWT_SECRET')


# DO NOT CHANGE HOSTS
PUBLIC_BACKEND_HOST='localhost'
MYSQL_HOST='db'


# Frontend
{
  echo "PORT=$PUBLIC_FRONTEND_PORT"
  echo "ORIGIN=$PUBLIC_FRONTEND_ORIGIN:$PUBLIC_FRONTEND_PORT"
  echo "HOST=$PUBLIC_FRONTEND_HOST"
  echo "PUBLIC_BACKEND_HOST=$PUBLIC_BACKEND_HOST"
  echo "PUBLIC_BACKEND_PORT=$PUBLIC_BACKEND_PORT"
  echo "JWT_SECRET=$JWT_SECRET"
  echo "MYSQL_PASSWORD=$MYSQL_PASSWORD"
  echo "MYSQL_USER=$MYSQL_USER"
  echo "MYSQL_DATABASE=$MYSQL_DATABASE"
  echo "MYSQL_HOST=localhost"
  echo "PUBLIC_OLLAMA_URL=$PUBLIC_OLLAMA_URL"
} > $frontendEnvFilePath


# Docker
{
  echo "MYSQL_PASSWORD=$MYSQL_PASSWORD"
  echo "MYSQL_USER=$MYSQL_USER"
  echo "MYSQL_DATABASE=$MYSQL_DATABASE"
  echo "MYSQL_HOST=$MYSQL_HOST"
  echo "JWT_SECRET=$JWT_SECRET"
  echo "PUBLIC_OLLAMA_URL=$PUBLIC_OLLAMA_URL"
} > $dockerEnvFilePath


# Backend
{
  echo "PORT=$PUBLIC_BACKEND_PORT"
  echo "JWT_SECRET=$JWT_SECRET"
  echo "MYSQL_PASSWORD=$MYSQL_PASSWORD"
  echo "MYSQL_USER=$MYSQL_USER"
  echo "MYSQL_DATABASE=$MYSQL_DATABASE"
  echo "MYSQL_HOST=localhost"
} > $backendEnvFilePath

# Test
cp $dockerEnvFilePath "$(dirname "$0")/test/.env"
