# AI Agent Secure API Access

A deployment fgor a local computer to demonstrate how to securely expose APIs to third-party AI agents.\
A utility MCP server implements the server side of the [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) specification.

## Backend Components

The backend includes a utility MCP server that provides an API entry point for AI agents that use MCP clients.\
The Curity Identity Server uses OAuth standards to authenticate users and issue access tokens to AI agents.

| Component | URL |
| --------- | --- |
| Users API | http://api.example.com/users |
| Utility MCP Server | http://mcp.example.com |
| Curity Identity Server Admin UI | http://admin.example.com/admin |
| Curity Identity Server OAuth Metadata | http://login.example.com/.well-known/oauth-authorization-server |

Add the following entries to the `/etc/hosts` file to enable the use of these domains on your local computer.

```text
127.0.0.1 api.example.com mcp.example.com admin.example.com login.example.com agent.external.example
```

## Deploy the Backend

First, install Docker, Node.js and the envsubst tool on your local computer.\
Also download a [Trial License](https://developer.curity.io/free-trial) for the Curity Identity Server from the Curity developer portal.\
Save it to your desktop as a `license.json` file.

### Option 1: Deployed MCP Server

Deploy all backend components including the MCP server.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
./build.sh
./deploy.sh
```

### Option 2: Local MCP Server

If you prefer, you can instead run the MCP server for development at `http://localhost:3000`.

```bash
cd utility-mcp-server
npm install
npm start
```

Then use an environment variable to point the deployment to the local MCP server.

```bash
export LICENSE_FILE_PATH=~/Desktop/license.json
export RUN_LOCAL_MCP_SERVER='true'
./build.sh
./deploy.sh
```

## Run an AI Agent

An AI agent can use any MCP client that implements the client side of the MCP authorization specification.\
The repo includes an adapted version of the [TypeScript SDK Example MCP OAuth Client](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/client/simpleOAuthClient.ts).

### Option 1

If you used the option 1 backend deployment, use the following commands to run the MCP client.

```bash
cd mcp-client
npm install
npm start
```

### Option 2

If you used the option 2 backend deployment, use the following commands to run the MCP client.

```bash
export MCP_SERVER_URL='http://localhost:3000'
cd mcp-client
npm install
npm start
```

### Secure Data Access

The MCP client calls the MCP server which returns a 401 unauthorized response.\
The MCP client then runs the following OAuth flows.

- Dynamic client registration to create an OAuth client at the authorization server.
- A code flow where the user must authenticate and consent to granting the AI agent access to resources.

The AI agent's MCP client can then call the MCP server with an access token and gain access to API data.\
The example MCP client opens an interactive shell from which you invoke MCP server tools like an AI agent does.

```bash
call fetch-users
```

The tool forwards the request to an upstream OAuth-secured API and receives a response payload.

```json
[
  {
    "given_name": "John",
    "family_name": "Doe",
    "email": "john.doe@customer.example"
  },
  {
    "given_name": "Jane",
    "family_name": "Doe",
    "email": "jane.doe@customer.example"
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
