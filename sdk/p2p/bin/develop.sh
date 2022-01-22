#!/bin/bash
#
# p2p/bin/develop.sh

pushd .
cd ..
npx shadow-cljs compile p2p
popd || exit
chmod +x index.js
