/*
 * Override the fixed settings in the MCP inspector to match the backend deployment
 */
export class CustomInspectorOAuthClientProvider extends InspectorOAuthClientProvider {

    get clientMetadata(): OAuthClientMetadata {
        return {
            redirect_uris: [this.redirectUrl],
            token_endpoint_auth_method: "client_secret_post",
            grant_types: ["authorization_code"],
            response_types: ["code"],
            client_name: "MCP Inspector",
            client_uri: "http://localhost:6274",
            scope: 'stocks/read',
        };
    }
}
