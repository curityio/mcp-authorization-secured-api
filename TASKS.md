# Tasks

The behavior should appeal to organizations who want to expose particular data to AI agents.\
Ideally, the end-to-end journey should sound secure enough without blocking issues.

## Exposed Resources (DONE IN THIS BRANCH)

Use stocks as a money-based resource to make the reader think about security implications.\
However, stock prices are often fairly public so may be suitable for fairly open access.

## Dynamic Client Registration Restrictions

Assume that AI agents can only implement DCR as a public client.\
You have limited control over the OAuth client DCR behavior so use these mitigations:

- Only allow DCR without client credentials for MCP clients that request particular whitelisted scopes.
- For any other scope you must supply a client credential.
- Dynamic clients get short-lived access tokens and no refresh token.

## Administrator Approved User Access

Although the dynamic client is untrusted, show that you can restrict access at the user level.\
Organizations could require administrator approval of users:

- Ensure that the example deployment does not allow user self-signup.
- Only allow users precreated by an administrator to sign in.

## User Authentication and Consent

- Simulate users authenticating with their corporate email using a one-time code.
- These corporate users must consent to the AI agent gaining access to stocks.

## API Authorization

The API only allows read operations and requires a `stocks/read` scope.\
The access token issued to dynamic clients should include the API's identity as an audience.

## Clearly Demonstrate Denied Access

- Show a dynamic public client that does not request the correct scope being denied access.
- Return API authorization errors like 401s or 403s to the agent when it calls a tool.
