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

import express, {Request, Response} from 'express';
import {OAuthFilter} from "./security/oauthFilter.js";
import {Configuration} from "./configuration.js";
import {ErrorHandler} from "./errors/errorHandler.js";
import {ClaimsPrincipal} from './security/claimsPrincipal.js';

const app = express();
app.set('etag', false)

const configuration = new Configuration();

/*
 * The API validates a JWT access token using security best practices on every request
 */
const oauthFilter = new OAuthFilter(configuration);
app.use('/', oauthFilter.validateAccessToken);


/*
 * The API's business logic then runs and has access to a claims principal formed from the JWT access token's payload
 * The API's authorization receives AI context in claims
 */
app.get('/', (request: Request, response: Response) => {

    // The example API uses hard coded stocks
    console.log('API is returning secured information about stock prices ...');
    const stocks = [
        {
            "id": "COM1",
            "region": "USA",
            "name": "Company 1",
            "price": 450.22,
        },
        {
            "id": "COM2",
            "region": "Europe",
            "name": "Company 2",
            "price": 250.62,
        },
        {
            "id": "COM3",
            "region": "Europe",
            "name": "Company 3",
            "price": 21.07,
        },
        {
            "id": "COM4",
            "region": "USA",
            "name": "Company 4",
            "price": 180.75,
        },
    ];

    // Get claims
    const claims = response.locals.claimsPrincipal as ClaimsPrincipal;
    
    if (claims.clientType == 'mcp') {
        // The API could restrict allowed operations for MCP clients
    }

    if (claims.clientAssuranceLevel <= 1) {
        // The API could deny access to high sensitivity data unless the MCP client used strong authentication
    }

    // Return authorized data based on the user's region
    const data = stocks.filter((s) => s.region === claims.region) || [];
    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(data));
});

const errorHander = new ErrorHandler();
app.use(errorHander.onUnhandledException)

app.listen(configuration.port, () => {
    console.log(`Stocks API is listening on HTTP port ${configuration.port}`);
});
