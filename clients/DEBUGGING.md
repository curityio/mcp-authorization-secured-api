# Debugging MCP Connections

To debug MCP and OAuth messages, an HTTP proxy tool like [mitmproxy](https://mitmproxy.org/) can be very useful:

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
