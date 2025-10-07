#!/bin/bash

########################################
# Run the MCP inspector as an MCP client
########################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Do some one time setup
#
if [ ! -d inspector ]; then
  
  #
  # Get the code
  #
  git clone https://github.com/modelcontextprotocol/inspector

  #
  # Install dependencies
  #
  cd inspector
  npm install

  #
  # Fix an issue where the client_uri is hard coded, so that it uses the local redirect URI
  # https://github.com/modelcontextprotocol/inspector/issues/710
  #
  CLIENT_URI_FROM="client_uri: \"https:\/\/github.com\/modelcontextprotocol\/inspector\""
  CLIENT_URI_TO="client_uri: \"http:\/\/localhost:6274\""

  if [ "$(uname -s)" == 'Darwin' ]; then
    sed -i '' "s/$CLIENT_URI_FROM/$CLIENT_URI_TO/"   client/src/lib/auth.ts
  else
    sed -i "s/$CLIENT_URI_FROM/$CLIENT_URI_TO/"      client/src/lib/auth.ts
  fi

  #
  # Build the updated code
  #
  cd client
  npm run build
  cd ../..
fi

#
# Trust the development root certificate
#
#export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

#
# Run the MCP inspector client
#
cd inspector
node client/bin/start.js
