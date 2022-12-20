Galaxy is 3ID's GraphQL system.

After users have logged in via [Passport](../passport/index.md) they will be
[redirected to your application](../console/reference.md#redirect-url) with a
JSON Web Token (JWT) that includes their authorization information.

Call Galaxy by passing this JWT as a custom authorization header along with your
request. Galaxy will in turn pass the token to the underlying services it
orchestrates, that will in turn validate the access permissions it contains before
responding to your request.
