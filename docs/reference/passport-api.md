---
description: Auth Gateway
---

# Passport API

### Exchange Token

Call this method to exchange an exchange code or refresh token for a new access token and refresh token.

{% swagger method="post" path="" baseUrl="https://passport.rollup.id/token" summary="Exchange Token" expanded="false" %}
{% swagger-description %}
Call this method to exchange an exchange code or refresh token for a new access token and refresh token.
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

#### Example

```typescript
const tokenForm = new Form()
tokenForm.append("exchange_code", exchangeCode)
tokenForm.append("grant_type", grantType)

const {access_code, refresh_token } = await fetch("https://passport.rollup.id/token",
 {
   body: tokenForm
 })
```

#### Source

[https://github.com/kubelt/kubelt/blob/main/apps/passport/app/routes/token.tsx](../../apps/passport/app/routes/token.tsx)
