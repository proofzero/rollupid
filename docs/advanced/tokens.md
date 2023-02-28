---
description: How to use OAuth2 tokens
---

# Tokens

There are two types of tokens that are related to identity: ID tokens and access tokens.

ID tokens
ID tokens are JSON web tokens (JWTs) meant for use by the application only. For example, if there's an app that uses Google to log in users and to sync their calendars, Google sends an ID token to the app that includes information about the user. The app then parses the token's contents and uses the information (including details like name and profile picture) to customize the user experience.

Be sure to validate ID tokens before using the information it contains. You can use a library to help with this task.

Do not use ID tokens to gain access to an API. Each token contains information for the intended audience (which is usually the recipient). According to the OpenID Connect specification, the audience of the ID token (indicated by the aud claim) must be the client ID of the application making the authentication request. If this is not the case, you should not trust the token.

The decoded contents of an ID token looks like the following:

to configure this snippet with your account

```json
{
  "iss": "http://{yourDomain}/",
  "sub": "auth0|123456",
  "aud": "{yourClientId}",
  "exp": 1311281970,
  "iat": 1311280970,
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "gender": "female",
  "birthdate": "0000-10-31",
  "email": "janedoe@example.com",
  "picture": "http://example.com/janedoe/me.jpg"
}
```

Was this helpful?

/
This token authenticates the user to the application. The audience (the aud claim) of the token is set to the application's identifier, which means that only this specific application should consume this token.

Conversely, an API expects a token with the aud value to equal the API's unique identifier. Therefore, unless you maintain control over both the application and the API, sending an ID token to an API will generally not work. Since the ID token is not signed by the API, the API would have no way of knowing if the application had modified the token (e.g., adding more scopes) if it were to accept the ID Token. See the JWT Handbook for more information.

Access tokens
Access tokens (which aren't always JWTs) are used to inform an API that the bearer of the token has been authorized to access the API and perform a predetermined set of actions (specified by the scopes granted).

In the Google example above, Google sends an access token to the app after the user logs in and provides consent for the app to read or write to their Google Calendar. Whenever the app wants to write to Google Calendar, it sends a request to the Google Calendar API, including the access token in the HTTP Authorization header.

Access tokens must never be used for authentication. Access tokens cannot tell if the user has authenticated. The only user information the access token possesses is the user ID, located in the sub claim. In your applications, treat access tokens as opaque strings since they are meant for APIs. Your application should not attempt to decode them or expect to receive tokens in a particular format.

Here is an example of an access token:

to configure this snippet with your account

```json
{
  "iss": "https://{yourDomain}/",
  "sub": "auth0|123456",
  "aud": ["my-api-identifier", "https://{yourDomain}/userinfo"],
  "azp": "{yourClientId}",
  "exp": 1489179954,
  "iat": 1489143954,
  "scope": "openid profile email address phone read:appointments"
}
```

Was this helpful?

/
Note that the token does not contain any information about the user besides their ID (sub claim). It only contains authorization information about which actions the application is allowed to perform at the API (scope claim). This is what makes it useful for securing an API, but not for authenticating a user.

In some situations, it may be desirable to put additional information about the user or other custom claims, besides their sub claim, in the access token to save the API from having to do extra work to fetch details about the user. If you choose to do this, bear in mind that these extra claims will be readable in the access token. To learn more, read Create Custom Claims.
