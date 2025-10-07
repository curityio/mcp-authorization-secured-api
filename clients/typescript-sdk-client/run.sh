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
  # Work around the client using a hard coded and interoperable scope named 'mcp:tools'.
  # There is an open issue to get scopes from metadata.
  # - https://github.com/modelcontextprotocol/typescript-sdk/issues/978
  #
  SCOPE_FROM="scope: 'mcp:tools'"
  SCOPE_TO="scope: 'stocks\/read'"
  
  if [ "$(uname -s)" == 'Darwin' ]; then
    sed -i '' "s/$SCOPE_FROM/$SCOPE_TO/" src/examples/client/simpleOAuthClient.ts
  else
    sed -i "s/$SCOPE_FROM/$SCOPE_TO/"    src/examples/client/simpleOAuthClient.ts
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
export MCP_SERVER_URL='https://mcp.demo.example'
cd typescript-sdk
npx tsx src/examples/client/simpleOAuthClient.ts --oauth
