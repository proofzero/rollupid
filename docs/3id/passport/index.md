[Passport](https://passport.threeid.xyz) is 3ID's authentication and
authorization system. It gives you a drop-in, secure, customizable way to
onboard users. To use Passport, first [create a Console application](../guides/app-setup.md).

Once you have [configured 0xAuth](../console/reference.md) you'll be able to add
the Passport button to your application.

Users will be redirected to your application (via your [configurable redirect URL](../console/reference.md#redirect-url))
and you will be able to use the JWT included in that request to identify your
users and to make calls to [Galaxy](../galaxy/index.md).
