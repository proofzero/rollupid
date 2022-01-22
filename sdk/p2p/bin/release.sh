#!/bin/bash
#
# p2p/bin/release.sh

pushd .
cd ..
npx shadow-cljs release p2p
popd || exit
chmod +x index.js
