#!/bin/bash

function generateRandomString() {
  echo $(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
}


PUBLIC_FRONTEND_PORT='4173'
PUBLIC_FRONTEND_ORIGIN='http://localhost'
PUBLIC_FRONTEND_HOST='0.0.0.0'
PUBLIC_BACKEND_PORT='3000'
MYSQL_PASSWORD='logify'
MYSQL_USER='logify'
MYSQL_DATABASE='logify'

# DO NOT CHANGE HOSTS
PUBLIC_BACKEND_HOST='localhost'
MYSQL_HOST='db'

frontendEnvFilePath='./frontend/.env'
backendEnvFilePath='./backend/.env'
dockerEnvFilePath='./.env'

# Check if ./.env has JWT_SECRET
if grep -q "JWT_SECRET" $dockerEnvFilePath; then
  JWT_SECRET=$(grep "JWT_SECRET" $dockerEnvFilePath | cut -d '=' -f2)
else
  JWT_SECRET=$(generateRandomString)
fi

# Frontend
echo "" > $frontendEnvFilePath
echo "PORT=$PUBLIC_FRONTEND_PORT" >> $frontendEnvFilePath
echo "ORIGIN=$PUBLIC_FRONTEND_ORIGIN:$PUBLIC_FRONTEND_PORT" >> $frontendEnvFilePath
echo "HOST=$PUBLIC_FRONTEND_HOST" >> $frontendEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $frontendEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $frontendEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $frontendEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $frontendEnvFilePath
echo "MYSQL_HOST=$MYSQL_HOST" >> $frontendEnvFilePath
echo "PUBLIC_BACKEND_HOST=$PUBLIC_BACKEND_HOST" >> $frontendEnvFilePath
echo "PUBLIC_BACKEND_PORT=$PUBLIC_BACKEND_PORT" >> $frontendEnvFilePath

# Backend
echo "" > $backendEnvFilePath
echo "PORT=$PUBLIC_BACKEND_PORT" >> $backendEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $backendEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $backendEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $backendEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $backendEnvFilePath
echo "MYSQL_HOST=$MYSQL_HOST" >> $backendEnvFilePath

# Docker
echo "" > $dockerEnvFilePath
echo "MYSQL_PASSWORD=$MYSQL_PASSWORD" >> $dockerEnvFilePath
echo "MYSQL_USER=$MYSQL_USER" >> $dockerEnvFilePath
echo "MYSQL_DATABASE=$MYSQL_DATABASE" >> $dockerEnvFilePath
echo "MYSQL_HOST=$MYSQL_HOST" >> $dockerEnvFilePath
echo "JWT_SECRET=$JWT_SECRET" >> $dockerEnvFilePath

echo "Environment variables set successfully"
