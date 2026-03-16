/**
 * @param {se.curity.identityserver.procedures.claims.ClaimsProviderProcedureContext} context
 */
function result(context) {

  // Read the role and region from the user account
  var dataSource = context.getAttributeDataSource();
  var dataSourceAttributes = dataSource.getAttributes(context.subjectAttributes.subject);
  var account = dataSourceAttributes.getRow(0);
  var accountAttributes = JSON.parse(account.attributes);
  var clientType = context.client.properties.client_type;
  var clientAssuranceLevel = context.client.properties.client_assurance_level;

  if (!accountAttributes) {
    return {};
  }

  if (context.client.id.startsWith("https://")) {
    logger.warn("Preparing claims for ephemeral client.")
    clientType = clientType || "mcp";
    clientAssuranceLevel = clientAssuranceLevel || 1;
  }

  // Also include client properties
  return { 
    region: accountAttributes.region || '',
    client_type: clientType || '',
    client_assurance_level: clientAssuranceLevel || 0,
  }
}
