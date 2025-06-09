# Tasks

The behavior should appeal to organizations who want to expose particular data to AI agents.\
Aim to show an end-to-end storyline that sounds secure enough without blocking issues.\
Along the way, show some features of the Curity Identity Server that enable it.

## Exposed Resources (DONE IN THIS BRANCH)

Use stocks as a money-based resource to make the reader think about security implications.\
However, stock prices are often fairly public so may be suitable for fairly open access by AI agents.

## Dynamic Client Registration

The MCP client should request scopes returned in the resource server metadata.\
Many AI agents may only implement DCR as a public client without a client credential.\
Therefore the example deployment should implement these mitigations:

- Only allow DCR without client credentials for MCP clients that request particular whitelisted scopes.
- Those dynamic clients get short-lived access tokens and no refresh token.

To meet these requirements we might use some custom logic like token procedures.

## Administrator Approved User Access

Show that you can restrict access at the user level.\
The example require administrator approval of users:

- The example deployment should not allow user self-signup.
- Only administrator approved users can run AI agents that get API data.
- Include such users in the deployment: `john.doe@demo.example` and `jane.doe@demo.example`.

## User Authentication and Consent

- Users authenticate with their corporate email using a one-time code.
- These corporate users must also consent to the AI agent gaining access to stocks.

## Access Tokens and API Authorization

The access token issued to dynamic clients should include the API's identity as an audience.\
Can the resource server metadata return the audience?\
The API should require a `stocks/read` scope and its own audience.

## Reliability Control

When the MCP client calls a tool it should get useful errors if the API returns a 401 or 403.
