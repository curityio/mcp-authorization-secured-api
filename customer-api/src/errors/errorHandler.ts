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

/*
 * Basic error handling and logging
 */
export class ErrorHandler {

    /*
     * Handle exceptions
     */
    public static onUnhandledException(unhandledException: Error, request: Request, response: Response, next: NextFunction): void {

        const apiError = ErrorHandler.getApiError(unhandledException);
        ErrorHandler.writeErrorResponse(apiError, response);
    }

    /*
     * Create an error on demand
     */
    public static writeErrorResponse(apiError: ApiError, response: Response): void {

        ErrorHandler.logError(apiError);
        if (apiError.status === 401 || apiError.status == 403) {
            ErrorHandler.writeAuthenticateHeader(apiError, response);
        }

        response.setHeader('Content-Type', 'application/json');
        response.status(apiError.status).send(JSON.stringify(apiError.toClientJson()));
    }

    /*
     * Write standard OAuth error response headers
     */
    public static writeAuthenticateHeader(apiError: ApiError, response: Response): void {

        if (apiError.status === 401 || apiError.status === 403) {
            response.setHeader('WWW-Authenticate', `Bearer, error=${apiError.code}, error_description=${apiError.message}`);
        }
    }

    /*
     * Get a caught error into a typed error
     */
    private static getApiError(unhandledException: any): ApiError {

        if (unhandledException instanceof ApiError) {
            return unhandledException;
        }

        return new ApiError(500, 'server_error', 'Problem encountered in the API', unhandledException.message);
    }

    /*
     * Log errors in the API
     */
    private static logError(error: ApiError) {

        console.log(JSON.stringify(error.toLogJson(), null, 2));
    }
}
