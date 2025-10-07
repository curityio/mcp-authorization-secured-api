# Claude Desktop

Claude Desktop runs as a local console application.\
To use Claude Desktop you need a [paid account](https://claude.com/pricing).\
For example, you could get started with a `Pro` individual account.

## Configure Claude Desktop

In Claude Desktop, select `Settings / Developer` and then the `Edit Config` option.\
Provide the URL to the MCP server and the full path to the development root certificate.\
Then restart Claude Desktop:

```json
{
  "mcpServers": {
    "curity-demo": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.demo.example", "--debug"],
      "env": {
        "NODE_EXTRA_CA_CERTS": "/Users/MYUSER/dev/mcp-authorization-secured-api/apigateway/certs/example.ca.crt"
      }
    }
  }
}
```

## Usage

You can then just ask Claude Desktop a natural language question.\
The client triggers the OAuth flow from this repository's main [README](../../README.md).

![claude desktop](../../images/claude-desktop.png)

## Troubleshoot

If you need to troubleshoot, see the file for the MCP server in the logs folder:

![claude desktop troubleshoot](../../images/claude-desktop-troubleshoot.png)

## HTTP Request Capture Setup

The Node.js options do not seem to be supported by Claude Desktop.\
However, you can [Debug HTTP Requests](../DEBUGGING.md) by logging API gateway messages.

## Dynamic Client Creation

Claude Desktop acts as an MCP client and sends DCR request details of the following form.\
The [MCP Remote](https://github.com/geelen/mcp-remote) library makes the underlying request:

```json
{
    "client_name": "MCP CLI Proxy",
    "client_uri": "https://github.com/modelcontextprotocol/mcp-cli"
    "grant_types": [
        "authorization_code",
        "refresh_token"
    ],
    "redirect_uris": [
        "http://localhost:53069/callback"
    ],
    "response_types": [
        "code"
    ],
    "token_endpoint_auth_method": "none"
}
```

Note that the MCP authorization specification does not specify a default scope.\
The client therefore does not send a scope parameter.\
However, the Curity Identity Server grants the client access to a low-privilege scope:

```json
{
    "access_token_ttl": 900,
    "audiences": [
        "https://mcp.demo.example/"
    ],
    "client_id": "15d64f90-5df1-4ab8-ae48-af0aa2e6d562",
    "client_id_issued_at": 1759825565,
    "client_name": "MCP CLI Proxy",
    "client_secret": "lYo5fRR4mMn9bTxIbigv9ZCn1lT6BEKuHA3zZpOxR0s",
    "client_secret_expires_at": 0,
    "default_acr_values": [
        "urn:se:curity:authentication:email:email"
    ],
    "grant_types": [
        "authorization_code"
    ],
    "post_logout_redirect_uris": [],
    "redirect_uris": [
        "http://localhost:65343/callback"
    ],
    "require_proof_key": true,
    "requires_consent": true,
    "response_types": [
        "code"
    ],
    "scope": "stocks/read",
    "subject_type": "public",
    "token_endpoint_auth_method": "client_secret_basic",
    "token_endpoint_auth_methods": [
        "client_secret_basic",
        "client_secret_post"
    ]
}
```

The client also indicates that it is a public client with `token_endpoint_auth_method=none`.\
The Curity Identity Server overrides this and returns a client secret.\
Each distinct user gets a different client secret with which to retrieve access tokens.

## Login and Token Flow

The client sends the following form of front channel request.\
Note that the client does not send a scope, since the MCP authorization does not yet define how that works:

```text
https://login.demo.example/oauth/v2/oauth-authorize
    ?response_type=code
    &client_id=15d64f90-5df1-4ab8-ae48-af0aa2e6d562
    &code_challenge=smTSjLwxtHVdi8_jRkJkeygwYEKPBcJ-PEeNWr_LrUI
    &code_challenge_method=S256
    &redirect_uri=http://localhost:53069/callback
    &state=iGtjhJO4i-0Bxxb6q1A4lkcx6antjlXRRhPzTan81Dg
    &resource=https://mcp.demo.example/
```

The client then sends the following form of back channel request:

```text

grant_type:    authorization_code
code:          ekgBhvoQAByoT5520ZRQhLtGa2KU9tTd
code_verifier: 4F.adBoQzg1s3pFCaOA00Dv4bb6B0D4sll9glHPHo4M
redirect_uri:  http://localhost:53069/callback
client_id:     15d64f90-5df1-4ab8-ae48-af0aa2e6d562
client_secret: lYo5fRR4mMn9bTxIbigv9ZCn1lT6BEKuHA3zZpOxR0s-BGdZg
resource:      https://mcp.demo.example/
```

The Curity Identity Server then issues an access token with the low-privilege scope:

```json
{
    "access_token": "_0XBPWQQ_5d049ae7-01d7-4f48-bc6b-8cc833d249e9",
    "expires_in": 900,
    "scope": "stocks/read",
    "token_type": "bearer"
}
```
