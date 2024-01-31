---
description: Step-by-step guide to creating a Rollup application.
---

# Create an Application

### Step 1: Connect with Rollup Passport

* Begin by visiting the [Rollup Console](https://console.rollup.id/) and logging in.
* Once logged in, you'll land on the [Console](../platform/console/) dashboard. If this is your first time logging in you will be presented with an quick onboarding flow where you will be directed to create an application.

### Step 2: Register Your Application

* In your personal or group dashboard click on the "Create Application" button.
* Provide a name for your application. After this, you'll be redirected to the application's configuration screen.

### Step 3: Configure your Application

On the application dashboard, you can obtain your Galaxy API key and application keys.

{% hint style="warning" %}
The Client Secret is only shared once so, if you missed it you can click the "roll keys" link to regenerate the keys.
{% endhint %}

Navigate to the "OAuth" section for a comprehensive application configuration. Here, you'll find a standard [OAuth 2.0](https://oauth.net/2/) configuration form. Ensure you fill in the required fields to customize your auth flow:

* **Application Name:** The name of your application. This will be displayed to users during the auth flow.
* **Redirect URL**: Where Rollup redirects users post-authentication to exchange tokens (more details on this on next page).
* **App Icon**: Your application's logo, which will be displayed to users during the auth flow.
* **Allowed scope**: The superset of [scope](../reference/scopes.md) values that the application can request from users.
* **Terms of Service URL**: A link to your application's TOS
* **Privacy Policy URL**: A link to your application's Privacy Policy
* **Website URL**: A link to your application's website

{% hint style="warning" %}
For different environments (like development or testing), set up distinct apps with the appropriate redirect URLs (e.g. "localhost").
{% endhint %}

Once all details are filled in, activate the "Published" toggle and hit the "Save" button. With your application fully configured, you're now ready to complete integrate the auth flow into your app.
