# Claude Code

Claude Code runs as an interactive console application and you need a [paid account](https://claude.com/pricing).\
For example, you could get started with a `Pro` individual account.

## Install Claude Code

Run the installation command, after which you can run Claude Code with the `claude` command:

```bash
npm install -g @anthropic-ai/claude-code
```

## Configure Claude Code

This folder includes a configuration with settings of the following form.\
Make sure you edit the file to use the correct certificate file path for your computer:

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

Execute the following script from the current folder to run Claude Code in debug mode:

```bash
./run.sh
```

Run the `/mcp` CLI command to switch to MCP mode and trigger authentication when prompted.\
After login, Claude stores its dynamic client information and tokens.\
You can view details in the `~/.mcp-auth` folder or delete the folder to reset Claude's state.\
You can then ask Claude a question related to stocks and it calls the MCP server:

![claude code](../../images/claude-code.png)

After login, Claude Desktop stores its dynamic client information and tokens.\
You can view details in the `~/.mcp-auth` folder or delete the folder to reset Claude's state.

## Troubleshooting

When Claude Code starts in debug mode it outputs the path to a log file.\
Tail the log file in another terminal window in case you need to troubleshoot:

```bash
tail -f ~/Library/Logs/claude-cli-nodejs/-Users-MYUSER-dev-claude/debug-logs/debug.txt
```

## Capture OAuth and MCP Requests

It can be easier to trace HTTP messages with Claude Code than with Claude Desktop.\
The [OAuth and MCP Requests](../OAUTH-MCP-MESSAGES.md) summary summarizes the OAuth and MCP messages.
