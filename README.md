# AI Agent Secure API Access

A deployment fgor a local computer to demonstrate how to securely expose APIs to third-party AI agents.\
A utility MCP server implements the server side of the [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) specification.

## Backend Components

The backend includes a utility MCP server that provides an API entry point for AI agents that use MCP clients.\
The Curity Identity Server uses OAuth standards to authenticate users and issue access tokens to AI agents.

| Endpoint | URL |
| -------- | --- |
| Trades API | http://api.demo.example/trades |
| Utility MCP Server | http://mcp.demo.example |
| Curity Identity Server Admin UI | http://admin.demo.example/admin |
| Curity Identity Server OAuth Metadata | http://login.demo.example/.well-known/oauth-authorization-server |
| Test Email Inbox | http://mail.demo.example |

Add the following entries to the `/etc/hosts` file to enable the use of these domains on your local computer.

```text
127.0.0.1 api.demo.example mcp.demo.example admin.demo.example login.demo.example mail.demo.example
```

## Run the End-to-End Flow

### Install Prerequisites

First, install Docker, Node.js and the envsubst tool on your local computer.\
Also download a [Trial License](https://developer.curity.io/free-trial) for the Curity Identity Server from the Curity developer portal.\
Save it to your desktop as a `license.json` file.

### Deploy the Backend

Deploy all backend components including the MCP server.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Run an AI Agent

An AI agent can use any MCP client that implements the client side of the MCP authorization specification.\
The repo includes an adapted version of the [TypeScript SDK Example MCP OAuth Client](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/client/simpleOAuthClient.ts).

Use the following commands to run the MCP client.

```bash
cd mcp-client
npm install
npm start
```

The MCP client calls the MCP server which returns a 401 unauthorized response.

### Getting an Access Token

The MCP client first uses dynamic client registration to create an OAuth client at the authorization server.\
The MCP client then runs a code flow and only the following administrator approved (precreated) users can sign in.

| User Corporate Email | User Region |
| -------------------- | ----------- |
| john.doe@demo.example | Europe |
| jane.test@demo.example | USA |

To authenticate, type in one of the above emails and then get a one-time code from the test email inbox.\
Users authenticate with their corporate email and must consent to granting the AI agent access to trades data.

### Secure Access Tokens

The MCP client then receives a token response with an opaque access token and limited scopes.\
The AI agent is unable to read the token and gain access to sensitive data intended for APIs.

```json
TODO
```

### Secure Data Access

The AI agent's MCP client can then call the MCP server with an access token and gain access to API data.\
The example MCP client opens an interactive shell from which you invoke MCP server tools like an AI agent does.

```bash
call fetch-trades
```

The tool forwards the request to an upstream OAuth-secured API and receives a response payload.\
The demo API returns some hard coded data to represent sensitive data about financial trades.\

```json
[
  {
    "trade_id": 78122,
    "time": "2025-03-07T09:45:39",
    "stock_id": 9981,
    "quantity": 450,
    "amountUSD": 90000,
    "region": "USA",
  },
  {
    "trade_id": 78124,
    "time": "2025-03-07T09:47:56",
    "stock_id": 7865,
    "quantity": 2000,
    "amountUSD": 160000,
    "region": "USA",
  }
]
```

The backend enforces the following security behaviors to restrict the API access granted to AI agents.

- Only administrator approved users are granted access, who must prove their identity by verifying their email.
- The AI agent receives a least privilege access token with restricted read-only scopes and the user's identity.
- The API restricts access to business resources using the access token.
- The AI agent uses opaque access tokens to avoid revealing API claims to AI agents.
- The AI agent receives short-lived access tokens and does not receive refresh tokens.

## Website Documentation

See the following resources to read further information on MCP security concepts and the example code.

- [Securely Expose APIs to AI Agents](https://curity.io/resources/learn/securely-expose-apis-to-ai-agents/)
- [AI Agent Secure API Access Tutorial](https://curity.io/resources/learn/ai-agent-secure-api-access/)

## More Information

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
