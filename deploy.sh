#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# First check there is a valid license file for the Curity Identity Server
#
if [ "$LICENSE_FILE_PATH" == '' ]; then
  echo '*** Please provide a LICENSE_FILE_PATH environment variable with the path to a Curity Identity Server license file'
  exit 1
fi

export LICENSE_KEY=$(cat "$LICENSE_FILE_PATH" | jq -r .License)
if [ "$LICENSE_KEY" == '' ]; then
  echo '*** An invalid license file was provided for the Curity Identity Server'
  exit 1
fi

#
# Create development SSL certificates for external URLs.
#
./apigateway/certs/create.sh
if [ $? -ne 0 ]; then
  exit 1
fi
export EXTERNAL_ROOT_CA=$(cat ./apigateway/certs/example.ca.crt | openssl base64 | tr -d '\n')

#
# Pull up to date Docker images
#
docker pull postgres:latest
docker pull curity.azurecr.io/curity/idsvr:latest

#
# Share the postgres data folder to the host, to ensure that therno unexpected database is present
#
mkdir ./idsvr/data 2>/dev/null 
chmod 777 ./idsvr/data

#
# Run the deployment to spin up all components
#
docker compose down
docker compose up
if [ $? -ne 0 ]; then
  exit 1
fi
