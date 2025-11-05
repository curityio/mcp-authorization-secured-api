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

import {Request, Response, NextFunction} from 'express';
import {createRemoteJWKSet, JWTVerifyGetKey, JWTVerifyOptions, jwtVerify} from 'jose';
import {JOSEError} from 'jose/errors';
import {Configuration} from '../configuration.js';
import {McpServerError} from '../errors/mcpServerError.js';
import {ClaimsPrincipal} from './claimsPrincipal.js';

/*
 * The base OAuth work to authenticate API requests and make basic checks
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
     * Validate a JWT and return claims for authorization
     * Ensure that the JWT is valid for use at this MCP server by validating its audience and scope
     */
    public async validateAccessToken(request: Request, response: Response, next: NextFunction): Promise<void> {

        const accessToken = this.readAccessToken(request);
        if (!accessToken) {
            throw new McpServerError(401, 'invalid_token', 'Missing, invalid or expired access token');
        }

        const options = {
            issuer: this.configuration.requiredIssuer,
            audience: this.configuration.requiredAudience,
            algorithms: [this.configuration.requiredJwtAlgorithm],
        } as JWTVerifyOptions;

        let result: any
        try {

            result = await jwtVerify(accessToken, this.remoteJwksSet, options);

        } catch (ex: any) {

            let extra: any = null;
            if (ex instanceof JOSEError) {
               extra = {
                   code: ex.code,
                    message: ex.message,
               }
            }

            throw new McpServerError(401, 'invalid_token', 'Missing, invalid or expired access token', extra);
        }

        const claims = new ClaimsPrincipal(this.configuration, result.payload);
        claims.enforceRequiredScope();
        response.locals.claimsPrincipal = claims;

        next();
    }

    /*
     * Read the access token from the HTTP authorization header
     */
    public readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }
}
