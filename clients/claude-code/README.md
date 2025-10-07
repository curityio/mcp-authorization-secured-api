# Claude Code

Claude Code runs as an interactive console application.\
To use Claude Code you need a [paid account](https://claude.com/pricing).\
For example, you could get started with a `Pro` individual account.

## Install Claude Code

Run the installation command:

```bash
npm install -g @anthropic-ai/claude-code
```

## Usage

Execute the following script from the current folder to run Claude Code in debug mode:

```bash
./run.sh
```

The client triggers the OAuth flow from this repository's main [README](../../README.md).\
You can then ask Claude a question related to stocks and it calls the MCP server:

![claude code](../../images/claude-code.png)

## Troubleshooting

When Claude Code starts in debug mode it outputs the path to a log file.\
Tail the log file in another terminal window in case you need to troubleshoot:

```bash
tail -f ~/Library/Logs/claude-cli-nodejs/-Users-MYUSER-dev-claude/debug-logs/debug.txt
```

## HTTP Request Capture Setup

To [Debug HTTP Requests](../DEBUGGING.md), edit the `run.sh` script.\
Remove the `NODE_EXTRA_CA_CERTS` environment variable and add these ones:

```bash
export HTTPS_PROXY=http://127.0.0.1:8888
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Dynamic Client Creation

Claude Code acts as an MCP client and sends the following DCR request details:

```json
{
    "client_name": "Claude Code (curity_demo)",
    "grant_types": [
        "authorization_code",
        "refresh_token"
    ],
    "redirect_uris": [
        "http://localhost:63658/callback"
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
    "client_id": "e986c867-aba8-494c-8681-ebaf5c1266c2",
    "client_id_issued_at": 1759825565,
    "client_name": "Claude Code (curity_demo)",
    "client_secret": "QIwqlrB9JX6H4WjSLCZhzRoGA5105yjGIKmEF-BGdZg",
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
