return {
    name = "phantom-token",
    fields = {{
        config = {
            type = "record",
            fields = {
                { introspection_endpoint = { type = "string", required = true } },
                { client_id = { type = "string", required = true } },
                { client_secret = { type = "string", required = true } },
                { token_cache_seconds = { type = "number", required = true, default = 300 } },
                { scope = { type = "string", required = false } },
                { verify_ssl = { type = "boolean", required = true, default = true } },
                { resource_metadata_url = { type = "string", required = false } }
            }
        }}
    }
}
