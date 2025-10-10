# MCP Inspector OAuth Client

The MCP inspector runs as a local web client that runs at `http://localhost:6274`.

## Usage

Execute the following script from the current folder.\
The code clones the code for the MCP inspector and runs its web client:

```bash
./run.sh
```

## Client Behavior

Wait for a few seconds and the MCP inspector opens in the browser.\
Configure the following properties in the browser frontend:

- Transport Type = Streamable HTTP
- URL: `https://mcp.demo.example`

Then click the `Connect` button and run the authentication flow.\
The client triggers the OAuth flow from this repository's main [README](../../README.md).\
The client then provides a web user interface and the user can invoke API operations as MCP tools:

![MCP inspector](../../images/inspector.png)

## CORS

The MCP inspector calls the example deployment's endpoints directly from the browser.\
Therefore, the example deployment's API gateway must use a CORS plugin to grant access to the web client:

```yaml
- name: mcp-server-resource-metadata
  url: http://mcp-server:3000/.well-known/oauth-protected-resource
  routes:
  - name: mcp-server-resource-metadata-route
    hosts:
    - mcp.demo.example
    paths:
    - /.well-known/oauth-protected-resource
  plugins:
  - name: cors
    config:
      origins:
      - 'http://localhost:6274'
```      

Usually though, backends will not grant CORS access to unknown web clients.\
Therefore, a better option would be for the MCP inspector to send requests from its backend.

## Capture OAuth and MCP Requests

The [OAuth and MCP Requests](../OAUTH-MCP-MESSAGES.md) summary summarizes the OAuth and MCP messages.
