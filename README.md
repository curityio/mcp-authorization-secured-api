# AI Agent Secure API Access

A deployment that demonstrates how to securely expose APIs to third-party AI agents.\
A utility MCP server implements the server side of the [Model Content Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization) specification.

## Backend Components

The example deploys a utility MCP server that provides access to an API endpoint for MCP clients:

| Component | URL |
| --------- | --- |
| Users API | http://api.example.com/users |
| Utility MCP Server | http://mcp.example.com |
| Curity Identity Server Admin UI | http://admin.example.com/admin |
| Curity Identity Server OAuth Metadata | http://login.example.com/.well-known/oauth-authorization-server |

## Deploy the Backend

First download a [Trial License](https://developer.curity.io/free-trial) from the developer portal.\
Save it to your desktop as a `license.json` file.

### Option 1: Deployed MCP Server

Deploy all backend components including the MCP server:

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

## Connect an AI Agent that uses an MCP Client

AI agent can execute MCP clients that support the client side of the specification.\
The MCP client can then run a secure flow to connect to the API.\
The repo includes an adapted version of the [TypeScript SDK Example MCP OAuth Client](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/client/simpleOAuthClient.ts).\
Run it with the following commands:

```bash
cd mcp-client
npm install
npm start
```

The MCP server returns a 401 unauthorized response to initiate an OAuth flow, after which the MCP client runs these operations:

- Dynamic client registration to create a client at the authorization server.
- A code flow where the user must authenticate and consent.
- The AI agent's MCP client can then call APIs with an access token.

## Secure Data Access

The example highlights 

- Only administrator approved users are granted access, who must prove their identity by verifying their email.
- The AI agent receives a least privilege access token with restricted read only scopes and the user's identity.
- The AI agent uses opaque access tokens to prevent revealing API data to AI agents.
- The AI agents receives short lived access tokens and does not receive refresh tokens.

## Website Documentation

See the following resources for further information on concepts and how the code example works:

- [Securely Expose APIs to AI Agents](https://curity.io/resources/learn/securely-expose-apis-to-ai-agents/)
- [AI Agent Secure API Access Tutorial](https://curity.io/resources/learn/ai-agent-secure-api-access/)

## More Information

Please visit [curity.io](https://curity.io/) for more information about the Curity Identity Server.
