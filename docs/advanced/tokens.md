---
description: How to use OAuth2 tokens
---

# Tokens

There are two types of tokens that are related to user authentication and authoirzation: ID tokens and access tokens.

## ID tokens

ID tokens are JSON web tokens (JWTs) meant for use by the application only. All Rollup apps by default send a minimal ID token in the callback following the auth flow. Your app should parse the [token's contents](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims) and use the information (including details like name and profile picture) to customize the user experience.

According to the OpenID Connect specification, the audience of the ID token (indicated by the aud claim) must be the client ID of the application making the authentication request. If this is not the case, you should not trust the token.

The decoded contents of an ID token looks like the following:

to configure this snippet with your account

```json
{
  "iss": "{yourdomain}|https://passport.rollup.id/",
  "sub": "{accountUrn}",
  "aud": ["{yourClientId}"],
  "exp": 1311281970,
  "iat": 1311280970,
  "name": "Jane Doe",
  "picture": "http://example.com/janedoe/me.jpg",
  "email": "janedoe@example.com"
}
```

This token can be treated as authentication to your application. The audience (the aud claim) of the token is set to the application's identifier, which means that only this specific application should consume this token. You can store this token with the user's profile in your database using the subject as the unique user identifier and use it to personalize the user's experience.

Conversely, Rollup's Galaxy API expects a different token with the same aud value but with additional parameters for security. Therefore sending an ID token to Galaxy will not work. Since the ID token is not signed by the API, the API would have no way of knowing if the application had modified the token (e.g., adding more scopes) if it were to accept the ID Token.

## Access tokens

Access tokens are JWTs used to inform the Galaxy API that the bearer of the token has been authorized to access the API and perform a predetermined set of actions (specified by the scopes granted). An app can request scopes through the Console OAuth settings page and the user can grant or deny access to the scopes during the auth flow.

Following the auth flow, Rollup sends an access token to the app after the user logs in -- this token provides consent for the app to perform actions based on authoirzed scopes. For example, when your app wants to request access to read connected accounts, it sends a request to the Galaxy API, including the access token in the HTTP Authorization header which should include the connected accounts scope.

Access tokens must never be used for authentication. Access tokens cannot tell if the user has authenticated. The only user information the access token possesses is the user ID, located in the sub claim. In your applications, treat access tokens as opaque strings since they are meant for APIs. Your application should not attempt to decode them or expect to receive tokens in a particular format.

Here is an example of an access token:

to configure this snippet with your account

```json
{
  "iss": "{yourdomain}|https://passport.rollup.id/",
  "sub": "{accountUrn}",
  "aud": ["{yourClientId}"],
  "azp": "{yourClientId}",
  "exp": 1489179954,
  "iat": 1489143954,
  "scope": "openid profile email read:connected_accounts"
}
```

Note that the token does not contain any information about the user besides their ID (sub claim). It only contains authorization information about which actions the application is allowed to perform via API (scope claim). This is what makes it useful for securing an API, but not for authenticating a user.

In some situations, it may be desirable to put additional information about the user or other custom claims, besides their sub claim, in the access token to save the API from having to do extra work to fetch details about the user. If you choose to do this, bear in mind that these extra claims will be readable in the access token. To learn more, read [Create Custom Claims](advanced/custom-claims.md).
