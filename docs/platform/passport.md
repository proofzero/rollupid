---
description: Auth everywhere your users are.
---

# Passport

Passport is an OAuth-based authentication and authorization gateway for your app that is hosted and customizable with your domain. It requires minimal integration and can be accessed on any device (desktop, web, mobile) and has the following flow and features.

### Auth Flow

#### Authentication

The authentication step takes care of identifying profiles on the [Profile Graph](profile-graph.md). The authentication method a user chooses acts like a DNS resolver to a users profile. If a profile is not found, one will be created.

Once authenticated the user will the be redirected to the authorization screen.&#x20;

<figure><img src="../.gitbook/assets/MacBook Pro 14_ - 1.png" alt=""><figcaption></figcaption></figure>

Passport's authentication flow currently supports the following authentication methods and are configurable for your app [Console](console.md):

* Connect with Wallet
* Connect with Email (coming soon)
* Connect with WebAuthN (coming soon)
* Connect with Google
* Connect with Apple
* Connect with Twitter
* Connect with Github
* Connect with Microsoft

#### Authorization

The key feature about Rollup's Profile is the authorization step. Based on what you set as your [Scopes](../reference/scopes.md) in the [Console](console.md) OAuth settings, the user will be presented with a branded authorization request to permission and/or provision access to the users identity features on the [Profile Graph](profile-graph.md).

{% hint style="info" %}
No scope is equivalent to an auto authorization with access only to public profile information. If no scopes are configured in Console the user will not be presented the authorization screen.
{% endhint %}

<figure><img src="../.gitbook/assets/MacBook Pro 14_ - 4.png" alt=""><figcaption></figcaption></figure>

Once authorized your the user will be redirected back to your application with the state and exchange code [described in the guide](../getting-started/auth-flow.md) to complete the auth flow and receive an access token.

### Tokens & Sessions

The passport application is also responsible for issuing access and refresh tokens via the [Profile API](my-profile.md). It is recommended that these tokens be managed by your application in either a session cookie and/or user record. Tokens can be continuously refreshed so long as the user has not explicitly revoked access.

Authenticated users will also maintain their session with passport for 90 days and that session will be extended long as the user user visits the passport app within the 90 day period. This also means that If your application session expires and the user is redirected to passport you will automatically get another access token and refresh token.
