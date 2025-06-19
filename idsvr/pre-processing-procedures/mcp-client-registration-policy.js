/**
 * @param {se.curity.identityserver.procedures.context.DcrPreProcessingProcedureContext} context
 * @returns {*}
 */
function result(context) {
  var request = context.getRequest();
  var httpMethod = request.getMethod();
  var attributes = {};

  if (httpMethod === "POST") {
    var body = request.getParsedBodyAsJson();
    if (body && body.scope) {
      if (body.scope.split(" ").indexOf("stocks/read") !== -1) {
        
        // Apply the security policy for MCP clients that access stock data
        attributes.require_proof_key = true;
        attributes.access_token_ttl = 900;
        attributes.refresh_token_ttl = 0;

        // Add a custom property that specifies the audiences of this DCR client
        attributes.audiences = ["http://mcp.demo.example/"];
      }
    }
  }

  return attributes;
}
