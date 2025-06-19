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
import {ApiError} from './apiError.js';
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

        const apiError = this.getApiError(unhandledException);
        this.writeErrorResponse(apiError, response);
    }

    /*
     * Log errors in the API
     */
    private logError(error: ApiError) {
        console.log(JSON.stringify(error.toLogObject(), null, 2));
    }

    /*
     * Write an error response with parameters
     */
    private writeErrorResponse(apiError: ApiError, response: Response): void {

        this.logError(apiError);
        if (apiError.status === 401) {
            this.writeAuthenticateHeader(apiError, response);
        }

        response.setHeader('Content-Type', 'application/json');
        response.status(apiError.status).send(JSON.stringify(apiError.toClientObject()));
    }

    /*
     * Write standard OAuth error response headers
     */
    private writeAuthenticateHeader(apiError: ApiError, response: Response): void {

        if (apiError.status === 401) {
            
            response.setHeader(
                'WWW-Authenticate',
                `Bearer error="${apiError.code}", error_description="${apiError.message}"`);
        }
    }

    /*
     * Get a caught error into a typed error
     */
    private getApiError(unhandledException: any): ApiError {

        if (unhandledException instanceof ApiError) {
            return unhandledException;
        }

        return new ApiError(500, 'server_error', 'Problem encountered in the API', unhandledException.message);
    }
}
