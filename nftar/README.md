# NFTAR

NFTar is a simple API for generating mathematically unique mesh gradients. Every gradient is generated using your blockchain account data to generate traits.

## Version 1 (Current)

![](https://nftstorage.link/ipfs/bafybeic4m7ch3yt7lyov64qgrh7ekxhloli3o5n3gdk6kp3ugd2mi3yxsi/threeid.png)

This version selects 3 traits from a pool of common, uncommon, rare, and epic traits. 

![image](https://user-images.githubusercontent.com/695698/184196638-9c71a24a-84ae-4aee-9a72-c77b3d32406d.png)

Each trait is given a weight that increases based on what NFTs your ETH account holds from the top 10 most popular collections and our communities collections.

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

Copy the `.env.example` file and complete the fields.

To run the the NFTAR API you need run `npm start` in the root of the project.

## API

### Example

The following example uses an RPC CLI tool called [rpcit](https://github.com/jnordberg/rpcit).

rpcit -a http://localhost:3000/api 3iD_getNFT account=0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786 blockchain=:'{"name": "ethereum", "chainId": 5}'


#### RPC Request
```
rpcit -a http://localhost:3000/api 3iD_genPFP account=0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786 blockchain=:'{"name": "ethereum", "chainId": 5}'
```

#### RPC Response
```
[
  {
    metadata: {
      name: '3iD',
      description: '3iD PFP for 0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
      properties: {
        account: '0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
        blockchain: { name: 'ethereum', chainId: 5 },
        traits: {
          trait0: {
            type: 'GEN',
            value: {
              name: 'Mint Green (V0)',
              rgb: { r: 45, g: 74, b: 277 },
              rnd: [
                0.6839646344186752,
                0.9816427313767162,
                0.8362551342002387,
                0.889709092028725,
                0.43194322067738944,
                0.3757648381332803
              ]
            }
          },
          trait1: {
            type: 'COMMON',
            value: {
              name: 'Mist Blue',
              rgb: { r: 167, g: 171, b: 153 },
              rnd: [
                0.1678173711258666,
                0.23602288527729387,
                0.7062634985492098,
                0.20426246380633484,
                0.44732248132070795,
                0.037126339637420847
              ]
            }
          },
          trait2: {
            type: 'COMMON',
            value: {
              name: 'Antique White',
              rgb: { r: 205, g: 169, b: 134 },
              rnd: [
                0.5580762577529659,
                0.7136873239278188,
                0.2887867025707709,
                0.581447174540002,
                0.23464404099942215,
                0.5895519545968924
              ]
            }
          },
          trait3: {
            type: 'RARE',
            value: {
              name: 'Lemon Cream',
              rgb: { r: 255, g: 231, b: 109 },
              rnd: [
                0.36088990728298875,
                0.8750632007357138,
                0.5945034196308681,
                0.9789451969143039,
                0.8277965417493025,
                0.9791974815796414
              ]
            }
          }
        }
      },
      image: 'ipfs://bafybeic4m7ch3yt7lyov64qgrh7ekxhloli3o5n3gdk6kp3ugd2mi3yxsi/threeid.png'
    },
    voucher: {
      account: '0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
      tokenURI: 'ipfs://bafyreieip223d2qokpcvsueojowpcb5blf2fc5w5qeke6m4pu5ncaokl24/metadata.json'
    },
    signature: {
      message: '{"account":"0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786","tokenURI":"ipfs://bafyreieip223d2qokpcvsueojowpcb5blf2fc5w5qeke6m4pu5ncaokl24/metadata.json"}',
      messageHash: '0xf96b3585194d0a2903c1c8a04aa8a2b63e5543ba0edfc6c30de0dbf4be6fdd7e',
      v: '0x1c',
      r: '0xc471b6b566708849091e929cee19e782e4ea6141fc06784eee197c666835018d',
      s: '0x2ff216c80de672627957a02c2a08f33849e693de7c7975d8e8f84e7a97f319e4',
      signature: '0xc471b6b566708849091e929cee19e782e4ea6141fc06784eee197c666835018d2ff216c80de672627957a02c2a08f33849e693de7c7975d8e8f84e7a97f319e41c'
    }
  },
  {
    metadata: {
      name: '3iD',
      description: '3iD PFP for 0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
      properties: {
        account: '0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
        blockchain: { name: 'ethereum', chainId: 5 },
        traits: {
          trait0: {
            type: 'GEN',
            value: {
              name: 'Mint Green (V0)',
              rgb: { r: 45, g: 74, b: 277 },
              rnd: [
                0.6839646344186752,
                0.9816427313767162,
                0.8362551342002387,
                0.889709092028725,
                0.43194322067738944,
                0.3757648381332803
              ]
            }
          },
          trait1: {
            type: 'COMMON',
            value: {
              name: 'Mist Blue',
              rgb: { r: 167, g: 171, b: 153 },
              rnd: [
                0.1678173711258666,
                0.23602288527729387,
                0.7062634985492098,
                0.20426246380633484,
                0.44732248132070795,
                0.037126339637420847
              ]
            }
          },
          trait2: {
            type: 'COMMON',
            value: {
              name: 'Antique White',
              rgb: { r: 205, g: 169, b: 134 },
              rnd: [
                0.5580762577529659,
                0.7136873239278188,
                0.2887867025707709,
                0.581447174540002,
                0.23464404099942215,
                0.5895519545968924
              ]
            }
          },
          trait3: {
            type: 'RARE',
            value: {
              name: 'Lemon Cream',
              rgb: { r: 255, g: 231, b: 109 },
              rnd: [
                0.36088990728298875,
                0.8750632007357138,
                0.5945034196308681,
                0.9789451969143039,
                0.8277965417493025,
                0.9791974815796414
              ]
            }
          }
        }
      },
      image: 'ipfs://bafybeic4m7ch3yt7lyov64qgrh7ekxhloli3o5n3gdk6kp3ugd2mi3yxsi/threeid.png'
    },
    voucher: {
      account: '0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786',
      tokenURI: 'ipfs://bafyreieip223d2qokpcvsueojowpcb5blf2fc5w5qeke6m4pu5ncaokl24/metadata.json'
    },
    signature: {
      message: '{"account":"0xd3C1D6adB70d95e51ECE01Ad5614bE8175C05786","tokenURI":"ipfs://bafyreieip223d2qokpcvsueojowpcb5blf2fc5w5qeke6m4pu5ncaokl24/metadata.json"}',
      messageHash: '0xf96b3585194d0a2903c1c8a04aa8a2b63e5543ba0edfc6c30de0dbf4be6fdd7e',
      v: '0x1c',
      r: '0xc471b6b566708849091e929cee19e782e4ea6141fc06784eee197c666835018d',
      s: '0x2ff216c80de672627957a02c2a08f33849e693de7c7975d8e8f84e7a97f319e4',
      signature: '0xc471b6b566708849091e929cee19e782e4ea6141fc06784eee197c666835018d2ff216c80de672627957a02c2a08f33849e693de7c7975d8e8f84e7a97f319e41c'
    }
  }
]
```