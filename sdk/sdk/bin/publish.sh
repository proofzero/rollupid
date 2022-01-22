#!/bin/bash
#
# sdk/bin/publish.sh

# Build release version for JavaScript; this is an npm package
# containing compiled JavaScript.
bin/release-js.sh

# Build release version for ClojureScript; this is a JAR file containing
# *only* uncompiled CLJS source code that can be published with any
# Maven-compatible tool.
bin/release-cljs.sh

# Publish to GitHub (configured in .npmrc)
npm publish
