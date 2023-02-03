# Contribution guide

## Documentation Standards

When you create a draft or PR intended to land to `main` an action will render the documentation in `/docs`. This allows you and reviewers to check that your changes are properly captured in the documentation portal.

Documentation landed to `main` will publish to `https://docs.rollup.id`.

## Environment variables and secrets naming conventions

Environment variables and secret names should follow the naming convention below. This convention is used to set the values for secrets and internal values in GitHub Actions secrets as well as for referencing the same from within Github Action pipelines. The same convention is to be followed for local development by setting the respective dev values in .dev environment files (for secret vars( or wrangler.toml files (for non-secret env vars). See .dev.examples files in each project folder, for samples of vars that need to be set to run a particular project/app.

Convention: `(type)_(name of service/system)_(optional qualifier)_(environment name)`

> Note: `(environment name)` should be used for environment-specific secrets in GitHub actions, both to set the value as well as to reference which secret to read off of, however, it should not be used in the name that the app or the tool running in the pipeline expects to be available as an env var, eg. app env var `APIKEY_APP` should be reading a secret from `secret.APIKEY_APP_DEV` by the Dev pipeline.

Types:
- `TOKEN`
- `PASSWORD`
- `APIKEY`
- `KEY`
- `INTERNAL` (generic non-secrets intended for internal use, eg. app IDs, contract addresses, non-static service URLs/endpoints, etc)
- `SECRET` (generic secrets not covered above, if any)
Note: Any public variables should go in the appropriate variable files, eg. wrangler.toml for workers, etc.

Examples:
- `APIKEY_ALCHEMY_PUBLIC_MAINNET`
- `INTERNAL_CLOUDFLARE_ACCOUNT_ID`
- `TOKEN_NFT_STORAGE_TESTNET`
- `INTERNAL_ALCHEMY_API_URL`
- `INTERNAL_ENS_CONTRACT_ADDRESS`

