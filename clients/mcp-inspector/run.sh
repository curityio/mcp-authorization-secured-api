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
  # Make some automated code updates to match the example deployment's OAuth settings
  #
  AUTH_METHOD_FROM="token_endpoint_auth_method: \"none\"" 
  AUTH_METHOD_TO="token_endpoint_auth_method: \"client_secret_post\""
  SCOPE_FROM="scope: this.scope ?? \"\""
  SCOPE_TO="scope: 'stocks\/read'"
  CLIENT_URI_FROM="client_uri: \"https:\/\/github.com\/modelcontextprotocol\/inspector\""
  CLIENT_URI_TO="client_uri: \"http:\/\/localhost:6274\""

  if [ "$(uname -s)" == 'Darwin' ]; then
    sed -i '' "s/$AUTH_METHOD_FROM/$AUTH_METHOD_TO/" client/src/lib/auth.ts
    sed -i '' "s/$CLIENT_URI_FROM/$CLIENT_URI_TO/"   client/src/lib/auth.ts
    sed -i '' "s/$SCOPE_FROM/$SCOPE_TO/"             client/src/lib/auth.ts
  else
    sed -i "s/$AUTH_METHOD_FROM/$AUTH_METHOD_TO/"    client/src/lib/auth.ts
    sed -i "s/$CLIENT_URI_FROM/$CLIENT_URI_TO/"      client/src/lib/auth.ts
    sed -i "s/$SCOPE_FROM/$SCOPE_TO/"                client/src/lib/auth.ts
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
export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

#
# Run the MCP inspector client
#
cd inspector
node client/bin/start.js
