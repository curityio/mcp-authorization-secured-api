# Tasks

Improve code and reliability to ensure a joined up storyline:

## Multiple APIs

Tidy up paths and make the OAuth filter work out which API to return resource metadata for.

## Exception Handler

Do an initial handler that logs errors to improve productivity.

## OAuth Filter

Make this throw a 401 error and write the resource server metadata in the exception handler.

## Scopes

Avoid hard coding these in the client.

## Audience

The dynamic client should include the API audience.

## Expiry Errors

Read the spec to understand anything special about MCP errors.\
Does the phantom token plugin need to return resource metadata when an access token expires?
