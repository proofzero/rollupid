---
description: Rollup Account Abstraction Claims and API
---

# Using Smart Contract Wallets

## Accessing You User's Smart Contract Wallets

With Rollup your can request access to your users smart contract wallets. If they don't have a smart contract wallet, no sweat, we will help them create one when they onboard to your application. The following will guide you through setting up this flow.

### Prerequisites

* Setup an application with one of our [preferred paymaster providers](../platform/console/blockchain.md#preferred-paymasters).

### Setup

1. Login into [Console](https://console.rollup.id)
2. Go to your app (if you don't have one, [set one up](../getting-started/create-an-application.md))
3. Go to the Blockchain setting tab
4. In the paymaster section, enter your paymaster credential and save.
5. Go to the OAuth settings tab
6. In the scopes dropdown select `erc_4337` scope
7. Update your application to include the `erc_4337` scope in the [authorization request](../getting-started/auth-flow.md)

### Registering Session Keys



## Accessing Your App's Smart Contract Wallet

Save on fees with your applications personal L2 for batching transactions across multiple users. Coming soon: [https://github.com/proofzero/rollupid/issues/2252](https://github.com/proofzero/rollupid/issues/2252)
