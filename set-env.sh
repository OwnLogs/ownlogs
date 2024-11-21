#!/bin/bash

function generateRandomString() {
  echo $(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
}

function getDotEnvValue() {
  echo $(grep $2 $1 | cut -d '=' -f2)
}

frontendEnvFilePath='./frontend/.env'
backendEnvFilePath='./backend/.env'
dockerEnvFilePath='./.env'

PUBLIC_FRONTEND_PORT='4173'
PUBLIC_FRONTEND_ORIGIN='http://localhost'
PUBLIC_FRONTEND_HOST='0.0.0.0'
PUBLIC_BACKEND_PORT='3000'
MYSQL_PASSWORD=$(getDotEnvValue $dockerEnvFilePath 'MYSQL_PASSWORD')
MYSQL_USER=$(getDotEnvValue $dockerEnvFilePath 'MYSQL_USER')
MYSQL_DATABASE=$(getDotEnvValue $dockerEnvFilePath 'MYSQL_DATABASE')

# Generate JWT secret
if [ -z $(getDotEnvValue $dockerEnvFilePath 'JWT_SECRET') ]; then
  JWT_SECRET=$(generateRandomString)
else
  JWT_SECRET=$(getDotEnvValue $dockerEnvFilePath 'JWT_SECRET')
fi


# DO NOT CHANGE HOSTS
PUBLIC_BACKEND_HOST='localhost'
MYSQL_HOST='db'


# Frontend
echo "" > $frontendEnvFilePath
echo "PORT=$PUBLIC_FRONTEND_PORT" >> $frontendEnvFilePath
echo "ORIGIN=$PUBLIC_FRONTEND_ORIGIN:$PUBLIC_FRONTEND_PORT" >> $frontendEnvFilePath
echo "HOST=$PUBLIC_FRONTEND_HOST" >> $frontendEnvFilePath
echo "PUBLIC_BACKEND_HOST=$PUBLIC_BACKEND_HOST" >> $frontendEnvFilePath
echo "PUBLIC_BACKEND_PORT=$PUBLIC_BACKEND_PORT" >> $frontendEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $frontendEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $frontendEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $frontendEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $frontendEnvFilePath
echo "MYSQL_HOST=localhost" >> $frontendEnvFilePath


# Docker
echo "" > $dockerEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $dockerEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $dockerEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $dockerEnvFilePath
echo "MYSQL_HOST=$MYSQL_HOST" >> $dockerEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $dockerEnvFilePath


# Backend
echo "" > $backendEnvFilePath
echo "PORT=$PUBLIC_BACKEND_PORT" >> $backendEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $backendEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $backendEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $backendEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $backendEnvFilePath
echo "MYSQL_HOST=localhost" >> $backendEnvFilePath

echo "Environment variables set successfully"
