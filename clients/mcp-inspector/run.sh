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
