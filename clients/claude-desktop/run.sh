#!/bin/bash

###############################################
# Run Claude Code and connect to the MCP server
###############################################

#
# Ensure that we are in the folder containing this script
#
cd "$(dirname "${BASH_SOURCE[0]}")"

#
# Trust the development certificate
#
export NODE_EXTRA_CA_CERTS=~/Desktop/example.ca.crt

#
# Connect Claude to the MCP server
#
claude mcp remove curity_demo 2>/dev/null
claude mcp add --transport http curity_demo https://mcp.demo.example

#
# Run Claude in debug mode
#
claude --debug
