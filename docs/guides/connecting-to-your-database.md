---
description: How to connect users to your database
---

# Storing Tokens

After completing the [auth flow](../getting-started/auth-flow.md) and obtaining a user's ID token and access token, you can choose from several strategies to connect users to your app's database. For more information on the ID token, refer to the [Tokens](../advanced/tokens.md) documentation.

## ID Token

You can create a user in your database using the ID token. The ID token contains the user's unique identifier in the subject (sub) field, which can serve as a reference for the user in your database. The ID token also includes the user's profile information, allowing you to populate user details in your database accordingly.

## Access Token

The access token also contains the user's unique identifier in the subject (sub) field. You can use this to identify the user in your database. Additionally, the access token includes the user's consented scopes, which help you determine the information you can access from the user's profile using the [Galaxy API](../reference/galaxy-api.md).

Make sure to store the access token securely in your database or another safe storage mechanism accessible to your application.

## Refresh Token

In addition to storing ID tokens, you may also need to store refresh tokens in your database. Refresh tokens are used to obtain new access tokens without requiring the user to re-authenticate. This can be particularly useful for providing a seamless user experience, especially for applications that require long-lived sessions.

When you receive a refresh token, it should be stored securely in your database, associated with the user. Here's an example of how you might store a refresh token:

```json
{
  "userId": "{userId}",
  "refreshToken": "{refreshToken}"
}
```

When the access token expires, your application can use the stored refresh token to request a new access token from the Rollup ID authorization server. This request would include the refresh token along with your application's client ID and secret.

It's important to handle refresh tokens securely because they can be used to obtain new access tokens. If a refresh token is leaked, it could potentially allow unauthorized access to the user's resources. Therefore, refresh tokens should be stored securely and treated with the same level of care as the user's credentials.

To learn more about using refresh tokens with Rollup ID, refer to our [API documentation](../reference/passport-api.md) and resources.
