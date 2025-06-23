#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Build the Stocks API to a Docker container
#
echo 'Building stocks API ...'
cd stocks-api
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
echo 'Building MCP server ...'
cd mcp-server

npm install
if [ $? -ne 0 ]; then
  exit 1
fi

npm run build
if [ $? -ne 0 ]; then
  exit 1
fi

docker build --no-cache -t mcp-server:1.0 .
if [ $? -ne 0 ]; then
  exit 1
fi
cd ..

#
# Build the API gateway custom image to a Docker container
#
echo 'Building API gateway with phantom token plugin ...'
cd apigateway
docker build --no-cache -t kong-api-gateway:1.0 .
if [ $? -ne 0 ]; then
  exit 1
fi
cd ..