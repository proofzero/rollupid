---
description: How to connect users to your database
---

# Adding Users to your Database

After completing the [auth flow](../getting-started/auth-flow.md) and obtaining a user's ID token and access token, you can choose from several strategies to connect users to your app's database. For more information on the ID token, refer to the [Tokens](../advanced/tokens.md) documentation.

## ID Token

You can create a user in your database using the ID token. The ID token contains the user's unique identifier in the subject (sub) field, which can serve as a reference for the user in your database. The ID token also includes the user's profile information, allowing you to populate user details in your database accordingly.

## Access Token

The access token also contains the user's unique identifier in the subject (sub) field. You can use this to identify the user in your database. Additionally, the access token includes the user's consented scopes, which help you determine the information you can access from the user's profile using the [Galaxy API](../reference/galaxy-api.md).

Make sure to store the access token securely in your database or another safe storage mechanism accessible to your application.
