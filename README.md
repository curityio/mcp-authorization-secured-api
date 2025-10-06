# MCP Authorization Secured API

This repository contains a code example to illustrate how organizations can expose APIs using the draft [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization) specification. The code example shows how to use an MCP server to provide a new entry point that exposes OAuth-secured APIs to AI agents.

## Overview

The example includes the following components:

* Example MCP client
* Stocks API that simulates an existing API
* MCP server that proxies requests to the API
* Authorization server (the Curity Identity Server) that issues access tokens
* API gateway that exposes public endpoints and includes a phantom token plugin (see [the phantom token approach](https://curity.io/resources/learn/phantom-token-pattern/))

The MCP client is typically part of an AI agent that users interact with using natural language. The AI agent selects and invokes the MCP client that, in turn, integrates with the MCP server. For simplicity, this example does not include an AI agent. However, it includes an example of an MCP client that you can run locally on your computer.

The end-to-end flow starts when an example MCP client calls a stateless MCP server.

![AI agent Flow](images/ai-agent-flow.png)

The overall flow uses the following steps:

1. The MCP client runs OAuth flows to retrieve an access token.
2. The Curity Identity Server issues the MCP client a confidential (opaque) access token.
3. The MCP client sends the opaque access token to the MCP server.
4. The [phantom token plugin](https://github.com/curityio/nginx-lua-phantom-token-plugin) introspects the opaque access token and forwards a JWT access token to the MCP server.
5. The MCP server validates the JWT access token and checks that it has an audience of `https://mcp.demo.example/`.
6. Before calling the API the MCP server uses token exchange to change the token audience to`https://api.demo.example`.
7. The MCP server sends the exchanged access token to the stocks API.
8. The API validates the access token and uses its claims for authorization that protects business resources.

## Backend Endpoints

All external URLs in this code example are exposed using an instance of the Kong API gateway.\
The backend includes an MCP server that receives all requests from MCP clients and proxies them to existing APIs.\
MCP clients connect to the MCP server using a Streamable HTTP transport.

| Endpoint | URL | Description |
| -------- | --- | ----------- |
| MCP Server Entry Point | `https://mcp.demo.example` | Endpoint that receives all API requests from MCP clients. |
| MCP Server Resource Metadata | `https://mcp.demo.example/.well-known/oauth-protected-resource` | Used by the MCP client to discover the MCP server's authorization server. |
| Stocks API | `https://api.demo.example/stocks` | The API entry point for non MCP clients. |
| Curity Identity Server OAuth Metadata | `https://login.demo.example/.well-known/oauth-authorization-server` | Used by the MCP client to discover the capabilities of the authorization server, e.g. authorization endpoint. |
| Curity Identity Server Admin UI | `https://admin.demo.example/admin` | Administration interface of the Curity Identity Server. |
| Curity Identity Server DCR | `https://login.demo.example/oauth/v2/oauth-registration` | Endpoint of the Curity Identity Server that enables the MCP client to automatically register, e.g. its redirect URI. |
| Curity Identity Server Authorization Endpoint | `https://login.demo.example/oauth/v2/oauth-authorize` | Endpoint discovered by the MCP client for starting the OAuth flow. |
| Curity Identity Server Token Endpoint | `https://login.demo.example/oauth/v2/oauth-token` | Endpoint from where the MCP client gets the access token at the end. |
| Curity Identity Server Login Interfaces | `https://login.demo.example/authn/authenticate/` | The base URL for authentication related user interaction. |
| Test Email Inbox | `https://mail.demo.example` | A mail server for testing purposes that lets you receive any emails that the Curity Identity Server sends. |

The Curity Identity Server implements OAuth standards (DCR, code flow) to enable the authorization as defined for MCP.\
You can log into the Admin UI with a username and password of `admin / Password1`.

## Run the End-to-End Flow

Typically you do not control the client or its code, and MCP clients make standards-based connections.\
The deployed backend in this code example uses standards-based security to enable many MCP clients to connect.

### Install Prerequisites

First, install Docker and Node.js 22 or later on your local computer.\
Get a [Trial License](https://developer.curity.io/free-trial) for the Curity Identity Server from the Curity developer portal.\
Save the license to your desktop as a `license.json` file.

### Deploy the Backend

Run the following commands to deploy all backend components and provide OAuth-secured endpoints. Adapt the path of the license file if necessary.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Enable Local HTTPS URLs

To enable the use of these domains on your local computer, add the following entries to the `/etc/hosts` file.

```text
127.0.0.1 api.demo.example mcp.demo.example admin.demo.example login.demo.example mail.demo.example
```

Also trust the OpenSSL issued root certificate authority that the deployment creates at the following location.\
For example, on macOS add it to Keychain Access under System / Certificates:

```text
~/Desktop/example.ca.crt
```

### Run Clients

See the following READMEs for further information on how to run supported clients:

- [TypeScript SDK Console Client](clients/typescript-sdk-client/README.md)
- [MCP Inspector](clients/mcp-inspector/README.md)
- [Claude Code](clients/claude-code/README.md)
- [Claude Desktop](clients/claude-desktop/README.md)

## Understand the Flow

MCP clients that implement the MCP draft authorization specification can integrate with the MCP server.\
The Curity Identity Server issues access tokens that restrict MCP clients to least-privilege access tokens.

### Client Behaviors

Clients use the following steps to get an access token and call the API:

- Resource server metadata download.
- Authorization server metadata download.
- Dynamic client registration.
- User authentication.
- User consent.

Only MCP clients operated by the following administrator approved users can gain access to secured API data.\
These users must prove ownership of their corporate email to authenticate themselves.\
You can simulate that by entering one of the emails and typing a one-time password from the test email inbox.

- `john.doe@demo.example`
- `jane.test@demo.example`

<img src="images/user-authentication.png" alt="User Consent" style="width:50%" />

Users must then consent to granting the MCP client access to API data.\
The user is informed about the level of data access that the AI agent requests.

<img src="images/user-consent.png" alt="User Consent" style="width:50%" />

### Access Token Behaviors

MCP clients receive the following token response:

```json
{
  "access_token": "_0XBPWQQ_d8ed4b47-7d85-455f-8d7e-03b08e84428b",
  "token_type": "bearer",
  "expires_in": 900,
  "scope": "stocks/read",
}
```

Notice the following characteristics of the access token that gets returned to MCP clients (and therefore AI agents).\
These measures help to mitigate risks of releasing access tokens to AI agents:

- The MCP client is unable to read any access token claims.
- The MCP client's access token is short-lived with a limited scope.
- The MCP client does not receive a refresh token.

The [Kong API gateway routes](apigateway/kong.yml) expose both the MCP server and API endpoints.\
The MCP server receives a scoped JWT access token with a payload similar to the following.\
The access token is only accepted at MCP entry points and not at other API endpoints.

```json
{
  "jti": "2dc6cc38-d77f-4378-ba80-ba9d945141ff",
  "delegationId": "cd0c96fd-5fc3-4a92-a9fc-caf40e4e9b0c",
  "exp": 1749650409,
  "nbf": 1749650109,
  "scope": "stocks/read",
  "iss": "https://login.demo.example/oauth/v2/oauth-anonymous",
  "sub": "john.doe@demo.example",
  "aud": "https://mcp.demo.example/",
  "iat": 1749650109,
  "purpose": "access_token"
}
```

The MCP server uses token exchange to update the access token's audience and calls the stocks API.\
The Curity Identity Server could also issue any required custom claims to the access token.\
Finally, APIs must authorize to protect data using [scopes](https://curity.io/resources/learn/scope-best-practices/) and [claims](https://curity.io/resources/learn/claims-best-practices/).

## Website Documentation

See the following resources to read further information on security concepts, threats and mitigations.\
The tutorial provides further details on the code example's behaviors.

- [Design MCP Authorization for APIs](https://curity.io/resources/learn/design-mcp-authorization-apis/)
- [Implementing MCP Server Authorization for APIs](https://curity.io/resources/learn/implementing-mcp-authorization-apis/)

## More Information

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
