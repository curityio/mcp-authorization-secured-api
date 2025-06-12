import {AuthInfo} from '@modelcontextprotocol/sdk/server/auth/types.js';
import {Request, Response} from 'express';
import {createRemoteJWKSet, JWTVerifyGetKey, JWTVerifyOptions, jwtVerify} from 'jose';
import {Configuration} from './configuration.js';

/*
 * The MCP server acts as an API gateway and upstream APIs do the athtorization work
 * However, the MCP server requires a valid access token from the client in order to make a secure connection
 */
export class OAuthFilter {

    private readonly configuration: Configuration;
    private readonly remoteJwksSet: JWTVerifyGetKey;

    public constructor(configuration: Configuration) {
        
        this.configuration = configuration;
        this.remoteJwksSet = createRemoteJWKSet(<URL>new URL(configuration.jwksUri));
        this.validateAccessToken = this.validateAccessToken.bind(this);
    }

    /*
     * Validate the access token and then store it against the request object for use in MCP tools
     */
    public async validateAccessToken(request: Request, response: Response): Promise<any> {

        const accessToken = this.readAccessToken(request);
        if (!accessToken) {
            this.unauthorized(request, response);
            return null;
        }

        // The MCP server acts as an API gateway to enable a secured initial connection
        // Scope and audience checks are managed by upstream APIs
        const options = {
            issuer: this.configuration.requiredJwtIssuer,
            algorithms: [this.configuration.requiredJwtAlgorithm],
        } as JWTVerifyOptions;

        try {

            // Do the validation before allowing a connection
            const claims = await jwtVerify(accessToken, this.remoteJwksSet, options);

            // Update the request to make the valid access token available to tools to forward to upstream APIs
            const authInfo: AuthInfo = {
                token: accessToken!,
                clientId: '',
                scopes: [],
            };
            (request as any).auth = authInfo;

            return claims;

        } catch (ex: any) {

            this.unauthorized(request, response);
            return null;
        }
    }

    /*
     * Read the access token from the HTTP authorization header
     */
    private readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }

    /*
     * The MCP server uses the request path to work out which API to return resource metadata for
     */
    private unauthorized(request: Request, response: Response) {

        const api = request.path.split('/')[0];
        const url = `${this.configuration.baseUrl}/${api}/.well-known/oauth-protected-resource`;
        response.status(401)
            .header('WWW-Authenticate', `Bearer resource_metadata="${url}"`)
            .json({
                jsonrpc: '2.0',
                error: {
                    code: -32000, // TODO - is this a standardized code?
                    message: 'invalid_token: Missing, invalid or expired access token',
                },
                id: null,
            });
    }
}
