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
        attributes.audiences = ["https://mcp.demo.example/"];
        
        // Record a property for the name to show in the login screen
        attributes.name = body.client_name;

        // Give the client a template area that uses a bespoke consent screen
        attributes.template_area = 'mcp-client';
        
        // Add custom properties delivered as AI content to APIs
        attributes.client_type = 'mcp';
        attributes.client_assurance_level = 1;
      }
    }
  }

  return attributes;
}