# Tasks

Make code read nicely and handle error and expiry conditions so that it is reliable.\
This ensures a joined up storyline to appeal to readers

## Exception Handler

Do an initial handler that logs errors to improve our ownproductivity.\
Make the OAuth filter throw a 401 error and write the resource server metadata in the exception handler.

## Client settings

Get the dynamically registered client to use the correct scope and audience, with no refresh token.\
Use a registration endpoint procedure if required.

## Resource Server Metadata

The MCP server should probably ask the stocks API for its resource server metadata.

## MCP Errors

Read the spec to understand anything special about MCP errors.\
Does the phantom token plugin need to return resource metadata when an access token expires?\
Make sure expired access tokens are no longer accepted and the MCP client

## Minor Points

The client says this so check it is not an issue with our code?
- Invalid WWW-Authenticate header format, expected 'Bearer'