---
description: Configure account abstraction features
---

# Blockchain

{% hint style="info" %}
This feature is in Early Access. [Login](https://console.rollup.id) to console and create an app to request access.
{% endhint %}

### Onboard users to blockchain

Ethereum account abstraction and user deposit vault accounts provide secure and flexible management of funds on the Ethereum blockchain. With this feature, apps can sponsor gas fees can interact with a smart contract wallet using the Galaxy API, while each user's funds are kept in a separate deposit vault account, reducing the risk of unauthorized access or loss of funds.

For more information read our guide: [using-smart-contract-wallets.md](../../guides/using-scopes/using-smart-contract-wallets.md "mention")

## Preferred Account Abstraction Providers

A paymaster is a service that facilitates sponsorship of gas fees for ERC 4337 smart contract wallets. You can read up about it more [here](https://www.stackup.sh/blog/what-are-paymasters).

{% hint style="warning" %}
Your paymaster credentials will only be used to sponsor registration of session keys driven by and for your application.
{% endhint %}

### [ZeroDev](https://zerodev.app)

To configure ZeroDev with your Rollup ID app you will need create a project and copy the project id into the applications.

## Interested in becoming an Account Abstraction Provider

Please answer the following questions to see if you qualify:

* [ ] Do you have an SDK or API?
  * Does your SDK use `fetcher`? (We do not support `XMLHttpRequest` and therefore do cannot integrate your SDK) OR
  * Can your service be used with API calls?
* [ ] Are your smart contracts 4337 compatible?
  * Do you have a smart contract factory to generate the same smart contract wallet address across all chains?
  * Does your smart contract wallet support session key registration?
  * Does your smart contract wallet support session key revocation?
  * Does your service help customers sponsor gas fees?

If you can answer yes to these questions please reach out to the team on [Discord](https://discord.gg/rollupid).
