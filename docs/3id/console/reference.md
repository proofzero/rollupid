The Console 0xAuth page allows you to configure your 0xAuth and white labelling
settings. Use the **Save** button in the top-right corner of the page to commit
any changes you make.

![0xAuth Config](../img/console-app-0xauth.png)

## 0xAuth Settings

**0xAuth** is our standard implementation of OAuth, extended to support
decentralization. This section shows your 0xAuth Application ID and Secret. Like
in standard OAuth, these are effectively your application's username and
password for the 0xAuth authorization scheme.

### Roll Keys

"Roll Keys" allows you to generate a new secret and expire the existing one.

## Application Status

The **Published** toggle shows you whether your application is available publicly.
You can change its status and click **Save** at the top-right of the page in order
to hide (left) and expose (right) your application.

This will not delete your application (see [Danger Zone](#danger-zone), below).

## Details

This section contains 0xAuth and white labelling settings for your application.

### Application Name

This is the name displayed to users connecting to your application. It is used
as a human-readable name for your application within Console and Passport as well.

### Scopes

Add and create the authorization scopes that your application requests from users.
A scope is a named kind of data (e.g., [3ID Profiles](../profile/index.md) are 
available as `Profile`), along with the type of access requested (e.g., `read`,
`write`).

### Domain(s)

This is the list of domains to which your application is restricted. Requests
not originating from these domains will be rejected.

### Redirect URL

The standard OAuth redirect URL for your application. After users successfully
connect to your Console application using Passport they are redirected to this
URL with a valid JWT describing their authorization context (i.e. scopes within
the provided domains).

### Terms of Service URL

The URL for any legal text you wish to display to users of your application.

### Website

The URL for your application.

### App Icon

Customize the [Passport](../passport/index.md) authorization flow for your users
by uploading your app's icon.

## Links

**Links** are a white labelling feature allowing you to display links to your
social accounts and marketing sites alongside your application in various contexts:

* Website: your marketing landing page.
* Medium: your Medium blog.
* Discord: your Discord invite link.
* Twitter: your Twitter account.
* Mirror: your Mirror blog.

## Danger Zone

### Delete the App

This will delete your application and all associated data.
