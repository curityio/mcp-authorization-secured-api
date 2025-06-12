# Tasks

Make code read nicely and handle error and expiry conditions so that it is reliable.\
This ensures a joined up storyline to appeal to readers.

## Errors

Check that I'm dealing correctly with errors for both REST and JSON-RPC:
- https://docs.trafficserver.apache.org/en/latest/developer-guide/jsonrpc/jsonrpc-node-errors.en.html

Also make sure the stocks API and the MCP server log errors.\
Handle both unexpected errors and also access token expiry errors.

## Dynamic Client OAuth Settings

Get the dynamically registered client to use the correct scope and audience, with no refresh token.\
Use a registration endpoint procedure if required.

- https://github.com/modelcontextprotocol/typescript-sdk/issues/580