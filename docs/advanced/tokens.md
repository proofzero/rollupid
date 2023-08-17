---
description: How to use OAuth2 tokens
---

# Tokens

Two types of tokens are related to user authentication and authorization: ID tokens and access tokens.

## ID tokens

ID tokens are JSON web tokens (JWTs) intended for use by the application only. By default, all Rollup apps send a minimal ID token in the callback following the authentication flow. Your app should parse the [token's contents](https://openid.net/specs/openid-connect-core-1\_0.html#StandardClaims) and use the information (including details like name and profile picture) to customize the user experience.

The decoded contents of an ID token looks like the following:

```json
{
  "iss": "https://passport.rollup.id/",
  "sub": "{identityUrn}",
  "aud": ["{yourClientId}"],
  "exp": 1311281970,
  "iat": 1311280970,
  "name": "Jane Doe",
  "picture": "http://example.com/janedoe/me.jpg",
  "email": "janedoe@example.com"
}
```

{% hint style="info" %}
In the Pro version of Rollup you can set the issuer (iss) to your own custom domain. See custom domain feature in your Console app.
{% endhint %}

ID tokens can be treated as authentication tokens for your application. You can store this token with the user's profile in your database using the subject as the unique user identifier and use it to personalize the user's experience. However, sending an ID token to the Galaxy API will not work.

## Access tokens

Access tokens are JWTs used to inform the Galaxy API that the bearer of the token has been authorized to access the API and perform a predetermined set of actions (specified by the granted scopes). An app can request scopes through the Console OAuth settings page, and the user can grant or deny access to the scopes during the authentication flow.

Access tokens must never be used for authentication. They do not confirm if the user has authenticated. Access tokens only possess the user ID, located in the sub claim. Treat access tokens as opaque strings since they are meant for APIs. Your application should not attempt to decode them or expect to receive tokens in a particular format.

Here is an example of an access token:

```json
{
  "iss": "https://passport.rollup.id/",
  "sub": "{identityUrn}",
  "aud": ["{yourClientId}"],
  "azp": "{yourClientId}",
  "exp": 1489179954,
  "iat": 1489143954,
  "scope": "openid profile email read:connected_accounts"
}
```

{% hint style="info" %}
In the Pro version of Rollup you can set the issuer (iss) to your own custom domain. See custom domain feature in your Console app.
{% endhint %}

Access tokens do not contain any user information other than their ID (sub claim) and authorization information about the actions the application is allowed to perform via the API (scope claim). This makes them useful for securing an API but not for authenticating a user.

In some situations, it may be desirable to include additional information about the user or other custom claims in the access token to save the API from having to fetch details about the user. If you choose to do this, be aware that these extra claims will be readable in the access token. Non-access claims, however, will be readable in the ID token. To learn more, read [Create Custom Claims](custom-claims.md).

## Refresh Tokens

In addition to ID tokens and access tokens, OAuth 2.0 also introduces the concept of refresh tokens. A refresh token is a special kind of token that can be used to obtain a renewed access token. This is useful in situations where the access token has expired or has been invalidated, and the application needs to gain access to the user's resources without having to re-authenticate the user.

Refresh tokens are typically long-lived and can be used to request new access tokens from the authorization server. This is done by sending a request to the token endpoint of the authorization server, including the refresh token along with the client's ID and secret.

Here is an example of a refresh token:

```json
{
  "iss": "https://passport.rollup.id/",
  "aud": ["{yourClientId}"],
  "sub": "{userId}",
  "exp": "{expiryTimestamp}",
  "iat": "{issuedAtTimestamp}",
  "jti": "{uniqueTokenIdentifier}"
}
```

In the Pro version of Rollup, you can set the issuer (iss) to your own custom domain. See the custom domain feature in your Console app.

Refresh tokens provide a more seamless user experience by reducing the need for the user to re-authenticate and grant permissions, while also maintaining the security and privacy of the user's data. However, because refresh tokens can be used to obtain new access tokens, they must be stored securely and treated with the same level of care as the user's credentials.

To learn more about using refresh tokens with Rollup ID, refer to our [API documentation](../reference/passport-api.md#exchange-token) and resources.
