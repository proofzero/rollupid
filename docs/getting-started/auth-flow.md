---
description: Authenticating and authorizing users into your application.
---

# Logging in Users

{% hint style="warning" %}
For this step you will need the **Application ID** and the **Application Secret** from the [previous step](create-an-application.md).
{% endhint %}

Rollup is **standards compliant** so, integrating Rollup into your application is identical to integrating any OAuth-based authentication services like [Auth0](https://auth0.com/), [Okta](https://auth0.com/), [Cognito](https://aws.amazon.com/cognito/), [Azure AD B2C](https://azure.microsoft.com/en-us/services/active-directory/external-identities/b2c/#overview), [Firebase](https://firebase.google.com/) or [Supabase](https://supabase.com/), meaning you can run off-the-shelf open source libraries to build your OAuth flow.

{% hint style="info" %}
We have created a reference implementation using [Remix](https://remix.run/) and the [Remix OAuth](https://github.com/sergiodxa/remix-auth) library [here](https://github.com/kubelt/kubelt/tree/main/apps/profile/app/routes/auth) which we will refer to several times in this step.
{% endhint %}

### Step 1: Auth

To begin the authentication flow you will need to redirect users to the [passport](../platform/passport.md) authorization endpoint and include the application id and a random state parameter in the query string so that it looks like this: `https://passport.rollup.id/authorize?client_id=<your app id>&state=<generated state>`

{% hint style="info" %}
We do allow custom CNAMEs of passport for Pro users.&#x20;
{% endhint %}

The state parameter should be persisted in a cookie or some other storage method so that it can be referred to in a later step. In our reference implementation the remix-oauth library [handles this for us](../../apps/profile/app/routes/auth/index.tsx).

<figure><img src="../.gitbook/assets/13.png" alt=""><figcaption></figcaption></figure>

From here, Rollup will use the application id provided to lookup your application details so your application name and branding information will be displayed. If your application requires specific authorization scopes the user will then be presented with an authorization screen (example below).

When completed the user will then be redirected back to your app using the "Redirect URL" set in the previous step.

### Step 2: Callback

Your Redirect URL should be prepared to accept an exchange token and state parameters.&#x20;

```
// https://<redirect_url>?code=<exchange code>&state=<state>
```

* **Code**: the exchange code needed request an access token
* **State:** this state should match the state you created for the user/client in step 1
* **Redirect URL**: the redirect url set in your app in the [previous step](create-an-application.md).

The state parameter should match the state you sent when you kicked off the auth flow in step 1. This is a security measure in the protocol to prevent replay attacks. The exchange code is then sent with the **Application Secret** and the **grant type** to passports token endpoint in order to receive the access token and refresh token as base64 encoded signed JWT as well as a minimal user profile completing the flow.

{% hint style="info" %}
We use a javascript library called [jose](https://www.npmjs.com/package/jose) to encode and decode signed JWT. As a open standard there are libraries for all languages that do the same.
{% endhint %}

{% swagger method="post" path="" baseUrl="https://passport.rollup.id/token" summary="Exchange access code for access token" %}
{% swagger-description %}
Exchange access code for access token and refresh token.
{% endswagger-description %}

{% swagger-parameter in="body" name="code" type="String" required="true" %}
Exchange code
{% endswagger-parameter %}

{% swagger-parameter in="body" name="client_secret" type="String" required="true" %}
Application secret
{% endswagger-parameter %}

{% swagger-parameter in="body" name="grant_type" type="String" required="true" %}
"authorization_code" or "refresh_token"
{% endswagger-parameter %}

{% swagger-response status="201: Created" description="" %}
```javascript
{
    access_token: "ey....",
    refresh_token: "ey....",
    profile: {
       id: "abc123",
       displayName: "Bob"
   }
}
```
{% endswagger-response %}
{% endswagger %}

Every access token is valid for **1 hour.** This expiry time is stored in the "exp" property in the JWT.  ****  On the other hand, the refresh token is valid for **90 days** and can be used to request another access token using the same exchange code endpoint with the "refresh\_token" grant type.&#x20;

There are multiple ways to manage this refresh flow, [here](../../apps/profile/app/utils/session.server.tsx#L52) is our reference implementation. In summary, we store the tokens encrypted in a user cookie that is valid for 90 days and refresh when needed.

If you ever find yourself with an expired refresh token you can consider this as the user being "logged out" and redirect them back to passport for login to repeat this flow.

{% hint style="info" %}
Inside the profile object you will find a unique identifier called "id" which will be consistent across all logins. This id will always match the "sub" property inside the signed JWT.
{% endhint %}

Here is a [link](../../apps/profile/app/routes/auth/callback.tsx) to the reference implementation doing just this. With the access token you can make authorized requests to the [Profile Graph](../platform/profile-graph.md) for this user.