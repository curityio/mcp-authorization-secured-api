import express, {Request, Response} from 'express';
import {OAuthFilter} from "./security/oauthFilter.js";
import {Configuration} from "./configuration.js";
import {ErrorHandler} from "./errors/errorHandler.js";
import {ClaimsPrincipal} from "./security/claimsPrincipal.js";

const app = express();
const configuration = new Configuration();

/*
 * The API validates a JWT access token using security best practices on every request
 */
const oauthFilter = new OAuthFilter(configuration);
app.use(oauthFilter.validateAccessToken);

/*
 * The API's business logic then runs and has access to a claims principal formed from the JWT access token's payload
 */
app.get('/stocks', (request: Request, response: Response) => {

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
     * These claims could be used to restrict access by filtering items based on the user's privileges.
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

app.use(ErrorHandler.onUnhandledException)

const port = 3000;
app.listen(port, () => {
    console.log(`Stocks API is listening on HTTP port ${port}`);
});
