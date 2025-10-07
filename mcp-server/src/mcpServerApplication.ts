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
import {CallToolResult, ErrorCode, ServerNotification, ServerRequest} from "@modelcontextprotocol/sdk/types.js"
import express, {Application, NextFunction, Request, Response} from 'express';
import {Configuration} from './configuration.js';
import {ErrorHandler} from './errors/errorHandler.js';
import {McpServerError} from './errors/mcpServerError.js';
import {OAuthFilter} from './security/oauthFilter.js';
import {TokenExchangeClient} from './security/tokenExchangeClient.js';
import {StocksApiClient } from './stocksApiClient.js';

/*
 * The application is a stateless MCP server running in the Express HTTP server and acts like an API gateway
 * It checks for the presence of an access token produced by the phantom token plugin, then proxies it to upstream APIs
 */
export class McpServerApplication {

    private readonly configuration: Configuration;
    private readonly errorHandler: ErrorHandler;
    private readonly expressApp: Application;
    private readonly mcpServer: McpServer;
    private readonly oauthFilter: OAuthFilter;

    public constructor(configuration: Configuration, errorHandler: ErrorHandler) {
    
        this.configuration = configuration;
        this.errorHandler = errorHandler;
        this.oauthFilter = new OAuthFilter(configuration);

        // Ensure that the 'this' parameter is available in async callbacks when using JavaScript classes with methods
        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);
        this.getResourceMetadata = this.getResourceMetadata.bind(this);
        this.fetchStockPricesFromApi = this.fetchStockPricesFromApi.bind(this);

        // Create the MCP server
        const serverInfo = {
            name: 'mcp-server',
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
        this.expressApp.set('etag', false)
        this.expressApp.use(express.json());

        // Expose protected resource metadata
        this.expressApp.get('/.well-known/oauth-protected-resource', this.getResourceMetadata);

        // Add middleware to validate the JWT access token on MCP requests from the client
        // The MCP server enforces audience restrictions and prevents the use of unauthorized access tokens
        this.expressApp.use('/', this.oauthFilter.validateAccessToken);

        // Create MCP routes
        this.expressApp.post('/', this.post);
        this.expressApp.get('/', this.get);
        this.expressApp.delete('/', this.delete);

        // Also add an error handler middleware
        this.expressApp.use(this.errorHandler.onUnhandledException)
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
     * Stateless POST handling from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    public async post(request: Request, response: Response, next: NextFunction): Promise<void> {

        this.setAuthInfo(request);
        try {

            const transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
            });

            // For a stateless connection, the close event fires after every HTTP response from the MCP server
            response.on('close', () => {
                transport.close();
                this.mcpServer.close();
            });

            await this.mcpServer.connect(transport);
            await transport.handleRequest(request, response, request.body);

        } catch (error: any) {

            const data = {
                jsonrpc: '2.0',
                error: {
                    code: ErrorCode.InternalError,
                    message: 'Internal server error.'
                },
                id: null,
            };
            
            response.status(500).send(JSON.stringify(data));
        }
    }

    /*
     * Stateless GET handling from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    public async get(request: Request, response: Response): Promise<void> {

        const data = {
            jsonrpc: '2.0',
            error: {
                code: ErrorCode.ConnectionClosed,
                message: 'Method not allowed.'
            },
            id: null,
        };
        
        response.writeHead(405).end(JSON.stringify(data));
    }

    /*
     * Stateless DELETE handling from the TypeScript SDK
     * - https://github.com/modelcontextprotocol/typescript-sdk
     */
    public async delete(request: Request, response: Response): Promise<void> {

        const data = {
            jsonrpc: '2.0',
            error: {
                code: ErrorCode.ConnectionClosed,
                message: 'Method not allowed.'
            },
            id: null,
        };
        
        response.writeHead(405).end(JSON.stringify(data));
    }

    /*
     * The MCP server returns its resource information and points clients to its authorization server
     * Some example clients require a resource identifier that ends with a trailing backslash
     * Return the scopes_supported that some MCP clients use in their scope selection strategy
     * - https://modelcontextprotocol.io/specification/draft/basic/authorization#scope-selection-strategy
     */
    private getResourceMetadata(request: Request, response: Response) {

        const metadata = {
            resource: `${this.configuration.externalBaseUrl}/`,
            resource_name: 'MCP Server',
            authorization_servers: [this.configuration.authorizationServerBaseUrl],
            scopes_supported: [this.configuration.requiredScope],
        };

        response.setHeader('content-type', 'application/json');
        response.status(200).send(JSON.stringify(metadata));
    }

    /*
     * The MCP server makes the access token available to tools that call upstream APIs
     */
    private setAuthInfo(request: Request) {

        const accessToken = this.oauthFilter.readAccessToken(request) || '';

        const authInfo: AuthInfo = {
            token: accessToken,
            clientId: '',
            scopes: [],
        };
        (request as any).auth = authInfo;
    }

    /*
     * Run tool logic to call the upstream API
     */
    private async fetchStockPricesFromApi(extra: RequestHandlerExtra<ServerRequest, ServerNotification>): Promise<CallToolResult> {

        try {
            
            const receivedAccessToken = extra.authInfo?.token || '';
            const oauthClient = new TokenExchangeClient(this.configuration, this.errorHandler);
            const exchangedAccessToken = await oauthClient.exchangeAccessToken(receivedAccessToken);
        
            const apiClient = new StocksApiClient(this.configuration, this.errorHandler);
            const data = await apiClient.getStocks(exchangedAccessToken);
            
            console.log('MCP server successfully called stocks API');
            return {
                content: [{
                    type: "text",
                    text: data
                }]
            };

        } catch (e: any) {

            return this.toolErrorResponse(e as McpServerError);
        }
    }

    /*
     * Log the error and return it to the MCP client in the JSON-RPC format
     */
    private toolErrorResponse(e: McpServerError): any {

        this.errorHandler.logError(e);
        const error = e.toClientObject();

        const data: any = { 
            type: 'text', 
            text: JSON.stringify(error),
        };
        
        return {
            isError: true,
            content: [data],
        };
    }
}
