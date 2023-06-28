---
description: Using the connected accounts scope
---

# Connected Accounts

This guide will walk you through how to request email addresses from your user using the Connected Accounts [Scope](../reference/scopes.md).

### Step 1

In your application OAuth configuration make sure that the "connected accounts" scope is selected in the "allowed scopes" dropdown. Make sure to save this configuration before moving to step 2.

<figure><img src="../.gitbook/assets/CleanShot 2023-06-28 at 13.44.27.png" alt=""><figcaption><p>Connected Accounts Scope</p></figcaption></figure>

### Step 2

When [logging in users](../getting-started/auth-flow.md) make sure you add `connected_accounts` to the `scope` query param. Your auth url should look something like this `https://<rollup.id or your custom domain>/authorize?client_id=xxx&state=xxx&scope=connected_accounts`

### Step 3

After authenticating into your custom Rollup application, your users will we be presented with an authorization screen containing the connected accounts scope authorization request.

By default "All Connected Accounts" will be selected. Users will have the option to filter down connected accounts.

<figure><img src="../.gitbook/assets/Connect New Account (1).png" alt=""><figcaption><p>Connected Accounts Prompt</p></figcaption></figure>

### Step 4

When redirected back to your application, the [access token](../advanced/tokens.md) will now contain an authorization for connected accounts. The connected accounts will also be available returned in the user token via the [user info endpoint](../reference/passport-api.md#user-info).
