#!/usr/bin/env bash
set -ex

echo "Testing with development bearer:"
curl localhost:3000/api?skipImage=false -s -H 'Accept: application/json' -H 'Content-type: application/json' -X POST -d '{"jsonrpc": "2.0", "id": 1, "method": "3id_genPFP", "params": { "blockchain": { "name": "ethereum", "chainId": 1}, "account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52" }}' -H 'Authorization: Bearer N3BDUWZmVVJBazZLdDlnb1VNOE1INGY2Y0Q0dWJQcnBhOW9tZURwOUt5M0dEaThhRHpHek1aWlZUVHpZaUppZHRtcFU3RjhDdzJWSmRwTHp0OXM2ZnBCcm5iR1R0dHhSQmpwWgo=' | jq

echo "Testing with staging bearer (expect duplicate PFP failure):"
curl localhost:3000/api -s -H 'Accept: application/json' -H 'Content-type: application/json' -X POST -d '{"jsonrpc": "2.0", "id": 1, "method": "3id_genPFP", "params": { "blockchain": { "name": "ethereum", "chainId": 1}, "account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52" }}' -H 'Authorization: Bearer AAABAItp+ggoBM6s8lQTAMQbLT1iXjYsImidnm788BPinZz08g==' | jq
