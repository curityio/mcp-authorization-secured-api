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
import {ClaimsPrincipal} from "./security/claimsPrincipal.js";

const app = express();
const configuration = new Configuration();

/*
 * The API publishes its own resource metadata from an unsecured endpoint
 */
app.get('/.well-known/oauth-protected-resource/stocks', (request: Request, response: Response) => {

    const metadata = {
        resource: `${configuration.externalBaseUrl}/stocks`,
        resource_name: "Stocks API",
        authorization_servers: [configuration.authorizationServerBaseUrl],
        scopes_supported: ['stocks/read'],
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(metadata));

});

/*
 * The API validates a JWT access token using security best practices on every request
 */
const oauthFilter = new OAuthFilter(configuration);
app.use('/', oauthFilter.validateAccessToken);


/*
 * The API's business logic then runs and has access to a claims principal formed from the JWT access token's payload
 */
app.get('/', (request: Request, response: Response) => {

    console.log('API is returning secured information about stock prices ...');
    const claims = response.locals.claimsPrincipal as ClaimsPrincipal;
    
    /*
     * The API checks for its required scope for this endpoint.
     * The MCP client only has access to this area of data.
     */
    claims.enforceRequiredScope('stocks/read')

    /*
     * In this example, all stocks in this collection are returned to the AI agent.
     * A real API could use additional claims associated to the scope, like role, department, country etc.
     * These claims could filter access to particular stocks that the user is allowed to access.
     */
    const stocks = [
        {
            "id": "MSFT",
            "name": "Microsoft Corporation",
            "price": 450.22,
        },
        {
            "id": "AAPL",
            "name": "Apple Inc",
            "price": 250.62,
        },
        {
            "id": "INTC",
            "name": "Intel Corp",
            "price": 21.07,
        },
    ];

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(stocks));
});

const errorHander = new ErrorHandler(configuration);
app.use(errorHander.onUnhandledException)

app.listen(configuration.port, () => {
    console.log(`Stocks API is listening on HTTP port ${configuration.port}`);
});
