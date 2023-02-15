---
description: Auth Gateway
---

# Passport API

### Exchange Token

Call this method to exchange an exchange code or refresh token for a new access token and refresh token.

{% swagger method="post" path="" baseUrl="https://passport.rollup.id/token" summary="Exchange Token" %}
{% swagger-description %}
Call this method to exchange an exchange code or refresh token for a new access token and refresh token.
{% endswagger-description %}

{% swagger-parameter in="body" name="code" type="String" required="true" %}
Exchange code
{% endswagger-parameter %}

{% swagger-parameter in="body" name="client_id" required="true" %}
Application client id
{% endswagger-parameter %}

{% swagger-parameter in="body" name="client_secret" type="String" required="true" %}
Application client secret
{% endswagger-parameter %}

{% swagger-parameter in="body" name="grant_type" type="String" required="true" %}
"authorization_code" or "refresh_token"
{% endswagger-parameter %}

{% swagger-response status="201: Created" description="Exchange token response" %}

```javascript
{
    access_token: string,
    refresh_token: string,
    token_type: 'Bearer',
    id_token: string
}
```

{% endswagger-response %}
{% endswagger %}

#### Example

{% tabs %}
{% tab title="Javascript" %}

```typescript
const tokenForm = new Form()
tokenForm.append('exchange_code', exchangeCode)
tokenForm.append('grant_type', grantType)
tokenForm.append('client_id', clientId)
tokenForm.append('client_secret', clientSecret)

const { access_code, refresh_token } = await fetch(
  'https://passport.rollup.id/token',
  {
    method: 'post',
    body: tokenForm,
  }
)
```

{% endtab %}

{% tab title="Curl" %}

```bash
curl -X POST https://passport.rollup.id/token -d \
  --header "Content-Type: application/x-www-form-urlencoded" \
  "client_id={clientId}&client_secret={clientSecret}&exchange_code={exchangeCode}&grant_type=authorization_code"
```

{% endtab %}
{% endtabs %}

#### Source

[https://github.com/proofzero/rollupid/blob/main/apps/passport/app/routes/token.tsx](../../apps/passport/app/routes/token.tsx)
