import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {RequestHandlerExtra} from '@modelcontextprotocol/sdk/shared/protocol.js';
import {isInitializeRequest, ServerNotification, ServerRequest} from "@modelcontextprotocol/sdk/types.js"
import express, {Application, Request, Response} from 'express';
import {randomUUID} from 'node:crypto';
import {Configuration} from './configuration.js';
import {OAuthFilter} from './oauthFilter.js';

/*
 * The application is an MCP server running in the Express HTTP server and acts like an API gateway
 * It checks for a valid access token and then proxies to upstream APIs
 */
export class McpServerApplication {

    private readonly configuration: Configuration;
    private readonly expressApp: Application;
    private readonly mcpServer: McpServer;
    private readonly transports: { [sessionId: string]: StreamableHTTPServerTransport };
    private readonly oauthFilter: OAuthFilter;

    public constructor(configuration: Configuration) {
    
        this.configuration = configuration;

        // Ensure that the 'this' parameter is available in async callbacks
        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);
        this.getStocksResourceMetadata = this.getStocksResourceMetadata.bind(this);
        this.fetchStockPricesFromApi = this.fetchStockPricesFromApi.bind(this);

        // Create the MCP server
        this.mcpServer = new McpServer({
            name: 'example-curity-mcp-server',
            version: '1.0.0'
        });

        // Create an MCP tool to call an existing upstream OAuth-secured API
        this.mcpServer.tool(
            'fetch-stock-prices',
            'A tool to fetch secured information about financial stock prices',
            this.fetchStockPricesFromApi,
        );

        // Create the Express app
        this.expressApp = express();
        this.expressApp.use(express.json());
        this.transports = {};

        // Create routes
        this.expressApp.post('/', this.post);
        this.expressApp.get('/', this.get);
        this.expressApp.delete('/', this.delete);
        this.expressApp.get('/stocks/.well-known/oauth-protected-resource', this.getStocksResourceMetadata);

        // Create an object to enforce a secure connection to the MCP server
        this.oauthFilter = new OAuthFilter(configuration);
    }

    /*
     * Start listening for MCP client requests
     */
    public start() {

        this.expressApp.listen(this.configuration.port, () => {
            console.log(`MCP server is listening on HTTP port ${this.configuration.port}`);
        });
    }

    /*
     * Establish a secured MCP server connection from the client
     */
    public async post(request: Request, response: Response): Promise<void> {

        await this.oauthFilter.validateAccessToken(request, response);
        if (!(request as any).auth) {
            return;
        }

        await this.connectClient(request, response);
    }

    /*
     * Handle GET session requests
     */
    public async get(request: Request, response: Response): Promise<void> {

        await this.oauthFilter.validateAccessToken(request, response);
        if (!(request as any).auth) {
            return;
        }

        await this.handleSessionRequest(request, response);
    }

    /*
     * Handle DELETE session requests
     */
    public async delete(request: Request, response: Response): Promise<void> {

        await this.oauthFilter.validateAccessToken(request, response);
        if (!(request as any).auth) {
            return;
        }

        await this.handleSessionRequest(request, response);
    }


    /*
     * This endpoint is not secured and instead returns OAuth protected resource metadata for the upstream API
     * - https://datatracker.ietf.org/doc/rfc9728
     */
    public async getStocksResourceMetadata(request: Request, response: Response) : Promise<any> {

        const metadata = {
            resource: `${this.configuration.baseUrl}/stocks`,
            resource_name: "Stocks API",
            authorization_servers: [this.configuration.authorizationServerBaseUrl],
            scopes_supported: ['stocks/read'],
        };

        response.status(200).json(metadata).send();
    }

    /*
     * Standard streamable HTTP connection code from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    private async connectClient(request: Request, response: Response): Promise<void> {
        
          const sessionId = request.headers['mcp-session-id'] as string | undefined;
          let transport: StreamableHTTPServerTransport;
        
          // Reuse existing transports
          if (sessionId && this.transports[sessionId]) {
                transport = this.transports[sessionId];

          } else if (!sessionId && isInitializeRequest(request.body)) {
            
                // Create a new transport and map it to a session ID
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (sessionId) => {
                        this.transports[sessionId] = transport;
                    }
                });
        
                // Clean up the transport when closed
                transport.onclose = () => {
                if (transport.sessionId) {
                    delete this.transports[transport.sessionId];
                }
            };
        
            // Connect to the MCP server
            await this.mcpServer.connect(transport);

          } else {

                // Handle invalid requests
                response.status(400).json({
                    jsonrpc: '2.0',
                    error: {
                        code: -32000,
                        message: 'Bad Request: No valid session ID provided',
                    },
                    id: null,
                });
                return;
          }
        
          // Pass the request to the transport
          await transport.handleRequest(request, response, request.body);
    }

    /*
     * Standard streamable HTTP session code from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    private async handleSessionRequest(request: Request, response: Response): Promise<void> {

        const sessionId = request.headers['mcp-session-id'] as string | undefined;
        if (!sessionId || !this.transports[sessionId]) {
            response.status(400).send('Invalid or missing session ID');
            return;
        }
        
        const transport = this.transports[sessionId];
        await transport.handleRequest(request, response);
    }

    /*
     * Call the upstream API with the access token
     */
    private async fetchStockPricesFromApi(extra: RequestHandlerExtra<ServerRequest, ServerNotification>): Promise<any> {

        console.log('MCP server is fetching prices from the stocks API ...');
        const options = {} as RequestInit;

        if (extra.authInfo) {
            options['headers'] = {
                'Authorization': 'Bearer ' + extra.authInfo.token
            }
        }

        const response = await fetch(this.configuration.stocksApiBaseUrl, options);

        console.log('MCP Server. Received response from API with status ' + response.status);
        if (response.status == 401) {
            return {
                content: [
                    { 
                        type: 'text', 
                        text: "The user needs to authenticate. Immediately call the authenticate-user tool. After the user authenticates, return a response. "
                    }
                ]
            }
        }

        const data = await response.text();
        return {
            content: [{ type: "text", text: data }]
        };
    }
}
