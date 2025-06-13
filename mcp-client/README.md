# TypeScript SDK Example OAuth Client

This is a copy of the [TypeScript SDK Example MCP OAuth Client](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/src/examples/client/simpleOAuthClient.ts) with minor changes.

## Minor Changes

The initial request URL from the MCP client was updated to match this deployment.

```typescript
const DEFAULT_SERVER_URL = 'http://mcp.demo.example/stocks';
```

The scope was updated to match this deployment.

```typescript
const clientMetadata: OAuthClientMetadata = {
    client_name: 'Simple OAuth MCP Client',
    redirect_uris: [CALLBACK_URL],
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
    scope: 'stocks/read'
};
```

The following code was added to support capturing MCP, OAuth and API requests in an HTTP proxy tool.

```typescript
import { setGlobalDispatcher, ProxyAgent } from 'undici';

if (process.env.http_proxy) {
  const dispatcher = new ProxyAgent({uri: new URL(process.env.http_proxy).toString() });
  setGlobalDispatcher(dispatcher);
}
```

## View MCP Messages with an HTTP Proxy

The following screenshot shows a streamable HTTP request when an MCP tool is called.

![HTTP Proxy Capture](../images/http-proxy-capture.png)

You first need to install an HTTP proxy tool like [mitmproxy](https://mitmproxy.org/).\
Save the following small script as `init.py` to limit traffic to the code example's URLs:

```python
from mitmproxy import ctx

def load(loader):
    ctx.options.view_filter = "~d demo.example"
```

Run the proxy with a command like this, which will open the browser at `http://localhost:8889`.

```bash
mitmweb -p 8888 --web-port 8889 --script init.py
```

Then configure the HTTP proxy against the local computer's network connection:

![HTTP Proxy Configure](../images/http-proxy-configure.png)

You can run the MCP client with the following commands to route messages via the HTTP proxy tool.

```bash
cd mcp-client
export http_proxy='http://127.0.0.1:8888'
npm install
npm start
```
