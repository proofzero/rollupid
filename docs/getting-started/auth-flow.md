---
description: Authenticating and authorizing users into your application.
---

# Logging in Users

{% hint style="warning" %}
For this step you will need the **Application ID** and the **Application Secret** from the [previous step](create-an-application.md).
{% endhint %}

Rollup is **standards compliant** so, integrating Rollup into your application is identical to integrating any OAuth-based authentication services like [Auth0](https://auth0.com/), [Okta](https://auth0.com/), [Cognito](https://aws.amazon.com/cognito/), or [Azure AD B2C](https://azure.microsoft.com/en-us/services/active-directory/external-identities/b2c/#overview) meaning you can run off-the-shelf open source libraries to build your OAuth flow.

{% hint style="info" %}
We have created a reference implementation using [Remix](https://remix.run/) and the [Remix OAuth](https://github.com/sergiodxa/remix-auth) library [here](https://github.com/kubelt/kubelt/tree/main/apps/profile/app/routes/auth) which we will refer to several times in this step.
{% endhint %}

### Step 1: Authentication

To begin the authentication flow you will need to redirect users to the [passport](../platform/passport.md) authorization endpoint and include the application id and a random state parameter in the query string so that it looks like this: `https://passport.rollup.id/authorize?client_id=<your app id>&state=<generated state>`

The state parameter should be persisted in a cookie or some other storage method so that it can be referred to in a later step. In our reference implementation the remix-oauth library [handles this for us](../../apps/profile/app/routes/auth/index.tsx).

From here, Rollup will use the application id provided to lookup your application details so your application name and branding information will be displayed. If your application requires specific authorization scopes the user will then be presented with an authorization screen (example below).

<figure><img src="../.gitbook/assets/authorization.png" alt=""><figcaption></figcaption></figure>

When completed the user will then be redirected back to your app using the "Redirect URL" set in the previous step.

### Step 2: Callback

Your Redirect URL should be prepared to accept an exchange token and state parameters.&#x20;

The state parameter should match the state you sent when you kicked off the auth flow in step 1. This is a security measure in the protocol to prevent replay attacks. The exchange code is then sent with the **Application Secret** to passports token endpoint in order to recieve the access token as signed JWT and minimal user profile completing the flow.

{% hint style="info" %}
Inside the profile object you will find a unique identifier called "id" which will be consistent across all logins. This id will always match the "sub" property inside the signed JWT.
{% endhint %}

Here is a [link](../../apps/profile/app/routes/auth/callback.tsx) to the reference implementation doing just this. We With the access token you can make authorized requests to the Profile Graph for this user.
