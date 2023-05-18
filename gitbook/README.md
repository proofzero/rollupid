# Gitbook

These are the docs for our docs. This should not be visible in the public docs.

## Happy Path

**tl;dr** GitHub, not GitBook, is the source of truth. Commit there.

- Edit plaintext markdown files in this directory.
- Add links to your docs to `CONTENT.md` to make them visible. They must be
  added exactly once (i.e. paths must be unique).
- Merging to the `main` branch will deploy documentation to production.

## Important Notes

It is possible to edit docs visually in Gitbook. If you do this it can rewrite
paths and remove comments, and you can't sign the commits. Please avoid.

`../.gitbook.yaml` defines what we're publishing (e.g. this `/docs` directory).

- [See the Gitbook config docs](https://docs.gitbook.com/getting-started/git-sync/content-configuration#.gitbook.yaml-2) for more info.

## Architecture

We have a couple of legacy documentation systems that you might encounter while
hacking on docs.

### Cloudflare Pages

Cloudflare Pages were used to publish the Hugo docs. The Cloudflare Pages app
had access to the `rollupid/rollupid` repo in GitHub. That access has been removed
but the app has been left in place because it deploys `redeem` to production.

### Cloudflare Page Rules

Cloudflare Page Rules does a `301 redirect` for old URLs to the new site.

Specifically: `*.developers.rollup.id/*` -> `https://docs.rollup.id/$2`

### Webflow

Webflow does a `301 redirect` for `/docs` subpaths to GitBook:

- `rollup.id/docs` -> `https://docs.rollup.id`
- `rollup.id/docs` -> `https://docs.rollup.id`

### GitBook Custom Domains

**tl;dr** Current config points everything to https://docs.rollup.id.

GitBook Custom Domains are configured in Cloudflare DNS for `rollup.id` and
`rollup.id`. Both include `CNAME` records pointing `docs` to GitBook. Both
also include `CAA` records allowing Google to issue certification for the `docs`
subdomain.

- docs.rollup.id (organization domain -- see below)
- docs.rollup.id (space domain -- see below)

GitBook allows creation of domains at three levels: organization, collection,
and space. Space settings override collection settings override organization
settings. [See the GitBook Custom Domains docs](https://docs.gitbook.com/advanced-guides/custom-domain/location) for more info.

- Organization domains look like this: `customdomain/space`.
- Collection domains look like this: `customdomain/v/space`.
- Space domains look like this: `customdomain`.

Because of these overrides and the above configuration, currently Rollup is the
default space and all docs are redirected to `https://docs.rollup.id`.

### Workflow

Merging a PR to `main` will publish live to `https://docs.rollup.id`.
