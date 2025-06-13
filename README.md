# MCP Authorization Secured API

How organizations can expose APIs using the draft [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) specification.\
The code example shows how to use an MCP server to expose existing OAuth-secured APIs to AI agents.

## Overview

An example MCP client and MCP server provide the following end-to-end flow.

![MCP Flow](images/mcp-flow.png)

The [phantom token plugin](https://github.com/curityio/nginx-lua-phantom-token-plugin) secures connections to the MCP server by requiring a valid opaque access token.\
APIs require a different JWT access token to implement their authorization.

## Backend Endpoints

All external URLs are exposed using an instance of the Kong API gateway.\
The backend includes a utility MCP server that acts like an extension to the API gateway.\
MCP clients connect to the MCP server using a Streamable HTTP transport.

| Endpoint | URL |
| -------- | --- |
| Stocks API | http://api.demo.example/stocks |
| Utility MCP Server | http://mcp.demo.example |
| Curity Identity Server Admin UI | http://admin.demo.example/admin |
| Curity Identity Server OAuth Metadata | http://login.demo.example/.well-known/oauth-authorization-server |
| Test Email Inbox | http://mail.demo.example |

To enable the use of these domains on your local computer, add the following entries to the `/etc/hosts` file.

```text
127.0.0.1 api.demo.example mcp.demo.example admin.demo.example login.demo.example mail.demo.example
```

The Curity Identity Server implements OAuth standards to enable the authorization from the specification.\
You can log into the Admin UI with a username and password of `admin / Password1`.

## Run the End-to-End Flow

Typically you do not control the client or its code, and MCP clients make standards-based connections.\
The deployed backend uses standards-based security to enable many MCP clients to connect.

### Install Prerequisites

First, install Docker and Node.js on your local computer.\
Get a [Trial License](https://developer.curity.io/free-trial) for the Curity Identity Server from the Curity developer portal.\
Save the license to your desktop as a `license.json` file.

### Deploy the Backend

Run the following commands to deploy all backend components and provide OAuth-secured endpoints.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Run the MCP Client

Run any MCP client that implements the behavior from the MCP draft authorization specification.\
You can use this repo's [Example MCP Client](mcp-client/README.md), which runs as a console application.\
Use the following commands to run the client.

```bash
cd mcp-client
npm install
npm start
```

The MCP client integrates with the MCP server to run OAuth flows and make a secured connection.\
The user can then run MCP tools to invoke API requests and access authorized resources.\
The example API returns some hard-coded fictional stock prices.

```text
🚀 Simple MCP OAuth Client
Connecting to: http://mcp.demo.example

🔗 Attempting to connect to http://mcp.demo.example...
🔐 Creating OAuth provider...
🔐 OAuth provider created
👤 Creating MCP client...
👤 Client created
🔐 Starting OAuth flow...
🚢 Creating transport with OAuth provider...
🚢 Transport created
🔌 Attempting connection (this will trigger OAuth redirect)...
📌 OAuth redirect handler called - opening browser
🔐 OAuth required - waiting for authorization...
OAuth callback server started on http://localhost:8090
📥 Received callback: /callback?iss=http%3A%2F%2Flogin.demo.example%2Foauth%2Fv2%2Foauth-anonymous&code=VTrM7o0KzCRIdE2bMm9MByosKocMa9w3
✅ Authorization code received: VTrM7o0KzC...
🔐 Authorization code received: VTrM7o0KzCRIdE2bMm9MByosKocMa9w3
🔌 Reconnecting with authenticated transport...
🚢 Creating transport with OAuth provider...
🚢 Transport created
🔌 Attempting connection (this will trigger OAuth redirect)...
✅ Connected successfully

🎯 Interactive MCP Client with OAuth
Commands:
  list - List available tools
  call <tool_name> [args] - Call a tool
  quit - Exit the client

mcp> call fetch-stock-prices

🔧 Tool 'fetch-stock-prices' result:
[{"id":"MSFT","name":"Microsoft Corporation","price":450.22},{"id":"AAPL","name":"Apple Inc","price":250.62},{"id":"INTC","name":"Intel Corp","price":21.07}]
```

### MCP Client Flow

The MCP client uses the following steps to get an access token and call the API:

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

![user-authentication](images/user-authentication.png)

Users must then consent to granting the MCP client access to API data.\
The user is informed about the level of data access the AI agent requests.

![user-consent](images/user-consent.png)

### Secure Access Tokens

The MCP client then receives the following form of token response:

```json
{
  "access_token": "_0XBPWQQ_d8ed4b47-7d85-455f-8d7e-03b08e84428b",
  "token_type": "bearer",
  "expires_in": 900,
  "scope": "stocks/read",
}
```

Notice the following access token characteristics returned to MCP clients (and therefore AI agents).\
These measures help to mitigate risks of releasing access tokens to AI agents:

- The MCP client is unable to read any access token claims.
- The token has a limited scope and read-only access.
- The token is short-lived and no refresh token is issued.

The Kong API gateway exposes both [MCP routes and API routes](apigateway/kong.yml).\
When the MCP client calls the MCP server the phantom token plugin introspects opaque access tokens.\
The MCP server receives a JWT access tokens with a payload similar to the following.\
The MCP server does not need to process JWTs and simply forwards them to upstream APIs.

```json
{
  "jti": "2dc6cc38-d77f-4378-ba80-ba9d945141ff",
  "delegationId": "cd0c96fd-5fc3-4a92-a9fc-caf40e4e9b0c",
  "exp": 1749650409,
  "nbf": 1749650109,
  "scope": "stocks/read",
  "iss": "http://login.demo.example/oauth/v2/oauth-anonymous",
  "sub": "john.doe@demo.example",
  "aud": "8e636b87-6b22-4ca0-a602-a8ecacec1b84",
  "iat": 1749650109,
  "purpose": "access_token"
}
```

The Curity Identity Server can also issue any custom claims to the access token.\
APIs must then authorize using [scopes](https://curity.io/resources/learn/scope-best-practices/) and [claims](https://curity.io/resources/learn/claims-best-practices/).

## Website Documentation

See the following resources to read further information on security concepts, threats and mitigations.\
The tutorial provides further details on the code example's behaviors.

- [Design MCP Authorization for APIs](https://curity.io/resources/learn/design-mcp-authorization-apis/)
- [Implementing MCP Server Authorization for APIs](https://curity.io/resources/learn/implementing-mcp-authorization-apis/)

## More Information

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
