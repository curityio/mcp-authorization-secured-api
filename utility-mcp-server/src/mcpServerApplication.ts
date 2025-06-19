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
import {OAuthFilter} from './security/oauthFilter.js';

/*
 * The application is a stateless MCP server running in the Express HTTP server and acts like an API gateway
 * It checks for the presence of an access token produced by the phantom token plugin, then proxies it to upstream APIs
 */
export class McpServerApplication {

    private readonly configuration: Configuration;
    private readonly expressApp: Application;
    private readonly mcpServer: McpServer;
    private readonly oauthFilter: OAuthFilter;

    public constructor(configuration: Configuration) {
    
        this.configuration = configuration;
        this.oauthFilter = new OAuthFilter(configuration);

        // Ensure that the 'this' parameter is available in async callbacks when using JavaScript classes with methods
        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.delete = this.delete.bind(this);
        this.getResourceMetadata = this.getResourceMetadata.bind(this);
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
        const errorHander = new ErrorHandler(configuration);
        this.expressApp.use(errorHander.onUnhandledException)
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
     * The TypeScript SDK's example client requires a resource value that ends with a trailing backslash
     */
    private getResourceMetadata(request: Request, response: Response) {

        const metadata = {
            resource: `${this.configuration.externalBaseUrl}/`,
            resource_name: "MCP Server",
            authorization_servers: [this.configuration.authorizationServerBaseUrl],
        };

        response.setHeader('content-type', 'application/json');
        response.status(200).send(JSON.stringify(metadata));
    }

    /*
     * Call the upstream API with the access token
     */
    private async fetchStockPricesFromApi(extra: RequestHandlerExtra<ServerRequest, ServerNotification>): Promise<CallToolResult> {

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

                // For 401s from the upstream API we should return an HTTP 401 to the MCP client so that it can get a new access token.
                // There is no standard solution for doing so yet, so at least ensure that the MCP client gets the correct error values.
                // The MCP authorization specification is likely to provide standardized behaviors in the near future.
                // https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/256

                const errorData = JSON.parse(data);
                errorData.status = 401;
                const resourceMetadataUrl = `${this.configuration.externalBaseUrl}/.well-known/oauth-protected-resource`;
                errorData.wwAuthenticate = response.headers.get('WWW-Authenticate') + `, resource_metadata="${resourceMetadataUrl}"`;
                error.text = JSON.stringify(errorData);
            }

            return {
                isError: true,
                content: [error],
            };
        }
    }

    /*
     * The MCP server makes the access token available to tools that call upstream APIs
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
