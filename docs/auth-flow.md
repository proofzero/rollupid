---
title: Auth Flow
excerpt: Authenticating and authorizing users into your application.
category: 646678658d8a8b006dffd000
---

# Logging in Users

{% hint style="warning" %}
For this step you will need the **Client ID** and the **Client Secret** from the [previous step](create-an-application.md).
{% endhint %}

Since Rollup ID is **standards-compliant**, integrating it into your application is similar to integrating other OAuth-based authentication services like [Auth0](https://auth0.com/) or [Firebase](https://firebase.google.com/) / [Supabase](https://supabase.com/). You can use off-the-shelf [open-source libraries](https://oauth.net/code/) to build your OAuth flow.

We recommend setting up two routes in your application called `/auth/login` and `/auth/callback` to manage the authorization flow.

{% hint style="info" %}
We have created a reference implementation using [Remix](https://remix.run/) and the [Remix OAuth](https://github.com/sergiodxa/remix-auth) library [here](https://github.com/proofzero/rollupid/tree/main/apps/profile/app/routes/auth) which we will refer to several times in this step.
{% endhint %}

### Step 1: Initiate Authentication

To begin the authentication flow, redirect users to the Passport authorization endpoint with the Client ID and a randomly generated state parameter included in the query string. The URL should look like this: `https://passport.rollup.id/authorize?client_id=<your_app_id>&state=<generated_state>&scope=email`

You can achieve this by redirecting users to a route in your application that subsequently redirects them to the URL above.&#x20;

{% hint style="info" %}
For PRO accounts, custom hostnames of Passport are allowed.
{% endhint %}

Persist the state parameter in a cookie or other storage method for reference in a later step. In our reference implementation, the remix-oauth library handles this automatically. In your application, your chosen library will typically handle this for you.

Rollup ID will use the provided Client ID to look up your application details, displaying your application name and branding information. If your application requires specific authorization scopes, users will be presented with an authorization screen.

<figure><img src="../.gitbook/assets/13.png" alt=""><figcaption></figcaption></figure>

Upon completion, users will be redirected back to your app using the "Redirect URL" set in the previous step.

### Step 2: Handle Callback

Your Redirect URL should be ready to accept an exchange token and state parameters in the following format:

```
// https://<redirect_url>?code=<exchange code>&state=<state>
```

- **Code**: the exchange code needed request an access token
- **State:** this state should match the state you created for the user/client in Step 1. _Typically your chosen OAuth library will manage this for you._
- **Redirect URL**: the redirect url set in your app in the [previous step](create-an-application.md). _For development, "localhost" is an accepted redirect url host._

Ensure the state parameter matches the state you sent when initiating the auth flow in Step 1. This security measure helps prevent replay attacks. Send the exchange code along with the Client Secret and **grant type** to Passport's token endpoint (see below) to receive the access token, refresh token, and minimal user profile (encoded in an ID token) as base64-encoded signed JWTs, completing the flow.

{% swagger method="post" path="" baseUrl="https://passport.rollup.id/token" summary="Exchange access code for access token" %}
{% swagger-description %}
Exchange access code for access token, refresh token and ID token.

_(For more details visit the_ [_Passport API_](../platform/passport.md) _page)_
{% endswagger-description %}

{% swagger-parameter in="body" name="code" type="String" required="true" %}
Exchange code
{% endswagger-parameter %}

{% swagger-parameter in="body" name="client_id" required="true" type="String" %}
Application client id
{% endswagger-parameter %}

{% swagger-parameter in="body" name="client_secret" type="String" required="true" %}
Appication client secret
{% endswagger-parameter %}

{% swagger-parameter in="body" name="grant_type" type="String" required="true" %}
"authorization_code" or

"refresh_token"
{% endswagger-parameter %}

{% swagger-response status="201: Created" description="" %}

```javascript
{
    access_token: "ey....",
    refresh_token: "ey....",
    token_type: 'Bearer',
    id_token: "ey....",
}
```

{% endswagger-response %}
{% endswagger %}

#### Access Token

Access tokens are valid for 1 hour, with the expiry time stored in the "exp" property in the JWT. Refresh tokens, on the other hand, are valid for 90 days and can be used to request another access token using the same exchange code endpoint with the "refresh_token" grant type.

{% hint style="info" %}
There are multiple ways to manage this refresh flow, [here](../../apps/profile/app/utils/session.server.tsx#L52) is our reference implementation. In summary, we store the tokens encrypted in a user cookie that is valid for 90 days and refresh when needed.\
\
If you ever find yourself with an expired refresh token you can consider this as the user being "logged out" and redirect them back to passport for login to repeat this flow.
{% endhint %}

#### ID Token

ID tokens are only supplied when the initial set of tokens is retrieved, and are not provided again during usage of refresh tokens. Use the `/userinfo` [endpoint](../reference/passport-api.md#user-info) to retrieve fresh user details. The response, as well as what is encoded in the ID token, is shaped as follows:

```typescript
{
    name: string,
    picture: string,
    email: string,
    //...ID token encodes other claims as well
}
```

{% hint style="info" %}
Inside the ID token object you will find a unique claim called `sub` which will be consistent across all logins. This will match the value of the `sub` claim in access and refresh tokens also.
{% endhint %}

For more information on tokens and how to decode them please check out the [Tokens](../advanced/tokens.md) page.

Here is a [link](../../apps/profile/app/routes/auth/callback.tsx) to the reference implementation doing just this. With the access token you can make authorized requests to the [Profile Graph](../platform/profile-graph.md) for this user.

If you are coming from an existing provider please check out the [Migration Guide](../advanced/migration-guide.md).
