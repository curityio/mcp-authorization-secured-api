import express from 'express';

/*
 * Generate a JSON web keypair when the host starts
 */
const app = express();
const port = 8000;

/*
 * Return client metadata for the TypeScript SDK client
 */
app.get('/typescript-sdk-client.json', (request, response) => {

    const metadata = {
        client_id: 'https://www.client.example/typescript-sdk-client.json',
        client_name: 'TypeScript SDK Client',
        grant_types: ['authorization_code'],
        redirect_uris: ['https://localhost:8090'],
        scope: 'stocks/read',
        token_endpoint_auth_method: 'none',
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(metadata));
});

/*
 * The API gateway exposes client metadata at a https://www.client.example base URL
 */
app.listen(port, () => {
    console.log(`Client metadata host is listening on HTTP port ${port}`);
});
