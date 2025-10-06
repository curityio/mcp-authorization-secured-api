# Debugging MCP Connections

To debug MCP and OAuth messages, an HTTP proxy tool like [mitmproxy](https://mitmproxy.org/) can be very useful.\
The following screenshot shows a streamable HTTP request when an MCP tool is called.

![HTTP Proxy Capture](../images/http-proxy-capture.png)

## Run mitmproxy

Follow the [installation instructions](https://docs.mitmproxy.org/stable/overview/installation/).\
Then create an `init.py` script to restrict request capturing to the example deployment's endpoints:

```python
from mitmproxy import ctx

def load(loader):
    ctx.options.view_filter = "~d demo.example"
```

Then run a command such as the following and open the browser at `http://localhost:8889`:

```bash
mitmweb -p 8888 --web-port 8889 --ssl-insecure --script init.py
```

## Debugging Claude Code

You can set these environment variables to capture traffic from Claude Code:

```bash
export HTTPS_PROXY=http://127.0.0.1:8888
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Debugging Node.js Code

For some code bases you may need to explicitly wire up a proxy agent to a fetch library.\
For example, you can add the following to the top of the TypeScript SDK Example OAuth client.

```javascript
import { setGlobalDispatcher, ProxyAgent } from 'undici';

if (process.env.http_proxy) {
  const dispatcher = new ProxyAgent({uri: new URL(process.env.http_proxy).toString() });
  setGlobalDispatcher(dispatcher);
}
```
