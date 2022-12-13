# NFTAR

NFTar is a simple API for generating mathematically unique mesh gradients. Every gradient is generated using your blockchain account data to generate traits.

## Install

```bash
npm i
```

## Testing

Unit tests:

```bash
npm test
```

Test the container locally with:

```bash
docker build .
docker run -p 3000:3000 <tag from the previous command> &
./bin/local_smoke.sh
```

## Deployment

Deploying NFTar touches three things: this project, the smart contract secrets, and the GCP infra.

First, in this project run:

```bash
gcloud builds submit --project threeid-nftar
```

This will yield a Docker image tag.

**TODO:** Versioning of the secrets file can be improved. Be careful and ask for help if you need it.

Make sure you have [the latest `profile.secret.ts` file from 1Password](https://start.1password.com/open/i?a=ZJM7Z47Z3ZE6PBNEPK6MAP2YBA&v=kwywqdgenebhkdbycqestmjtry&i=vwzlndlo3cxcbtcajd77yr5udq&h=pz3r0.1password.com). Put the Docker image tag into `profile.secret.ts` in the `NFTAR` object and store it back into 1Password, overwriting `profile.secret`.

In the `kubelt/admin` project, deploy the `nftar` infra. This will pull the updated secrets from from 1Password and use it to deploy to Goerli and Mainnet.

### Version 0 (Current)

![](https://nftstorage.link/ipfs/bafybeic4m7ch3yt7lyov64qgrh7ekxhloli3o5n3gdk6kp3ugd2mi3yxsi/threeid.png)

This version selects 3 traits from a pool of common, uncommon, rare, and epic traits. 

![image](https://user-images.githubusercontent.com/695698/184196638-9c71a24a-84ae-4aee-9a72-c77b3d32406d.png)

Each trait is given a weight that increases based on what NFTs your ETH account holds from several popular collections and our community and partner collections (weights in the code are authoritative, but for illustration):

| Collection | Weight Increment (per token) |
| ---------- | -------- |
| BAYC | Epic + 2|
| Crypto Punks | Epic + 1 |
| MAYC | Rare + 3 |
| Moonbirds | Rare + 2|
| Clonex | Rare + 1 |
| Doodles | Uncommon + 4 |
| Azuki | Uncommon + 3 |
| Vee Friends | Uncommon + 2 |
| World of Women | Uncommon + 1|

## Getting Started

Copy the `.env.example` file and complete the fields. See the instructions for running using Docker, above.

## Secrets

[Get the relevant bearer tokens for calling the API from 1Password.](https://start.1password.com/open/i?a=ZJM7Z47Z3ZE6PBNEPK6MAP2YBA&v=rl5hub4kbg2ckl4bdneypwwufq&i=lsxbcyhkss5k4ha4w6gjr2h7yi&h=pz3r0.1password.com) Then use them in the examples below.

## API

Modified example based on `bin/local_smoke.sh`.

### Request

Assumes you're running the Docker container, as described above, on port 3000.

**NOTE:** you can pass a queryparam of `skipImage=true` in order to skip image generation and IPFS storage, which are expensive operations. For example, `curl localhost:3000/api?skipImage=true ...`.

```bash
curl localhost:3000/api -s -H 'Accept: application/json' -H 'Content-type: application/json' -X POST -d '{"jsonrpc": "2.0", "id": 1, "method": "3id_genPFP", "params": { "blockchain": { "name": "ethereum", "chainId": 1}, "account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52" }}' -H 'Authorization: Bearer <INSERT_DEV_OR_STAGING_API_KEY_FROM_1PASS>' | jq
```

### Response

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"metadata": {
			"name": "3ID PFP: GEN 0",
			"description": "3ID PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"external_url": "https://3id.kubekt.com/0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"properties": {
				"metadata": {
					"name": "ethereum",
					"chainId": 1,
					"account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52"
				},
				"traits": {
					"trait0": {
						"type": "GEN",
						"value": {
							"name": "Mint Green (V0)",
							"rgb": {
								"r": 162,
								"g": 236,
								"b": 142
							},
							"rnd": [0.26336541611662123, 0.6661020674326557, 0.9365762500915686, 0.41495587652834254, 0.7073433627043415, 0.8130954574036309]
						}
					},
					"trait1": {
						"type": "UNCOMMON",
						"value": {
							"name": "Mellow Yellow",
							"rgb": {
								"r": 247,
								"g": 246,
								"b": 175
							},
							"rnd": [0.5265241730831538, 0.08802548069378724, 0.7283429103963015, 0.07337292945294371, 0.1936895368449445, 0.6390931013861014]
						}
					},
					"trait2": {
						"type": "COMMON",
						"value": {
							"name": "Azure Blue",
							"rgb": {
								"r": 120,
								"g": 137,
								"b": 145
							},
							"rnd": [0.4797166477669974, 0.14818870869012524, 0.07429925172696383, 0.11125745371409046, 0.2879480453137402, 0.4627845453588748]
						}
					},
					"trait3": {
						"type": "UNCOMMON",
						"value": {
							"name": "Cerulian Blue",
							"rgb": {
								"r": 135,
								"g": 185,
								"b": 231
							},
							"rnd": [0.7216786776844673, 0.5401227793262857, 0.7881222941085408, 0.09917835653502194, 0.4823667611302245, 0.4950096740638428]
						}
					}
				},
				"GEN": "Mint Green (V0)",
				"Priority": "Mellow Yellow",
				"Friend": "Azure Blue",
				"Points": "Cerulian Blue"
			},
			"image": "ipfs://bafybeiafekzf43i4u3pmp3a63f2byuqjndozn2xkdbybhjo234vmxpfv4q/threeid.png",
			"cover": "ipfs://bafybeieeihxifn77ekcftmyqrpdz5iq6z4opgfndrsz3irilyi7crqflce/cover.png"
		},
		"voucher": {
			"recipient": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"uri": "ipfs://bafyreifr33ri53ynmep47qy3flo3zyhfho7hyr7ewgvu7jauvxs2dwtrum/metadata.json",
			"signature": "0xe26c10465327035ab803654f26d19f48ba5cafd46fed106026262daad96e5f7244ab1c437fd710ac2a736be471bfebca8adf61c986fdfc8861541d4b5bea5ecd1c"
		},
		"signature": {
			"message": "0xadd0be3db735cced8dd64d3ef2511911ede96450f8fbe512f2183ba8890a6e98",
			"messageHash": "0x16158e612f2fc0a6cd707aa6813ceca3b2f22686279af04a12e2bbffd8441abf",
			"v": "0x1c",
			"r": "0xe26c10465327035ab803654f26d19f48ba5cafd46fed106026262daad96e5f72",
			"s": "0x44ab1c437fd710ac2a736be471bfebca8adf61c986fdfc8861541d4b5bea5ecd",
			"signature": "0xe26c10465327035ab803654f26d19f48ba5cafd46fed106026262daad96e5f7244ab1c437fd710ac2a736be471bfebca8adf61c986fdfc8861541d4b5bea5ecd1c"
		}
	}
}
```
