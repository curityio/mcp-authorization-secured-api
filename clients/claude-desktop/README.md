# Claude Desktop

Claude Desktop runs as an interactive console application and you need a [paid account](https://claude.com/pricing).\
For example, you could get started with a `Pro` individual account.

## Configure Claude Desktop

In Claude Desktop, select `Settings / Developer` and then the `Edit Config` option.\
Provide a configuration file with the following settings and then restart Claude Desktop.\
Make sure you use the correct certificate file path for your computer:

```json
{
  "mcpServers": {
    "curity-demo": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.demo.example", "--static-oauth-client-metadata", "{ \"client_name\": \"Claude (curity-demo)\", \"scope\": \"stocks/read\" }"],
      "env": {
		"NODE_EXTRA_CA_CERTS": "/Users/MYUSER/dev/mcp-authorization-secured-api/apigateway/certs/example.ca.crt"
      }
    }
  }
}
```

The [MCP Remote](https://github.com/geelen/mcp-remote) library makes the underlying OAuth and MCP requests.\
A static scope is configured until the mcp-remote library implements the [Scope Selection Strategy](https://modelcontextprotocol.io/specification/draft/basic/authorization#scope-selection-strategy).

## Usage

You can then just ask Claude Desktop a natural language question.\
The client triggers the OAuth flow from this repository's main [README](../../README.md).

![claude desktop](../../images/claude-desktop.png)

After login, Claude Desktop stores its dynamic client information and tokens.\
You can view details in the `~/.mcp-auth` folder or delete the folder to reset Claude's state.

## Troubleshoot

If you need to troubleshoot, see the file for the MCP server in the logs folder:

![claude desktop troubleshoot](../../images/claude-desktop-troubleshoot.png)

## Capture OAuth and MCP Requests

The [OAuth and MCP Requests](../OAUTH-MCP-MESSAGES.md) summary summarizes the OAuth and MCP messages.

## Developing MCP Clients

If you want to develop your own AI agent that runs MCP clients, you can also use the MCP Remote library.\
Follow the same approach as Claude to integrate MCP clients from contributor.
