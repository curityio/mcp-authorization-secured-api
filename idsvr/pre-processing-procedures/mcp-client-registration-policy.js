/**
 * @param {se.curity.identityserver.procedures.context.DcrPreProcessingProcedureContext} context
 * @returns {*}
 */
function result(context) {
  var attributes = {};

  // Apply the security policy for MCP clients that access stock data
  attributes.require_proof_key = true;
  attributes.access_token_ttl = 900;
  attributes.refresh_token_ttl = 0;

  // Currently the MCP authorization specification does not define how the initial scope is set.
  // Therefore, some MCP clients do not send a scope in their DCR request so we use the fixed scope defined for DCR in the token profile.
  // This data gets returned in the DCR response and the client should send it during token requests.
  attributes.scope = "stocks/read"

  // Add a custom property that specifies the audiences of this DCR client
  attributes.audiences = ["https://mcp.demo.example/"];

  return attributes;
}
