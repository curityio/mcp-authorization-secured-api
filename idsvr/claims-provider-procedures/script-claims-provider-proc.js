/**
 * @param {se.curity.identityserver.procedures.claims.ClaimsProviderProcedureContext} context
 */
function result(context) {

  // Read the role and region from the user account
  var dataSource = context.getAttributeDataSource();
  var dataSourceAttributes = dataSource.getAttributes(context.subjectAttributes.subject);
  var account = dataSourceAttributes.getRow(0);
  var accountAttributes = JSON.parse(account.attributes);
  if (!accountAttributes) {
    return {};
  }

  // Also include client properties
  return { 
    region: accountAttributes.region || '',
    client_type: context.client.properties.client_type || '',
    client_assurance_level: context.client.properties.client_assurance_level || 0,
  }
}
