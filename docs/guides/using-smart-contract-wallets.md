---
description: Rollup Account Abstraction Claims and API
---

# Using Smart Contract Wallets

Okay, so you've [got a Rollup account and you've created an app which supports `erc_4337` scope](../platform//console//oauth.md#oauth). [You selected Paymaster Provider as well](../platform/console/blockchain.md)! What now?

I'm glad you asked! But the main question to ask here is actually _How do I sponsor gas fees for my users?_

Let's answer the last one first.

## How do I sponsor gas fees for my users?

To sponsor Gas for your users you'll need to obtain a session key for the smart contract wallet. This is need to be able to sign transactions on behalf of the user(and pay gas fees).

Once you have the session key, everything you'll need to do is to check how to use this session key with the functions your selected paymaster provider offers.

For example this is how you create signer with ZeroDev:

```typescript
const sessionKeySigner = await createSessionKeySigner({
  projectId,
  sessionKeyData: sessionKey,
  privateSigner: privateSigner,
})
```

Where privateSigner is a developers' wallet,
It can be created, for example, like this:

```typescript
import { Wallet } from 'ethers'

const privateSigner = Wallet.createRandom()
```

Check [ZeroDev docs](https://docs.zerodev.app/use-wallets/use-session-keys) to learn more about session keys.

With this `sessionKeySigner` you can sign transactions on behalf of the user.

The next question here is

## How do I get a session key?

To get your sessionPublicKey you simply need to do

```typescript
const sessionPublicKey = await privateSigner.getAddress()
```

We expose `registerSessionKey` function in the [Galaxy API](../../reference/galaxy-api.md) which you can use to register a session key for your user.

Here's how you can do it:

```typescript
const query = `mutation registerSessionKey($accountUrn: URN!, $sessionPublicKey: String!, $smartContractWalletAddress: String!)
{
  registerSessionKey: registerSessionKey(accountUrn: $accountUrn, sessionPublicKey: $sessionPublicKey, smartContractWalletAddress: $smartContractWalletAddress) {
    sessionKey
  }
}`

const sessionKey = fetch('https://galaxy.rollup.id/graphql', {
  method: 'post',
  headers: {
    'X-GALAXY-KEY': '...',
  },
  body: JSON.stringify({
    query,
    variables: {
      accountUrn: '...', //users' accountURN
      smartContractWalletAddress: '...', //users' smart contract wallet address
      sessionPublicKey: '...', //your(devs') public key for which to issue session key
    },
  }),
})
  .then((r) => r.json())
  .catch((err) => {
    console.error(err) // something went wrong
    return { profile: null }
  })
```

{% hint style="info" %}

And that's it! Happy sponsoring gas fees for your users!

{% endhint %}
