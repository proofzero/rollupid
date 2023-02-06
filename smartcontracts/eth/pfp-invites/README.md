# Rollup Invitation Project

## Project Configuration

**Before doing anything** edit `hardhat.config.ts` and set the config for your default project (invite or profile).

You can optionally switch between the two using `npx hardhat --config [profile|invite].config.ts` as your base hardhat command.

**Also** get `profile.secret.ts` and/or `invite.secret.ts` from secret storage.

The rest of this document is about invitations. It largely applies _mutatis mutandis_ for profiles, but profile pictures are not human controlled (e.g., no airdropping, etc.).

## Testing

First, run your node:

```bash
npx hardhat node
```

Test your default project:

```bash
npx hardhat test
```

You can specify the config file to test a specific project:

```bash
npx hardhat --config profile.config.ts test
```

A relatively full-on test suite can be run (after starting your local node with `npx hardhat node`) with:

```
./bin/local_profile_smoke.sh
```

## Orientation

This will give you a list of available commands in your default project (recall you can also specify `--config [profile|invite].config.ts` to select a particular project):

```bash
npx hardhat
```

Some selected commands:

- `account:balance` Prints an account balance
- `account:nfts` Gets the NFTs for an account (via Alchemy)
- `accounts:list` Prints the list of accounts
- `invite:award` Mint an invite for an account
- `invite:image` Print the image URL for an invitation
- `invite:maximum` Return maximum number of invites
- `invite:metadata` Display the metadata for an invitation
- `invite:next` Return ID of next invite that will be awarded
- `invite:owner` Return owner of an invite
- `invite:premint` Store the reserved invitation (#0000) asset

Start the local hardhat chain in another terminal: `npx hardhat node`

See the accounts registered in `invite.secret.ts`: `npx hardhat accounts:list`

See the balance in an account: `npx hardhat account:balance --account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

## Wallet Accounts

There are two named wallet accounts in `invite.secret.ts` (retrieve this or `profile.secret.ts` from secret storage):

- `owner` -- the wallet that deploys and owns the smart contract.
- `operator` -- the wallet that awards invitations (ie, "operates" the smart contract).

## Local Workflow

With the local node running (`npx hardhat node`), try to get some invitation information:

- `npx hardhat invite:maximum`
- `npx hardhat invite:next`

These calls will **fail** because the contract hasn't been deployed.

### Deployment

```bash
npx hardhat invite:deploy
```

Now these calls work:

- `npx hardhat invite:maximum`
- `npx hardhat invite:next`

### Award an Invite

Note: requires that you've updated `invite.secret.ts` with the new address (see "Deployment", above).

`npx hardhat invite:award --account 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

### Inspect the Invite

- `npx hardhat invite:owner --invite 1`
- `npx hardhat invite:metadata --invite 1`
- `npx hardhat invite:image --invite 1`

### Deploying to Remote Chains

`npx hardhat run scripts/deploy.js --network <network-name>`

Where `<network-name>` is `goerli`, `mainnet`, etc.

### Destroy the Contract

`npx hardhat contract:destroy --account operator` will destroy the contract (remember to specify `--network` too).

### Deployments from Different Branches

When you deploy from different branches, particularly where you have
changed an interface, `hardhat` will not regenerate the typechain
connecting TypeScript to Solidity. To do it manually:

```bash
rm -rf typechain*
npx hardhat clean
npx hardhat compile
```
