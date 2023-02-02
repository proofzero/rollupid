---
description: Public Profile Utility API
---

# Public Profile API

### Public Profile

Call this method to fetch a public profile.

{% swagger method="get" path="" baseUrl="https://profile.rollup.id/$type/$address.json" summary="Public Profile" expanded="true" %}
{% swagger-description %}
Call this method to fetch a public profile.&#x20;

If provider is set, this means it is another verified connected account to this profile.
{% endswagger-description %}

{% swagger-parameter in="path" required="true" name="type" %}
The account type/provider you want to use to resolve the profile.

\




\


Possible Values:

\


\- Handle (first party)

\


\- ETH

\


\- Github

\


\- Twitter

\


\- Discord
{% endswagger-parameter %}

{% swagger-parameter in="path" required="true" name="address" %}
The account type handle used to resolve the profile



Handle Types:\
\- ETH: account or ens\
\- Github: username\
\- Twitter: handle\
\- Discord: username
{% endswagger-parameter %}

{% swagger-response status="200: OK" description="" %}
```javascript
{
    handle: string | null,
    displayName: string,
    pfp: {
      image: string,
      isToken: boolean
    },
    cover: string,
    bio: string | null,
    job: string | null,
    location: string: null,
    links: [{name: string, url: string, provider: string | null}],
    gallery: [{contract: string, tokenId: string}]
}
```
{% endswagger-response %}
{% endswagger %}

#### Example

Profile from ETH Address

```typescript
const profile = await fetch("https://profile.rollup.id/eth/maurerbot.eth.json")
```

#### Source

[https://github.com/kubelt/kubelt/blob/main/apps/profile/app/routes/%24type.%24address.tsx](../../apps/profile/app/routes/%24type.%24address.tsx)
