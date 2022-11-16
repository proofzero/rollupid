# Gitbook

These are the docs for our docs. This should not be visible in the public docs.

## Happy Path

* Edit plaintext markdown files in this directory.
* Add links to your docs to `CONTENT.md` to make them visible. They must be
  added exactly once (i.e. paths must be unique).
* Merging to the `main` branch will deploy documentation to production.

## Important Notes

It is possible to edit docs visually in Gitbook. If you do this it can rewrite
paths and remove comments. Please avoid.

`../.gitbook.yaml` defines what we're publishing (e.g. this `/docs` directory).

* [See the Gitbook config docs](https://docs.gitbook.com/getting-started/git-sync/content-configuration#.gitbook.yaml-2) for more info.

## Architecture

We have a couple of legacy documentation systems that you might encounter while
hacking on docks.
