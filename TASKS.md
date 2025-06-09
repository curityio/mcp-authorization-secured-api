# Security Tasks

- The MCP client should use scopes dictated by the backend.
- The access token issued to dynamic clients should include the API's identity as an audience.

## General Tasks

- Update to domains like demo.example instead of example.com.
- Change to a stocks API with money details that a financial person might access.
- Change to pre-deployed user accounts to represent administrator approval.
- Change to email authentication, to represent employees needing to prove their identity.
- Return useful errors to the MCP client if there is an API error like access token expiry
