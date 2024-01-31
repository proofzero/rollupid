---
description: Configuring your OAuth settings
---

# OAuth

The OAuth tab is where you can configure your applications standard OAuth settings including the name and logo that will appear in the [Passport](../passport.md) flow for your users.

This is the most important configuration in this tab is the [Scopes](../../reference/scopes.md). Every scope is represents an authorization request that will be presented to the user during the auth flow in Passport. These authorizations include access to profile information, connected accounts, provisioning wallets and more.

<figure><img src="broken-reference" alt=""><figcaption><p>OAuth Config Screen</p></figcaption></figure>

### Settings Panel

<figure><img src="../../.gitbook/assets/Screenshot 2023-03-20 at 1.01.10 PM.png" alt=""><figcaption><p>OAuth Settings Panel</p></figcaption></figure>

The settings panel is a read only configuration for your application's **Client ID** (aka App ID) and **Client Secret** (aka App Secret).&#x20;

These two keys are important for [logging in your users](../../getting-started/auth-flow.md).&#x20;

{% hint style="warning" %}
Here you can roll your your app's client secret but make sure to update this value in your app to ensure users can continue to login.
{% endhint %}

### Details Panel

<figure><img src="../../.gitbook/assets/image (1) (1) (1).png" alt=""><figcaption><p>OAuth App Details Panel</p></figcaption></figure>

The details panel is where you configure your application name, picture, [authorization scopes](../../reference/scopes.md), [custom domain](custom-domain.md), and other links.

The name and picture you choose will be displayed to users when logging in.&#x20;

<img src="../../.gitbook/assets/image (5).png" alt="" data-size="original">

The authorization scopes, "privacy policy" and "terms of services" will be displayed to the user during the authorization step.

<img src="../../.gitbook/assets/5.png" alt="" data-size="original">

### Links Panel

<figure><img src="../../.gitbook/assets/image (2).png" alt=""><figcaption><p>Links Panel</p></figcaption></figure>

The links panel is where you can add additional links about your apps that can be displayed to users in the Rollup apps directory.

### Danger Zone Panel

<figure><img src="../../.gitbook/assets/image (3).png" alt=""><figcaption><p>Danger Zone Panel</p></figcaption></figure>

This is where you can delete your application.
