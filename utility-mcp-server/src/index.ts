import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import {createRemoteJWKSet, JWTVerifyOptions, jwtVerify} from 'jose';
import { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';


const checkAuth = async (req: express.Request & { auth?: AuthInfo }, res: express.Response) => {
    console.log('Checking authorization');

    const authorizationHeader = req.header('authorization');
    let accessToken = null;

    if (authorizationHeader) {
        const parts = authorizationHeader.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            accessToken = parts[1];
        }
    }

    if (!accessToken) {
        res.status(401)
            .header('WWW-Authenticate', 'Bearer resource_metadata="http://mcp.example.com/.well-known/oauth-protected-resource"') //TODO - this should come from a config
            .json({
                jsonrpc: '2.0',
                error: {
                    code: -32000, // TODO - is this a standardized code?
                    message: 'invalid_token: Missing, invalid or expired access token',
                },
                id: null,
            });
        return false;
    }

    console.log('Incoming connection with access token: ' + accessToken);

    // TODO - this should come from configuration
    const options = {
        issuer: 'http://login.example.com/oauth/v2/oauth-anonymous',
        // audience: 'http://mcp.example.com', TODO - figure this one out. How do we set aud in tokens for DCR clients?
        algorithms: ['PS256'],
    } as JWTVerifyOptions;

    let result: any
    try {
        // validate the access token while following best practices
        result = await jwtVerify(accessToken, remoteJwksSet, options);
        req.auth = {
            token: accessToken,
            clientId: '', // TODO - figure out the clientId. Do we really need it here?
            scopes: result['payload']['scope'] ? result['payload']['scope'].split(' ') : []
            // TODO - AuthInfo allows expiresAt and extra fields. Should we have the complete payload in the extra field?
        } as AuthInfo
    } catch (ex: any) {

        console.log('Invalid token: ' + ex)

        res.status(401)
            .header('WWW-Authenticate', 'Bearer resource_metadata="http://mcp.example.com/.well-known/oauth-protected-resource"') //TODO - this should come from a config
            .json({
                jsonrpc: '2.0',
                error: {
                    code: -32000, // TODO - is this a standardized code?
                    message: 'invalid_token: Missing, invalid or expired access token: ' + ex,
                },
                id: null,
            });

        return false;
    }

    return true;
}


const server = new McpServer({
    name: "example-curity-customer-mcp-server",
    version: "1.0.0"
});

const apiUrl = process.env.CUSTOMER_API_URL || 'http://api.example.com/users';
server.tool(
    "fetch-users",
    "The command fetches the list of users configured in the system",
    async (extra) => {
        console.log('MCP server is fetching users ...');

        const options = {} as RequestInit;

        if (extra.authInfo) {
            options['headers'] = {
                'Authorization': 'Bearer ' + extra.authInfo.token
            }
        }

        const response = await fetch(apiUrl, options);

        console.log('MCP Server. Received response from API with status ' + response.status);
        if (response.status == 401) {
            return {
                content: [{ type: 'text', text: "The user needs to authenticate. Immediately call the authenticate-user tool. After the user authenticates, return a response. "}]
            }
        }

        const data = await response.text();
        return {
            content: [{ type: "text", text: data }]
        };
    }
);



const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication
app.post('/', async (req, res) => {

    const authResult = await checkAuth(req, res)
    if (!authResult) {
        // checkAuth already sends the proper response for an
        // unauthorized request, so just terminate further
        // request processing
        return;
    }

    // Check for existing session ID
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      }
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    // Connect to the MCP server
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    const authResult = await checkAuth(req, res);
    if (!authResult) {
        // checkAuth already sends the proper response for an
        // unauthorized request, so just terminate further
        // request processing
        return;
    }
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/', handleSessionRequest);

// Return protected resource metadata
app.get('/.well-known/oauth-protected-resource', (req, res) => {
    // TODO - these values should probably come from configuration
    res.status(200).json({
        resource: "http://mcp.example.com",
        resource_name: "An example MCP Customer server",
        authorization_servers: ["http://login.example.com"],
        scopes_supported: ['retail'],
    }).send();
});

const jwksUri = process.env.JWKS_URI || 'http://login.example.com/oauth/v2/oauth-anonymous/jwks'
const remoteJwksSet = createRemoteJWKSet(<URL>new URL(jwksUri));

const port = 3000;
app.listen(port, () => {
    console.log(`Utility MCP server is listening on HTTP port ${port}`);
});
