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
# Configure how the MCP client routes to the MCP server
#
if [ "$RUN_LOCAL_MCP_SERVER" == 'true' ]; then
  export MCP_SERVER_URL='http://host.docker.internal:3000'
else
  export MCP_SERVER_URL='http://utility-mcp-server:3000'
fi

envsubst < apigateway/kong-template.yml > apigateway/kong.yml
if [ $? -ne 0 ]; then
  echo 'Problem encountered using the envsubst tool to finalize API gateway configuration'
  exit 1
fi

#
# Run the deployment
#
docker compose down
docker compose up
if [ $? -ne 0 ]; then
  exit 1
fi
