#!/bin/bash

###############################################
# Run Claude Code and connect to the MCP server
###############################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Trust the development root certificate
#
export NODE_EXTRA_CA_CERTS=$(readlink -f '../../apigateway/certs/example.ca.crt')

#
# Run Claude in debug mode and point to the the deployed MCP server
#
claude --debug --mcp-config mcp-config.json
