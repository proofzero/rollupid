---
description: How Rollup ID works with OIDC / OAuth 2.0
---

# An Introduction to OpenID Connect (OIDC)

Rollup ID is an innovative Identity Provider (IDP) that leverages a unique, decentralized approach to identity management. By adhering to established protocols such as [OAuth 2.0](https://oauth.net/2/) and [OpenID](https://openid.net/developers/how-connect-works/) Connect (OIDC), Rollup ID offers a secure, consent-based authorization mechanism, enabling users to interact safely with online applications. This article will explore OIDC and its application within the Rollup ID platform.

<figure><img src=".gitbook/assets/image.png" alt=""><figcaption><p>Auth Flow</p></figcaption></figure>

### **Understanding OIDC**

OpenID Connect (OIDC) is a straightforward identity layer built on top of the OAuth 2.0 protocol. It enables clients to verify an end-user's identity based on the authentication performed by an authorization server. Additionally, OIDC provides basic profile information about the end-user in an interoperable and REST-like manner.

OIDC plays a crucial role in standardizing user authentication, simplifying the process for various online services to share this responsibility securely.

### **The Application of OIDC in Rollup ID**

Rollup ID not only embraces the OIDC and OAuth 2.0 standards but also introduces a layer of decentralized control. This approach effectively returns the control of privacy and data security to the users. Here's how it works:

* **Decentralized Control:** Unlike traditional OIDC setups where authorization tokens are issued by the IDP, in the Rollup ID ecosystem, users issue these tokens themselves. This user-centric approach provides full control and transparency to the users over their authorizations.
* **Consent-based Authorizations:** Rollup ID operates on consent-based authorizations to services and data, giving users complete control over which applications can access their data and the extent of this access.
* **Flexible and Extensible Claims:** Authorization claims can include access to profile data, linked accounts, email addresses, Personally Identifiable Information (PII) / Know Your Customer (KYC) data, smart contract wallets, and more. The platform is also designed to allow third-parties to publish custom claims in the future.
* **Easy Onboarding and Offboarding:** Rollup ID enables businesses to create simple, user-friendly onboarding and offboarding experiences that meet regulatory and compliance requirements while aligning with user needs and expectations.
* **Security and Fraud Prevention:** Rollup ID safeguards users and developers from "fake accounts" through its robust identity verification features, including passkeys and other multifactor authentication (MFA) methods.

By incorporating these features, Rollup ID achieves "logical" or "sufficient" decentralization. It provides a secure, private, and user-controlled identity platform that adheres to the standards set by OIDC, ensuring a seamless and secure online experience for all users.

### **Registering Applications with Rollup ID**

Before OIDC authentication can take place, developers must register their applications with Rollup ID. This can be done by create a new application on the [Developer Portal](https://console.rollup.id) and following the [Getting Started guide](broken-reference).

### **Authentication Flow**

Rollup ID supports the authorization code from the OIDC spec. Although applications without backend servers (that may be running purely client-side) are more suited to implicit authentication  flows, they are no longer recommended as they are not secure.&#x20;

Authentication begins with a request to the /authorize endpoint. When using the native Sign In with Rollup ID page, most of the OIDC process is handled for you. You can begin the authentication cycle by redirecting your users to the /authorize endpoint with the appropriate parameters.

```
https://passport.rollup.id/authorize?client_id={client_id}&response_type={code}&redirect_uri={encoded_redirect_url}&state={state_value}&scope=oidc+profile+email
```

### **Redirect Responses**

Once successfully authorized, the user is redirected back to your application. The redirect URL will contain a number of values, depending on the flow you are using.

The  authorization code flow, the redirect URL will contain the `code` (an authorization code that can be exchanged for an ID token) and the `state` (the optional state value passed to the /authorize endpoint).

### **ID Token Verification**

ID tokens must always be verified and should not be blindly accepted. To verify an ID token, fetch the public key from the [/jwks](reference/passport-api.md#jwks) endpoint. More details about this process can be found in the API documentation.

```javascript
import * as jose from 'jose'

const verifyJwt = (token: string) => {
	const JWKS = jose.createRemoteJWKSet(new URL('https://passport.rollup.id/jwks'))

	const { payload, header } = await jose.jwtVerify(token, JWKS, {
		issuer: 'https://rollup.id',
		aud: '<your client id>',
	})

	return payload
}

verifyJwt('eyJhbGciOiJSUzI1NiIsInR5cCI6Ikp.eyAs.XVCJ9...')

```
