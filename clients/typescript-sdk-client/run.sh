#!/bin/bash

#############################################
# Run the TypeScript SDK example OAuth client
#############################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Do some one time setup
#
if [ ! -d typescript-sdk ]; then
  
  #
  # Get the code
  #
  git clone https://github.com/modelcontextprotocol/typescript-sdk

  #
  # Install dependencies
  #
  cd typescript-sdk
  pnpm install
  
  cd ..
fi

#
# Trust the development root certificate
#
export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

#
# Run the MCP example client, providing the MCP server URL and client ID metadata URL
#
cd typescript-sdk
pnpm --filter @modelcontextprotocol/examples-client exec tsx src/simpleOAuthClient.ts \
    'https://mcp.demo.example' \
    'https://www.client.example/typescript-sdk-client.json'
