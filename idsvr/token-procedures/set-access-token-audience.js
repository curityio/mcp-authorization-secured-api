/**
 * @param {se.curity.identityserver.procedures.context.OpenIdConnectAuthorizationCodeTokenProcedureContext} context
 */
function result(context) {
  var delegationData = context.getDefaultDelegationData();
  var issuedDelegation = context.delegationIssuer.issue(delegationData);

  var accessTokenData = context.getDefaultAccessTokenData();

  // Support for resource identifier and audience restricted access tokens
  var resource = context.getRequest().getFormParameter("resource");

  if (resource) {
    // Allow if resource is part of configured audiences
    if (context.client.audiencesAsString.split(" ").indexOf(resource) != -1) {
      accessTokenData.aud = [resource];
    }
    // Allow if resource is configured in client properties (DCR clients)
    else if (context.client.properties.audiences.indexOf(resource) != -1) {
      accessTokenData.aud = [resource, 'http://api.demo.example'];
    }
    // Attempt to request access to resources that the client is not allowed to request.
    else {
      throw exceptionFactory.badRequestException(
        "invalid_target",
        "Resource parameter is invalid or unknown."
      );
    }
  }

  var issuedAccessToken = context.accessTokenIssuer.issue(
    accessTokenData,
    issuedDelegation
  );

  var refreshTokenData = context.getDefaultRefreshTokenData();
  var issuedRefreshToken = context.refreshTokenIssuer.issue(
    refreshTokenData,
    issuedDelegation
  );

  var responseData = {
    access_token: issuedAccessToken,
    scope: accessTokenData.scope,
    refresh_token: issuedRefreshToken,
    token_type: "bearer",
    expires_in: secondsUntil(accessTokenData.exp),
  };

  var idTokenData = context.getDefaultIdTokenData();
  if (idTokenData) {
    var idTokenIssuer = context.idTokenIssuer;
    idTokenData.at_hash = idTokenIssuer.atHash(issuedAccessToken);

    responseData.id_token = idTokenIssuer.issue(idTokenData, issuedDelegation);
  }

  return responseData;
}
