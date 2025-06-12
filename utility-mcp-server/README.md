# TypeScript SDK Example OAuth-Secured MCP Server

The streamable HTTP logic is adapted from the [TypeScript SDK Example Simplew Streamable HTTP with OAuth](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/server/simpleStreamableHttp.ts).

## MCP Server Security

The MCP server itself does not manage any secured resources and forwards access tokens to upstream APIs.\
Still, the MCP server requires the client to have an opaque access token that has passed introspection.\
This secures the MCP server without needing any OAuth security code.