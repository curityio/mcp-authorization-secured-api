#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Build the Stocks API to a Docker container
#
cd stocks-api
echo 'Building stocks API ...'
npm install
if [ $? -ne 0 ]; then
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  exit 1
fi

docker build --no-cache -t stocks-api:1.0 .
if [ $? -ne 0 ]; then
  exit 1
fi
cd ..

#
# Build the MCP server to a docker container
#
echo 'Building utility MCP server ...'
cd utility-mcp-server

npm install
if [ $? -ne 0 ]; then
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  exit 1
fi

docker build --no-cache -t utility-mcp-server:1.0 .
if [ $? -ne 0 ]; then
  exit 1
fi
cd ..

#
# Build the API gateway custom image to a Docker container
#
cd apigateway
docker build --no-cache -t kong-api-gateway:1.0 .
if [ $? -ne 0 ]; then
    exit 1
  fi