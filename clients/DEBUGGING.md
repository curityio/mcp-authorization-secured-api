# Debugging MCP Connections

To debug MCP and OAuth messages, an HTTP proxy tool like [mitmproxy](https://mitmproxy.org/) can be very useful.\
The proxy can capture both browser and non-browser requests.

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

## Capture API Gateway Requests

Another option is to 

```yaml
plugins:
- name: file-log
    config:
      path: /dev/stdout
  - name: pre-function
    config:
      access:
      - kong.log.set_serialize_value("request.body", kong.request.get_raw_body())
      body_filter:
      - kong.log.set_serialize_value("response.body", kong.response.get_raw_body())
```
