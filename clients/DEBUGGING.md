# Debugging MCP Connections

To debug MCP and OAuth messages, an HTTP proxy tool like [mitmproxy](https://mitmproxy.org/) can be very useful.\
The proxy can capture all details of both browser and non-browser requests and visualize them.

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

If you can't get an HTTP proxy to work, another option is to log API gateway details.\
You can add the following built-in plugin configuration to one or more routes in the `kong.yml` file.

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
