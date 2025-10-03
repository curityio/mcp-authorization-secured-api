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


import {Configuration} from '../configuration.js';
import {ErrorHandler} from '../errors/errorHandler.js';
import {McpServerError} from '../errors/mcpServerError.js';

/*
 * Use token exchange to get an access token with a different audience to send to upstream APIs
 */
export class TokenExchangeClient {

    private readonly configuration: Configuration;
    private readonly errorHandler: ErrorHandler;

    public constructor(configuration: Configuration, errorHandler: ErrorHandler) {
        this.configuration = configuration;
        this.errorHandler = errorHandler;
    }

    public async exchangeAccessToken(accessToken: string): Promise<string> {

        const upstreamApiAudience = 'https://api.demo.example';

        let body = 'grant_type=urn:ietf:params:oauth:grant-type:token-exchange';
        body += `&client_id=${this.configuration.tokenExchageClientId}`;
        body += `&client_secret=${this.configuration.tokenExchageClientSecret}`;
        body += `&subject_token=${accessToken}`;
        body += '&subject_token_type=urn:ietf:params:oauth:token-type:access_token';
        body += `&audience=${upstreamApiAudience}`;

        try {
        
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body,
            };

            const response = await fetch(this.configuration.tokenEndpoint, options);
            if (response.status >= 200 && response.status <= 299) {

                const responseData = await response.json() as any;
                return responseData.access_token;
            }

            const responseError = await this.getResponseError(response);
            const error = new McpServerError(
                response.status,
                'authorization_server_error',
                'Problem encountered calling the authorization server',
                responseError);

            if (response.status === 401) {
                const suffix = this.errorHandler.getResourceMetadataUrl();
                error.wwwAuthenticate = `Bearer error="${error.code}", error_description="${error.message}", ${suffix}"`;
            }

            throw error;

        } catch (e: any) {

            if (e instanceof McpServerError) {
                throw e;
            }

            throw new McpServerError(
                500,
                'authorization_server_connection_error',
                'Problem encountered connecting to the Authorization Server',
                e);
        }
    }

    /*
     * Try to read a JSON response error from the authorization server
     */
    private async getResponseError(response: Response): Promise<any> {

        try {

            const data = await response.json() as any
            if (data.error) {
                
                return {
                    code: data.error,
                    message: data.error_description || '',
                }

            }

        } catch (e: any) {
        }

        return null
    }
}
