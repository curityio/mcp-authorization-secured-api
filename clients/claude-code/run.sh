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
# A static scope is configured, which we can remove once the mcp-remote library implements the new behavior
# - https://modelcontextprotocol.io/specification/draft/basic/authorization#scope-selection-strategy
#
claude --debug --mcp-config mcp-config.json
