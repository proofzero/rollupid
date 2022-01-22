#!/bin/bash -e
#
# sdk/bin/release-cljs.sh
#
# Read the parent deps.edn and from it determine what to bundle into the
# generated ClojureScript JAR file.

# TODO jar signing
# TODO include JAR version in filename

# Wherever you go, there you are.
bin_dir="$( dirname "${BASH_SOURCE[0]}" )"
cd "${bin_dir}"

deps_file="../../deps.edn"
jar_file="../kubelt-sdk.jar"

shadow_edn="../../shadow-cljs.edn"
cat $shadow_edn

#clojure -M -m uberdeps.uberjar --deps-file "${deps_file}" --target "${jar_file}"
