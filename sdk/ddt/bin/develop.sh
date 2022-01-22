#!/bin/bash
#
# ddt/bin/develop.sh

pushd .
cd ..
npx shadow-cljs compile cli
popd || exit
chmod +x index.js
