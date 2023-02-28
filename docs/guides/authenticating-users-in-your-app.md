---
description: How to authenticate users in your app
---

# Authenticating Users in your App

Once you have completed the [auth flow](../getting-started/auth-flow.md) and have a user's ID token you now have several strategies to authenticate users to in app.

See [Tokens](../advanced/token.md) for more information on the ID token.

## Browser Applications

### Session Cookies

The most common way to authenticate users in a browser application is to user browser session cookies. With this strategy, you can use the ID token to create an encrypted session cookie and store it in the browser. You can then use this session cookie to authenticate the user in your app every subsequent request.

As a developer you can set and reset expiry times on the session cookie to control how long the user is authenticated for. For example, you can set the expiry time to 1 hour and then reset it to 1 hour every time the user makes a request to your app. This way, the user will be authenticated for 1 hour after their last request.

Most application frameworks have built in support for session cookies.

{% hint style="info" %}You may also choose to use server side sessions if you wish to store the tokens serverside only instead of on the client with the cookie.{% endhint %}

### Session Storage

If you are building a single page application (SPA) without a backend you can use browsers session storage to store the ID token using the PKCE auth flow.

{% hint style="warning" %} This feature is currently unsupported by Rollup. See https://github.com/proofzero/rollupid/issues/1671 {% endhint %}

{% hint style="info" %}You may be able to achieve this flow today by opening a new tab or pop up for the auth flow and using js post message `postMessage` API on interval to check when complete. However, we don't reccomend this.{% endhint %}

## Native Applications

The most common way to authenticate users in a native application is to use a secure storage mechanism to store the ID token after the auth flow. The major difference with Mobile Apps is that you will need to use a webview or browser to complete the auth flow. This works by setting the redirect URL to a [custom URL scheme](https://www.oauth.com/oauth2-servers/oauth-native-apps/redirect-urls-for-native-apps/) you register for your app.

When Rollup redirects to this URL your app will be able to pick up the exchange code complete the auth flow and recieve the ID and access tokens.
