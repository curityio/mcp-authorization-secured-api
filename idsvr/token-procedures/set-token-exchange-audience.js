/**
 * @param {se.curity.identityserver.procedures.context.OAuthTokenExchangeUnInitializedProcedureContext} context
 */
function result(context) {
  
  var tokenData = context.getPresentedSubjectToken();
  var presentedDelegation = context.getPresentedSubjectTokenDelegation();
  
  // Allow the MCP server to use token exchange to update its token audience to the API audience
  var newAudience = context.request.getFormParameter('audience');
  if (tokenData.aud === 'https://mcp.demo.example/' && newAudience === 'https://api.demo.example') {
    tokenData.aud = [newAudience];
  }

  var scopes = tokenData.get('scope').split(' ');
  var fullContext = context.getInitializedContext(
    context.subjectAttributes(),
    context.contextAttributes(),
    tokenData.aud,
    scopes
  );

  var issuedAccessToken = fullContext
    .getDefaultAccessTokenJwtIssuer()
    .issue(tokenData, presentedDelegation);

  return {
    scope: tokenData.scope,
    access_token: issuedAccessToken,
    token_type: 'bearer',
    expires_in: secondsUntil(tokenData.exp),
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  };
}