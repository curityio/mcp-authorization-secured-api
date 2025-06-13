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

/*
 * Configuration settings for the OAuth-secured MCP server that acts as an API gateway
 */
export class Configuration {

    public port: string;
    public stocksApiBaseUrl: string;
    
    public constructor() {

        this.port = this.getValue('PORT');
        this.stocksApiBaseUrl = this.getValue('STOCKS_API_BASE_URL');
        
    }

    private getValue(name: string): string {

        const value = process.env[name];
        if (!value) {
            throw new Error(`The environment variable ${name} has not been set`)
        }

        return value!;
    }
}
