#!/bin/bash
#
# ddt/bin/publish.sh

# Build release version
bin/release.sh
# Publish to GitHub (configured in .npmrc)
npm publish
