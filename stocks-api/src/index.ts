import express, {Request, Response} from 'express';
import {OAuthFilter} from "./security/oauthFilter.js";
import {Configuration} from "./configuration.js";
import {ErrorHandler} from "./errors/errorHandler.js";
import {ClaimsPrincipal} from "./security/claimsPrincipal.js";

const app = express();

const configuration = new Configuration();
const oauthFilter = new OAuthFilter(configuration);

app.use(oauthFilter.validateAccessToken);

app.get('/stocks', (request: Request, response: Response) => {

    console.log('Stocks API is returning stock prices ...');

    const user = response.locals.claimsPrincipal as ClaimsPrincipal;

    // Require scope 'stocks/read' to get price information
    user.enforceRequiredScope('stocks/read')

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
    console.log(`Customer API is listening on HTTP port ${port}`);
});
