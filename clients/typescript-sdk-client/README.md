# TypeScript SDK OAuth Client

The TypeScript SDK example OAuth client runs as an interactive console application.

## Prerequisites

First, install the [pnpm](https://pnpm.io/installation) tool that the TypeScript SDK examples require.

## Usage

Execute the following script to clone the code for the TypeScript SDK and run its example OAuth client.\
The client triggers the OAuth flow for public Ephemeral Clients from this repository's main [README](../../README.md) using `https://www.client.example/typescript-sdk-client.json` for the `client_id`.

```bash
./run.sh
```

## Client Behavior

The client provides output during the OAuth flow.\
The client then provides an interactive CLI and the user can invoke API operations as MCP tools:

```text
🚀 Simple MCP OAuth Client
Connecting to: https://mcp.demo.example

🔗 Attempting to connect to https://mcp.demo.example...
🔐 Creating OAuth provider...
🔐 OAuth provider created
👤 Creating MCP client...
👤 Client created
🔐 Starting OAuth flow...
🚢 Creating transport with OAuth provider...
🚢 Transport created
🔌 Attempting connection (this will trigger OAuth redirect)...
📌 OAuth redirect handler called - opening browser
Opening browser to: https://login.demo.example/oauth/v2/oauth-authorize?response_type=code&client_id=https%3A%2F%2Fwww.client.example%2Ftypescript-sdk-client.json&code_challenge=aPLm1MlU_y72vy1ixikXm8kRX_272cN5b-4G6yvjnKk&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2Fcallback&scope=stocks%2Fread&resource=https%3A%2F%2Fmcp.demo.example%2F
🌐 Opening browser for authorization: Opening browser for authorization: https://login.demo.example/oauth/v2/oauth-authorize?response_type=code&client_id=https%3A%2F%2Fwww.client.example%2Ftypescript-sdk-client.json&code_challenge=aPLm1MlU_y72vy1ixikXm8kRX_272cN5b-4G6yvjnKk&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2Fcallback&scope=stocks%2Fread&resource=https%3A%2F%2Fmcp.demo.example%2F
🔐 OAuth required - waiting for authorization...
OAuth callback server started on http://localhost:8090
📥 Received callback: /callback?iss=http%3A%2F%2Flogin.demo.example%2Foauth%2Fv2%2Foauth-anonymous&code=dodc5hVzHJ3kAKmHgnGRyiyNgkVIVyNx
✅ Authorization code received: dodc5hVzHJ...
🔐 Authorization code received: dodc5hVzHJ3kAKmHgnGRyiyNgkVIVyNx
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
[{"id":"COM1","name":Company 1","price":450.22},{"id":"COM2","name":"Company 2","price":250.62},{"id":"COM3","name":"Company 3","price":21.07}]
```

## Capture OAuth and MCP Requests

The [OAuth and MCP Requests](../OAUTH-MCP-MESSAGES.md) summary explains the OAuth and MCP messages.

Note, if you experience errors with the Curity Identity Server fetching the client ID metadata document when running the client, check the `/etc/hosts` file. Make sure it contains the following line and add it if it's missing to ensure proper routing for the authorization server. 

```text
127.0.0.1 host.docker.internal
```

## Developing MCP Clients

If you want to develop your own MCP clients you can use the TypeScript SDK library.\
Implement your own client based on this example client.\
After running the example, find that client at `src/examples/client/simpleOAuthClient.ts` in the `typescript-sdk` folder.
