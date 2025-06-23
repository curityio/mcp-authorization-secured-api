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


import {Configuration} from './configuration.js';
import {ErrorHandler} from './errors/errorHandler.js';
import {McpServerError} from './errors/mcpServerError.js';

/*
 * Manage calls to upstream APIs
 */
export class StocksApiClient {

    private readonly configuration: Configuration;
    private readonly errorHandler: ErrorHandler;

    public constructor(configuration: Configuration, errorHandler: ErrorHandler) {
        this.configuration = configuration;
        this.errorHandler = errorHandler;
    }

    public async getStocks(accessToken: string): Promise<any> {

        try {
        
            const options = {
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            } as RequestInit;

            const response = await fetch(this.configuration.stocksApiBaseUrl, options);
            if (response.status >= 200 && response.status <= 299) {
                return await response.text() as any;
            }

            let wwwAuthenticate: string | null = '';
            if (response.status === 401) {
                
                const suffix = this.errorHandler.getResourceMetadataUrl();
                wwwAuthenticate = response.headers.get('WWW-Authenticate') + `, ${suffix}`;
            }

            const responseError = await this.getResponseError(response);
            const error = new McpServerError(
                response.status,
                'stocks_api_error',
                'Problem encountered calling the stocks API',
                responseError);

            if (wwwAuthenticate) {
                error.wwwAuthenticate = wwwAuthenticate;
            }

            throw error;

        } catch (e: any) {

            if (e instanceof McpServerError) {
                throw e;
            }

            throw new McpServerError(
                500,
                'stocks_api_connection_error',
                'Problem encountered connecting to the stocks API',
                e);
        }
    }

    /*
     * Try to read a JSON response error from the API
     */
    private async getResponseError(response: Response): Promise<any> {

        try {

            const data = await response.json() as any
            if (data.code && data.message) {
                
                return {
                    code: data.code,
                    message: data.message,
                }

            }

        } catch (e: any) {
        }

        return null
    }
}
