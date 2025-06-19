/**
 * @param {se.curity.identityserver.procedures.context.OAuthTokenExchangeUnInitializedProcedureContext} context
 */
function result(context) {
  
  var tokenData = context.getPresentedSubjectToken();
  var presentedDelegation = context.getPresentedSubjectTokenDelegation();

  // Allow audience overrides by token exchange clients like the MCP server
  var newAudience = context.request.getFormParameter('audience');
  if (newAudience) {
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
    claims: tokenData.claims,
    access_token: issuedAccessToken,
    token_type: 'bearer',
    expires_in: secondsUntil(tokenData.exp),
    issued_token_type: 'urn:ietf:params:oauth:token-type:access_token',
  };
}