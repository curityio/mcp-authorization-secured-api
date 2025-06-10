# Tasks

The behavior should appeal to organizations who want to expose particular data to AI agents.\
Aim to show an end-to-end storyline that sounds secure enough without blocking issues.\
Along the way, highlight some essential features that the Curity Identity Server provides.

## Business Theme (DONE)

Use trades as a money-based resource to make the reader think about security implications.

## Dynamic Client Registration (TODO)

The MCP client should register with the scopes and audience from resource server metadata.
The example will allow any AI agent public client to register but use a DCR procedure to limit what is allowed:

- DCR public clients can only use whitelisted scopes / audiences and do not get a refresh token.
- Use a SQL database so that we can more easily view DCR data.

## Administrator Approved User Access (DONE)

The deployment restricts access at the user level:

- Only administrator approved (pre-created) users can run AI agents that get API data.
- Include such users in the deployment: `john.doe@demo.example` and `jane.test@demo.example`.

## User Authentication and Consent (DONE)

- Users authenticate with their corporate email using a one-time code.
- These corporate users must also consent to the AI agent gaining read only access to trades data.

## Access Tokens and API Authorization (IN PROGRESS)

The access token issued to MCP clients should include the API's identity in the audience.\
The access token issued to MCP clients should include the API's required scopes.
The access token should also have a custom claim called region to demonstrate claims-based authorization.

## Reliability Control

When the MCP client calls a tool it should get useful errors if the API returns a 401 or 403.

## Code Tidy Up

Ensure that all code is simple and clean, to appeal to developers.
