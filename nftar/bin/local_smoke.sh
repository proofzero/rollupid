#!/usr/bin/env bash
set -ex

echo "Testing with development bearer:"
curl localhost:3000/api?skipImage=true -s -H 'Accept: application/json' -H 'Content-type: application/json' -X POST -d '{"jsonrpc": "2.0", "id": 1, "method": "3id_genPFP", "params": { "blockchain": { "name": "ethereum", "chainId": 1}, "account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52" }}' -H 'Authorization: Bearer GET_DEV_KEY_FROM_1PASS' | jq

echo "Testing with staging bearer (expect duplicate PFP failure):"
curl localhost:3000/api -s -H 'Accept: application/json' -H 'Content-type: application/json' -X POST -d '{"jsonrpc": "2.0", "id": 1, "method": "3id_genPFP", "params": { "blockchain": { "name": "ethereum", "chainId": 1}, "account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52" }}' -H 'Authorization: Bearer GET_STAGE_KEY_FROM_1PASS' | jq
