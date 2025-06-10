import express, {Request, Response} from 'express';
import {OAuthFilter} from "./security/oauthFilter.js";
import {Configuration} from "./configuration.js";
import {ErrorHandler} from "./errors/errorHandler.js";
import {ClaimsPrincipal} from "./security/claimsPrincipal.js";

const app = express();

const configuration = new Configuration();
const oauthFilter = new OAuthFilter(configuration);

app.use(oauthFilter.validateAccessToken);

app.get('/trades', (request: Request, response: Response) => {

    console.log('Trades API is returning financial data ...');

    const user = response.locals.claimsPrincipal as ClaimsPrincipal;

    // Require scope 'trades/read' to get price information
    user.enforceRequiredScope('trades/read')

    const trades = [
        {
            "trade_id": 78122,
            "time": "2025-03-07T09:45:39",
            "stock_id": 9981,
            "quantity": 450,
            "amountUSD": 90000,
            "region": "USA",
        },
        {
            "trade_id": 78124,
            "time": "2025-03-07T09:47:56",
            "stock_id": 7865,
            "quantity": 2000,
            "amountUSD": 160000,
            "region": "USA",
        }
    ];

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(trades));
});

app.use(ErrorHandler.onUnhandledException)

const port = 3000;
app.listen(port, () => {
    console.log(`Customer API is listening on HTTP port ${port}`);
});
