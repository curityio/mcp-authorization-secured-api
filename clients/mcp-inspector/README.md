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

## DCR Request

The example client sends the following DCR request details:

```json
{
    "client_name": "MCP Inspector",
    "client_uri": "http://localhost:6274",
    "grant_types": [
        "authorization_code",
        "refresh_token"
    ],
    "redirect_uris": [
        "http://localhost:6274/oauth/callback",
        "http://localhost:6274/oauth/callback/debug"
    ],
    "response_types": [
        "code"
    ],
    "scope": "",
    "token_endpoint_auth_method": "none"
}
```

Note that the MCP authorization specification does not specify a default scope.\
The client therefore uses an empty scope to start an MCP tools session.

The client also indicates that it is a public client with `token_endpoint_auth_method=none`.\
The Curity Identity Server overrides this and returns a client secret.\
Each distinct user gets a different client secret with which to retrieve access tokens.

## CORS

The MCP inspector calls the deployed endpoints directly from the browser.\
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

Often though, backends will not grant CORS access to web clients.\
Therefore, it would be better if the MCP inspector instead used backend requests.\
The web client could then manage its client credential in a more secure way.
