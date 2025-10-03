# Claude

To connect to the MCP server using Claude you currently need a [paid account](https://claude.com/pricing).\
For example, you could get started with a `Pro` individual account.

## Install Claude Code

Run the installation command:

```bash
npm install -g @anthropic-ai/claude-code
```

Then run the `claude` command from a command shell.\
Authenticate with your paid Claude account when prompted.

## Use the MCP Server with Claude Code

After running the example deployment, register the MCP server:

```bash
claude mcp add --transport http curity_demo https://mcp.demo.example
```

Then run Claude in debug mode:

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
claude --debug
```

Next run the following command from the Claude shell:

```bash
/mcp
```

Currently I get this error message trying to connect:

```text
Error: token_endpoint_auth_method is not supported
```

## Use the MCP Server with Claude Desktop

At the time of writing there may be an [open issue](https://github.com/anthropics/claude-code/issues/5826).
