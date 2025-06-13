/*
 *  Copyright 2025 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {AuthInfo} from '@modelcontextprotocol/sdk/server/auth/types.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {RequestHandlerExtra} from '@modelcontextprotocol/sdk/shared/protocol.js';
import {isInitializeRequest, ServerNotification, ServerRequest} from "@modelcontextprotocol/sdk/types.js"
import express, {Application, Request, Response} from 'express';
import {randomUUID} from 'node:crypto';
import {Configuration} from './configuration.js';

/*
 * The application is an MCP server running in the Express HTTP server and acts like an API gateway
 * It checks for the presence of an access token produced by the phantom token plugin, then proxies it to upstream APIs
 */
export class McpServerApplication {

    private readonly configuration: Configuration;
    private readonly expressApp: Application;
    private readonly mcpServer: McpServer;
    private readonly transports: { [sessionId: string]: StreamableHTTPServerTransport };

    public constructor(configuration: Configuration) {
    
        this.configuration = configuration;

        // Ensure that the 'this' parameter is available in async callbacks when using JavaScript classes with methods
        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);
        this.fetchStockPricesFromApi = this.fetchStockPricesFromApi.bind(this);

        // Create the MCP server
        const serverInfo = {
            name: 'utility-mcp-server',
            version: '1.0.0'
        };
        this.mcpServer = new McpServer(serverInfo);

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

        this.setAuthInfo(request);
        await this.handlePost(request, response);
    }

    /*
     * Handle GET session requests
     */
    public async get(request: Request, response: Response): Promise<void> {

        this.setAuthInfo(request);
        await this.handleSessionRequest(request, response);
    }

    /*
     * Handle DELETE session requests
     */
    public async delete(request: Request, response: Response): Promise<void> {

        this.setAuthInfo(request);
        await this.handleSessionRequest(request, response);
    }

    /*
     * Standard streamable HTTP connection code from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    private async handlePost(request: Request, response: Response): Promise<void> {
        
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

        const options = {} as RequestInit;

        if (extra.authInfo) {
            options['headers'] = {
                'Authorization': 'Bearer ' + extra.authInfo.token,
            }
        }

        console.log('MCP server is fetching prices from the stocks API ...');
        const response = await fetch(this.configuration.stocksApiBaseUrl, options);

        if (response.status >= 200 && response.status <= 299) {

            console.log('MCP server successfully received stock prices ...');
            const data = await response.text();
            return {
                content: [{
                    type: "text",
                    text: data
                }]
            };

        } else {
            
            console.log(`MCP server received an HTTP ${response.status} status from the stocks API ...`);
            const data = await response.text();
            
            const error: any = { 
                type: 'text', 
                text: data,
            };

            if (response.status === 401) {
                
                // When the upstream API returns a 401, return data the client needs to handle 401s and refresh access tokens or create a new session.
                // In the content of a tool request, the data must be returned as an object rather than a 401 HTTP response.
                const errorData = JSON.parse(data);
                errorData.wwAuthenticate = response.headers.get('WWW-Authenticate');
                error.text = JSON.stringify(errorData);
            }

            return {
                isError: true,
                content: [error],
            };
        }
    }

    /*
     * The MCP server only needs to check for a valid access token
     */
    private setAuthInfo(request: Request): boolean {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {

                const accessToken = parts[1];
                const authInfo: AuthInfo = {
                    token: accessToken,
                    clientId: '',
                    scopes: [],
                };
                (request as any).auth = authInfo;
                return true;
            }
        }

        return false;
    }
}
