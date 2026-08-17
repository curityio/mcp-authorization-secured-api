#!/bin/bash

########################################
# Run the MCP inspector as an MCP client
########################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"


#
# Trust the development root certificate
#
export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

npx @modelcontextprotocol/inspector --server-url https://mcp.demo.example --transport http