import express from 'express';
import {generateKeyPair, exportJWK} from 'jose';

/*
 * Generate a JSON web keypair when the host starts
 */
const app = express();
const port = 8000;
const keypair = await generateKeyPair('ES256');

/*
 * Return client metadata for the TypeScript SDK client
 */
app.get('/typescript-sdk-client.json', (request, response) => {

    const metadata = {
        client_id: 'https://www.client.example/typescript-sdk-client.json',
        client_name: 'TypeScript SDK Client',
        redirect_uris: ['https://www.client.example/callback'],
        jwks_uri: 'https://www.client.example/jwks.json',
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(metadata));
});

/*
 * Return client metadata for the MCP Inspector client
 */
app.get('/mcp-inspector.json', (request, response) => {

    const metadata = {
        client_id: 'https://www.client.example/mcp-inspector.json',
        client_name: 'MCP Inspector',
        redirect_uris: ['https://www.client.example/callback'],
        jwks_uri: 'https://www.client.example/jwks.json',
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(metadata));
});

/*
 * Return client metadata for the Claude Desktop client
 */
app.get('/claude-desktop.json', (request, response) => {

    const metadata = {
        client_id: 'https://www.client.example/claude-desktop.json',
        client_name: 'Claude Desktop',
        redirect_uris: ['https://www.client.example/callback'],
        jwks_uri: 'https://www.client.example/jwks.json',
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(metadata));
});

/*
 * Return the JWKS to enable the authorization server to verify client assertions
 */
app.get('/jwks.json', async (request, response) => {

    const jwk = await exportJWK(keypair.publicKey);
    jwk.kid = 1;
    jwk.alg = 'ES256';
    const jwks = {
        keys: [
            jwk,
        ],
    };

    response.setHeader('content-type', 'application/json');
    response.status(200).send(JSON.stringify(jwks));
});

/*
 * The API gateway exposes client metadata at a https://www.client.example base URL
 */
app.listen(port, () => {
    console.log(`Client metadata host is listening on HTTP port ${port}`);
});
