import express, {Request, Response} from 'express';
import {OAuthFilter} from "./security/oauthFilter.js";
import {Configuration} from "./configuration.js";
import {ErrorHandler} from "./errors/errorHandler.js";
import {ApiError} from "./errors/apiError.js";
import {ClaimsPrincipal} from "./security/claimsPrincipal.js";

const app = express();

const configuration = new Configuration();
const oauthFilter = new OAuthFilter(configuration);

app.use(oauthFilter.validateAccessToken);

app.get('/users', (request: Request, response: Response) => {

    console.log('Customer API is returning users ...');

    const user = response.locals.claimsPrincipal as ClaimsPrincipal;

    // Require scope 'retail' to read users
    user.enforceRequiredScope('retail')

    const users = [
        {
            given_name: 'John',
            family_name: 'Doe',
            email: 'john.doe@customer.example',
        },
        {
            given_name: 'Jane',
            family_name: 'Doe',
            email: 'jane.doe@customer.example',
        },
    ];

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(users));
});

app.use(ErrorHandler.onUnhandledException)

const port = 3000;
app.listen(port, () => {
    console.log(`Customer API is listening on HTTP port ${port}`);
});
