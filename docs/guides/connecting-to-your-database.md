---
description: How to connect users to your database
---

# Connecting Users To Your Database

Once you have completed the [auth flow](../getting-started/auth-flow.md) and have a user's ID token and access token, you now have several strategies to connect users to your app's database.

See [Tokens](../advanced/token.md) for more information on the ID token.

## ID Token

You can use the ID token to create a user in your database. The ID token contains the user's unique identifier in the subject (sub) field of the ID token, which you can use to identify the user in your database. The ID token also contains the user's profile information, which you can use to populate user details in your database.

## Access Token

Within the access token, you can find the user's unique identifier in the subject (sub) field of the access token, which you can use to identify the user in your database. The access token also contains the user's consented scopes, which you can use to determine what information you can access from the user's profile using the [Galaxy API](../platform/profile-graph.md).

You should store this access token in your database or some other secure storage mechanism that is accessible to your application.
