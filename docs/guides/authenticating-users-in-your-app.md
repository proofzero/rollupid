---
description: How to authenticate users in your app
---

# Authenticating Users in your App

After completing the [auth flow](../getting-started/auth-flow.md) and obtaining a user's ID token, you can apply various strategies to manage authenticated users within your app.&#x20;

For more information on the ID token, refer to the [Tokens](../advanced/tokens.md) documentation.

### Browser Applications

#### Session Cookies

The most common method to authenticate a user's session in a browser application is by using session cookies. A session cookie can store simple user information, such as the ID token received through the authentication flow or a basic user ID. You can use this session cookie to validate the user's session for every subsequent server request.&#x20;

As a developer, you can set and reset expiry times on the session cookie to control the duration of the user's login. Most web frameworks have built-in support for session cookies.&#x20;

TODO: example code

{% hint style="info" %}
Alternatively, you can store session information on the server (e.g., Redis) and use a session key in the cookie for lookup.
{% endhint %}

#### Session Storage

For single-page applications (SPAs) without a backend, you can use browser session storage to store tokens.&#x20;

TODO: example code

{% hint style="info" %}
For client side auth you can also choose to use our session server. This requires a PRO account with custom hostnames. Track this feature here: [https://github.com/proofzero/rollupid/issues/1906](https://github.com/proofzero/rollupid/issues/1906)
{% endhint %}

{% hint style="warning" %}
For added security, it is recommended to obtain tokens using the PKCE flow, which is currently in development. See [https://github.com/proofzero/rollupid/issues/1671](https://github.com/proofzero/rollupid/issues/1671).
{% endhint %}

### Native Applications

The most common way to authenticate users in a native application is by using on-device secure storage to store tokens and maintain user sessions after the authentication flow. The primary difference with native apps is that you will need to use a WebView or browser to complete the authentication flow. This is achieved by setting the redirect URL to a custom URL scheme you register for your app.&#x20;

When Rollup redirects to this URL, your app can pick up the exchange code, complete the authentication flow, and receive the ID and access tokens.

TODO: example code

{% hint style="warning" %}
For added security, it is recommended to obtain tokens using the PKCE flow, which is currently in development. See [https://github.com/proofzero/rollupid/issues/1671](https://github.com/proofzero/rollupid/issues/1671).
{% endhint %}

## Logging Out

To enable users to log out, clear the session cookie or session storage and redirect them to your login page. Your login page should then redirect users to the authentication flow if they are not logged in. The authentication flow will prompt users to continue using their last known identity.
