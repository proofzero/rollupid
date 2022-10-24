# Oort

## environment

### nvm

If you use [nvm](https://github.com/creationix/nvm/) to manage your local node
versions, you can set up the supported version by running:

```shell
$ nvm use
```

Otherwise, please install the version of node indicated in `.nvmrc` using your
preferred method.

## .env

You will need to define a set of environment variables for features that require
external configuration. You can start by setting the variables you need listed
in `.env.example` file.

`.env.defaults` file will be used as a fallback.

## dependencies

You can install dependencies by package manager of your choice. The package
version lock is maintained for `npm`.

### exact versions

You can configure your `npm` client to set exact versions in the dependencies.

```shell
npm config set save-exact true
```

## runtime

All runtime requirements are listed in the dependencies. You can use executables
via `npx`.

### miniflare

[miniflare](https://miniflare.dev/) is initially preferred for running the
worker on the localhost and testing environments.

There are some caveats and missing feature capability when running on this
environment. Running and testing against `wrangler dev` is _recommended_.

Use `dev:miniflare` script to start the process.

### wrangler

[Wrangler](https://developers.cloudflare.com/workers/wrangler/) is command-line
interface for Cloudflare Workers.

The configuration file `wrangler.toml` is almost generic. You can login to
multiple Cloudflare accounts and use the same file to deploy different accounts
if needed. The only part depending on the account are KV namespace identifiers.

Use `dev:wrangler` script to start the process.

You can use [`devtools`](https://built-devtools.pages.dev/js_app) and start a
local server.

## KV Setup

To start developing you need to make two KV stores (you may first need to `wrangler login`):

```bash
wrangler kv:namespace create CORE_CLAIMS --preview
wrangler kv:namespace create CORE_CLAIMS
wrangler kv:namespace create THREEID --preview
wrangler kv:namespace create THREEID
```

Then put the `id` and `preview_id` values that these commands yield into your `wrangler.toml` under the `env.dev` section.

## development

There are some helpful scripts for development.

- `all:check`: executes various checking tasks
- `test`: executes the test suite

You can confirm that your changes do not fail existing workflow checks by using
these scripts.

## features

### core claims

The core claims are presets defined in KV store bound to name `CORE_CLAIMS`. It
is essentially a key-value mapping of account addresses to a list of strings.

```shell
wrangler kv:key put --env devnet --binding CORE_CLAIMS $ACCOUNT_ADDRESS '["$CLAIM_NAME"]'
```

`kv:key put` command overwrites the value. You need to make sure existing claims
are retained if you only need to add a new claim.

Note: `miniflare` doesn't have KV CLI. You would need to use KV API within the
worker.
