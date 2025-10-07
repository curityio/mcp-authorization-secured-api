# TypeScript SDK OAuth Client

The TypeScript SDK example OAuth client runs as an interactive console application.

## Usage

Execute the following script to clone the code for the TypeScripy SDK and run its example OAuth client.\
The client triggers the OAuth flow from this repository's main [README](../../README.md).

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
Opening browser to: https://login.demo.example/oauth/v2/oauth-authorize?response_type=code&client_id=24ae8cd9-3d44-434e-9506-1342d76eea5c&code_challenge=u1IP4WbEWQQbS04foPIsNdjE28v_-8yQefhrqr9zE9M&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2Fcallback&scope=stocks%2Fread
🌐 Opening browser for authorization: https://login.demo.example/oauth/v2/oauth-authorize?response_type=code&client_id=24ae8cd9-3d44-434e-9506-1342d76eea5c&code_challenge=u1IP4WbEWQQbS04foPIsNdjE28v_-8yQefhrqr9zE9M&code_challenge_method=S256&redirect_uri=http%3A%2F%2Flocalhost%3A8090%2Fcallback&scope=stocks%2Fread
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

## HTTP Request Capture Setup

To [Debug HTTP Requests](../DEBUGGING.md) you can add the following to the TypeScript SDK's `package.json` dependencies.\
Then run `npm install`:

```text
"undici": "^7.10.0"
```

Then add the following details to the top of `src/examples/client/simpleOAuthClient.ts`:

```javascript
import { setGlobalDispatcher, ProxyAgent } from 'undici';
const dispatcher = new ProxyAgent({uri: new URL('http://127.0.0.1:8888').toString() });
setGlobalDispatcher(dispatcher);
```

Then edit the `./run.sh` script and replace the `NODE_EXTRA_CA_CERTS` environment variable with this one.\
Then re-run the client to capture all of its OAuth-related HTTP requests:

```text
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Dynamic Client Creation

The example client sends the following DCR request details.\
Note that the MCP authorization specification does not say how to specify the default scope.\
The client therefore uses a hard coded scope to start an MCP tools session.

```json
{
    "client_name": "Simple OAuth MCP Client",
    "grant_types": [
        "authorization_code",
        "refresh_token"
    ],
    "redirect_uris": [
        "http://localhost:8090/callback"
    ],
    "response_types": [
        "code"
    ],
    "scope": "mcp:tools",
    "token_endpoint_auth_method": "client_secret_post"
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
    "client_id": "faf93937-d700-427c-8034-7d3fc111ce48",
    "client_id_issued_at": 1759825945,
    "client_name": "Simple OAuth MCP Client",
    "client_secret": "w_7sTPp97WHsKyfXMsF4OnzSzFvuc9RCrmryzvWcXRY",
    "client_secret_expires_at": 0,
    "default_acr_values": [
        "urn:se:curity:authentication:email:email"
    ],
    "grant_types": [
        "authorization_code"
    ],
    "post_logout_redirect_uris": [],
    "redirect_uris": [
        "http://localhost:8090/callback"
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

## Dynamic Client Creation

## Login and Token Flow

The client sends the following form of front channel request.\
Note that the client does not send a scope, since the MCP authorization does not yet define how that works:

```http
https://login.demo.example/oauth/v2/oauth-authorize
    ?response_type=code
    &client_id=e986c867-aba8-494c-8681-ebaf5c1266c2
    &code_challenge=smTSjLwxtHVdi8_jRkJkeygwYEKPBcJ-PEeNWr_LrUI
    &code_challenge_method=S256
    &redirect_uri=http://localhost:65343/callback
    &state=iGtjhJO4i-0Bxxb6q1A4lkcx6antjlXRRhPzTan81Dg
    &resource=https://mcp.demo.example/
```

The client then sends the following form of back channel request:

```text

grant_type:    authorization_code
code:          ekgBhvoQAByoT5520ZRQhLtGa2KU9tTd
code_verifier: 4F.adBoQzg1s3pFCaOA00Dv4bb6B0D4sll9glHPHo4M
redirect_uri:  http://localhost:65343/callback
client_id:     e986c867-aba8-494c-8681-ebaf5c1266c2
client_secret: QIwqlrB9JX6H4WjSLCZhzRoGA5105yjGIKmEF-BGdZg
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
