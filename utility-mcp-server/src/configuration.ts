/*
 * Configuration settings for the OAuth-secured MCP server that acts as an API gateway
 */
export class Configuration {

    public port: string;
    public stocksApiBaseUrl: string;
    
    public constructor() {

        this.port = this.getValue('PORT');
        this.stocksApiBaseUrl = this.getValue('STOCKS_API_BASE_URL');
        
    }

    private getValue(name: string): string {

        const value = process.env[name];
        if (!value) {
            throw new Error(`The environment variable ${name} has not been set`)
        }

        return value!;
    }
}
