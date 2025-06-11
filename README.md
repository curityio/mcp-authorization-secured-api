# AI Agent Secure API Access using Model Context Protocol

A local computer deployment to demonstrate how to use MCP to securely expose APIs to third-party AI agents.\
The deployment shows how to implement the [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) specification.

## Backend Endpoints

The backend includes a utility MCP server that provides a secure API entry point for AI agents that use MCP clients.\
The Curity Identity Server implements OAuth standards to enable the authorization from the specification.

| Endpoint | URL |
| -------- | --- |
| Stocks API | http://api.demo.example/stocks |
| Utility MCP Server | http://mcp.demo.example |
| Curity Identity Server Admin UI | http://admin.demo.example/admin |
| Curity Identity Server OAuth Metadata | http://login.demo.example/.well-known/oauth-authorization-server |
| Test Email Inbox | http://mail.demo.example |

Add the following entries to the `/etc/hosts` file to enable the use of these domains on your local computer.

```text
127.0.0.1 api.demo.example mcp.demo.example admin.demo.example login.demo.example mail.demo.example
```

## Run the End-to-End Flow

The example shows how an AI agent could access secure information.\
The API data in this example contains only fictional hard-coded stock prices.

### Install Prerequisites

First, install Docker, Node.js and the envsubst tool on your local computer.\
Also download a [Trial License](https://developer.curity.io/free-trial) for the Curity Identity Server from the Curity developer portal.\
Save it to your desktop as a `license.json` file.

### Deploy the Backend

Deploy all backend components:

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Run an AI Agent

An AI agent can use any MCP client that implements the client side of the MCP authorization specification.\
The repo includes an adapted version of the [TypeScript SDK Example MCP OAuth Client](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/client/simpleOAuthClient.ts).\
Use the following commands to run the MCP client.

```bash
cd mcp-client
npm install
npm start
```

Initially, the MCP client calls the MCP server which returns a 401 unauthorized response.

### Getting an Access Token

The MCP client uses dynamic client registration to create an OAuth client at the authorization server.\
The MCP client then runs a code flow and only the following administrator approved (precreated) users can sign in.

| User Corporate Email | User Region |
| -------------------- | ----------- |
| john.doe@demo.example | Europe |
| jane.test@demo.example | USA |

To authenticate, type in one of the above corporate emails and then get a one-time code from the test email inbox.\
Users must then consent to granting the AI agent access to stocks data.

### Secure Access Tokens

The MCP client then receives a token response with an opaque access token and limited scopes.\
The AI agent is unable to read the token and gain access to sensitive data intended for APIs.

```json
TODO
```

### Secure Data Access

The example MCP client opens an interactive shell from which you can invoke an MCP server tool to get stock prices.

```bash
call fetch-stock-prices
```

The AI agent's MCP client then calls the MCP server with an access token and gain access to API data.\
The [Phantom Token Pattern](https://curity.io/resources/learn/phantom-token-pattern/) runs in the API gateway and delivers a JWT access token to the MCP server.\
The MCP server forwards the JWT access token to the stocks API, which receives the following claims.

```json
TODO
```

The demo API returns some hard coded data to represent potentially sensitive data about stock prices.

```json
[
    {
        "id": "MSFT",
        "name": "Microsoft Corporation",
        "price": 450.22,
    },
    {
        "id": "AAPL",
        "name": "Apple Inc",
        "price": 250.62,
    },
    {
        "id": "INTC",
        "name": "Intel Corp",
        "price": 21.07,
    },
]
```

### Access Token Expiry

TODO

## Website Documentation

See the following resources to read further information on MCP security concepts and the example code.

- [Securely Expose APIs to AI Agents](https://curity.io/resources/learn/securely-expose-apis-to-ai-agents/)
- [AI Agent Secure API Access Tutorial](https://curity.io/resources/learn/ai-agent-secure-api-access/)

## More Information

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
