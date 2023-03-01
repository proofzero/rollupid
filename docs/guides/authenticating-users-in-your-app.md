---
description: How to authenticate users in your app
---

# Authenticating Users in your App

Once you have completed the [auth flow](../getting-started/auth-flow.md) and have a user's ID token you now have several strategies to manage authenticated users to in app.

See [Tokens](../advanced/token.md) for more information on the ID token.

## Browser Applications

### Session Cookies

The most common way to authenticate a user's session in a browser application is to user browser session cookies. A session cookie is can store simple user information like the ID token recieved through the auth flow or just a simple user id. You can then use this session cookie to validate the user's session in your app every subsequent request.

As a developer you can set and reset expiry times on the session cookie to control how long the user is logged in for but most web frameworks have built in support for session cookies.

{% hint style="info" %}You may also choose to use server side sessions if you wish to store the user information serverside only instead of on the client with the cookie.{% endhint %}

### Session Storage

If you are building a single page application (SPA) without a backend to work with cookie sessions you can use browsers session storage to store the ID token using the PKCE auth flow.

{% hint style="warning" %} This feature is currently unsupported by Rollup. See https://github.com/proofzero/rollupid/issues/1671 {% endhint %}

## Native Applications

The most common way to authenticate users in a native application is to use a on device secure storage to store tokens and maintain user sessions after the auth flow. The major difference with native apps is that you will need to use a webview or browser to complete the auth flow. This works by setting the redirect URL to a [custom URL scheme](https://www.oauth.com/oauth2-servers/oauth-native-apps/redirect-urls-for-native-apps/) you register for your app.

When Rollup redirects to this URL your app will be able to pick up the exchange code, complete the auth flow, and recieve the ID and access tokens.
