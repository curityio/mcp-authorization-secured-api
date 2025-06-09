#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

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

echo 'Building utility MCP server ...'

if [ "$RUN_LOCAL_MCP_SERVER" != 'true' ]; then
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
else
  echo 'Using local MCP server, skipping MCP server build.'
fi
