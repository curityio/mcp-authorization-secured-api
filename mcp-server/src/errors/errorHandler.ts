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

import {NextFunction, Request, Response} from 'express';
import {McpServerError} from './mcpServerError.js';
import {Configuration} from '../configuration.js';

/*
 * Basic error handling and logging
 */
export class ErrorHandler {

    private readonly configuration: Configuration;

    public constructor(configuration: Configuration) {
        this.configuration = configuration;
        this.onUnhandledException = this.onUnhandledException.bind(this);
    }

    /*
     * Handle exceptions, log the cause and return a client error
     */
    public onUnhandledException(unhandledException: Error, request: Request, response: Response, next: NextFunction): void {

        const error = this.getApiError(unhandledException);
        this.writeExpressErrorResponse(error, response);
    }

    /*
     * Log errors in the API
     */
    public logError(error: McpServerError) {
        console.log(JSON.stringify(error.toLogObject(), null, 2));
    }

    /*
     * Get the resource metadata part of the WWW-Authenticate string
     */
    public getResourceMetadataSuffix(): string {

        const resourceMetadataUrl = `${this.configuration.externalBaseUrl}/.well-known/oauth-protected-resource`;
        return `resource_metadata="${resourceMetadataUrl}"`;
    }

    /*
     * Write an Express error response
     */
    private writeExpressErrorResponse(error: McpServerError, response: Response): void {

        this.logError(error);
        if (error.status === 401) {
            this.writeAuthenticateHeader(error, response);
        }

        response.setHeader('Content-Type', 'application/json');
        response.status(error.status).send(JSON.stringify(error.toClientObject()));
    }

    /*
     * Write the WWW-Authenticate header for 401 responses
     */
    private writeAuthenticateHeader(error: McpServerError, response: Response): void {

        const suffix = this.getResourceMetadataSuffix();
        response.setHeader(
            'WWW-Authenticate',
            `Bearer error="${error.code}", error_description="${error.message}", ${suffix}"`);
    }

    /*
     * Get a caught error into a typed error
     */
    private getApiError(unhandledException: any): McpServerError {

        if (unhandledException instanceof McpServerError) {
            return unhandledException;
        }

        return new McpServerError(500, 'server_error', 'Problem encountered in the MCP server', unhandledException.message);
    }
}
