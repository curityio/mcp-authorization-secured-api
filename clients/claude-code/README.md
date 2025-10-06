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

## NOTES

This is the DCR request.\

```


```json
{
    "client_name": "Claude Code (curity_demo)",
    "grant_types": [
        "authorization_code",
        "refresh_token"
    ],
    "redirect_uris": [
        "http://localhost:64997/callback"
    ],
    "response_types": [
        "code"
    ],
    "token_endpoint_auth_method": "none"
}
```