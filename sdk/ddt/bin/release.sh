#!/bin/bash
#
# ddt/bin/release.sh

pushd .
cd ..
npx shadow-cljs release cli
popd || exit
chmod +x index.js
