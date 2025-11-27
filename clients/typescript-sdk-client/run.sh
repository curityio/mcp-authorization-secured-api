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
  npm install
  
  #
  # Work around the example client not setting a scope for DCR
  #
  FROM="client_name: 'Simple OAuth MCP Client'"
  TO="client_name: 'Simple OAuth MCP Client', scope: 'stocks\/read'"
    if [ "$(uname -s)" == 'Darwin' ]; then
    sed -i '' "s/$FROM/$TO/" src/examples/client/simpleOAuthClient.ts
  else
    sed -i "s/$FROM/$TO/"    src/examples/client/simpleOAuthClient.ts
  fi
  cd ..
fi

#
# Trust the development root certificate
#
export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

#
# Run the MCP inspector client
#
cd typescript-sdk
npx tsx src/examples/client/simpleOAuthClient.ts 'https://mcp.demo.example'
