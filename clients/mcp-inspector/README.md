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

## Dynamic Client Creation

The MCP inspector sends the following DCR request details. and uses the scope from discovery responses:

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
    "scope": "stocks/read",
    "token_endpoint_auth_method": "none"
}
```

The Curity Identity Server's example configuration grants the client access to request a low-privilege scope:

```json
{
    "access_token_ttl": 900,
    "audiences": [
        "https://mcp.demo.example/"
    ],
    "client_id": "cedbde28-20ba-45a7-9577-41aed933e857",
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

## Login and Token Flow

The client sends the following form of front channel request, without a scope parameter.\
It uses the scope from discovery responses.

```text
https://login.demo.example/oauth/v2/oauth-authorize
    ?response_type=code
    &client_id=0f6bf182-bb0c-4a6c-a775-6ef3b239501a
    &scope=stocks/read
    &code_challenge=aM4KX66YNNphYvRBvdfRK_hiM_VD-XxRFd8mioeAwW8
    &code_challenge_method=S256
    &redirect_uri=http%3A%2F%2Flocalhost%3A6274%2Foauth%2Fcallback
    &state=7bbb86503ec9e4dd0b085aa4bc9bee34998a1d74ae12538101532c83472c72c0
    &resource=https%3A%2F%2Fmcp.demo.example%2F
```

The client then sends the following data in a back channel request.\
The request includes the `client_id` and `client_secret` in a Basic Authorization header:

```text
grant_type:    authorization_code
scope:         stocks/read
code:          Whj7fi4SEF97JveZGK4SJqwN53mXTl5D
code_verifier: d-mJkRHOfoBPR6gTa534YUzSH0Y38n3YMYoW4NIzRce
redirect_uri:  http://localhost:6274/oauth/callback
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
