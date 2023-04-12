---
description: Step-by-step guide to creating a Rollup application.
---

# Create an application

Follow these steps to create and configure your Rollup ID application:

### Step 1: Connect with Rollup Passport

First, visit [https://console.rollup.id](https://passport.rollup.id/) and log in to the [Console](../platform/console/) using Rollup Passport. You'll see a screen that offers various authentication methods to register or log in.

<figure><img src="../.gitbook/assets/authenticate.svg" alt=""><figcaption><p>Rollup Passport Authentication</p></figcaption></figure>

### Step 2: Create an App

Once you've logged in, you'll be redirected to the Console dashboard. Here, you can register and configure your Rollup ID application.&#x20;

Click on the "Create Application" button in the center of the screen. You'll be prompted to enter a name for your application and then redirected to the application's configuration screen.

<div>

<figure><img src="../.gitbook/assets/DashboardInstruction.png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Create Application.png" alt=""><figcaption></figcaption></figure>

</div>

### Step 3: Configure your Application

Upon creating your app, you'll land on the application dashboard. This is where you can obtain your [Galaxy API](../reference/galaxy-api.md) key and application keys.

{% hint style="warning" %}
The Client Secret is only shared once so, if you missed it you can click the "roll keys" link to regenerate the keys.
{% endhint %}

<div>

<figure><img src="../.gitbook/assets/Application Detail - Dashboard.png" alt=""><figcaption></figcaption></figure>

<figure><img src="../.gitbook/assets/Application Detail - Dashboard (1) (1).png" alt=""><figcaption></figcaption></figure>

</div>

Next, click the "OAuth" link in the left navigation bar to access the full application configuration screen. Here, you'll find a standard [OAuth 2.0](https://oauth.net/2/) configuration form.

<figure><img src="../.gitbook/assets/oauth.png" alt=""><figcaption></figcaption></figure>

Fill in the following required fields:

- **Redirect URL**: The address where Rollup will redirect your users to after they have completed the auth flow ([more on next page](auth-flow.md)).
- **App Icon**: Your application's logo, which will be displayed to users during the auth flow ([see passport for more](../platform/passport.md)).
- **Terms of Service URL**: A link to your application's TOS
- **Website**: A link to your application's website
- **Allowed scope**: The superset of scope values that the application can request
- **Domains**: \[coming soon]

{% hint style="warning" %}
In most cases, you'll need to set up an app for each environment and provide the appropriate **redirect URL** for each. For instance, you might use a "**localhost**" redirect URL for local development and a "staging" redirect URL for test environments.
{% endhint %}

Fill in any additional optional fields as needed. When you're done, click the "Published" toggle and then the "Save" button.

With your application fully configured, you're now ready to complete the integration.
