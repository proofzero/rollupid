3ID Public Profiles help you customize your application for your users with one API call.

Simply look up a unique account resolver ([see below](#resolvers)) and onboard your users into a personalized experience, with their familiar display name, profile picture, cover photo, bio, and more.

## Getting Started

To get a user's public profile make an HTTP API call to `https://my.rollup.id/<resolver>/json`, where `<resolver>` is a unique account identifier (e.g. an Ethereum address).

### Resolvers

Resolvers uniquely identify accounts (e.g., an Ethereum address or Google Account). All resolvers for the same person link to the same 3ID Public Profile, so a user signing in with a crypto wallet or logging with their Google Account has the same account data.

Here is the current list of resolvers. [Join our Discord](https://discord.gg/UgwAsJf6C5) to tell us which resolvers you want.

| Resolver       | Description                 | Example                                    | Status  |
| -------------- | --------------------------- | ------------------------------------------ | ------- |
| Ethereum       | Ethereum account addresses  | 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52 | Live    |
| ENS            | ENS domain names            | alfl.eth                                   | Live    |
| Google Account | Classic OAuth2 Google Login | alex.flanagan@gmail.com                    | On Deck |

## Making a Request

If you visit a profile link in a browser (e.g., [https://my.rollup.id/0x68dc0Ee494FF6546C2547409F89C2cf097EE4722)](https://my.rollup.id/0x68dc0Ee494FF6546C2547409F89C2cf097EE4722) you can see our own rendering of profile data. If you append `/json` to that URL you can query the same API directly:

```bash
curl https://my.rollup.id/0x68dc0Ee494FF6546C2547409F89C2cf097EE4722/json
```

Or, for example, with Javascript `fetch`:

```javascript
fetch('https://my.rollup.id/0x68dc0Ee494FF6546C2547409F89C2cf097EE4722/json')
  .then((p) => p.json())
  .then((profile) => {
    console.log('User-set display name:', profile.displayName)
    console.log('URL for user-set PFP: ', profile.pfp.image)
    console.log('URL for user-set cover photo: ', profile.cover)
    console.log('Where the user says they are:', profile.location)
    console.log('What the user says their job is:', profile.job)
    console.log('User-specified biography text (256 characters):', profile.bio)
    console.log('User-specified website URL:', profile.website)
    console.log('If a user has claimed this profile:', profile.claimed)
  })
```

## 3ID Profile Response

If you feed the above `curl` through a tool like `jq`, for example with `curl https://my.rollup.id/0x68dc0Ee494FF6546C2547409F89C2cf097EE4722/json -s | jq`, you get the profile JSON object:

```json
{
  "displayName": "Polynomics",
  "pfp": {
    "image": "https://nftstorage.link/ipfs/bafybeiagnu4c32iqr2frinkoiwngzdkk24f4b2ivdwvqldfxnqfhpepdty/threeid.png"
  },
  "cover": "https://nftstorage.link/ipfs/bafybeid6dvlznmbv3wnuclmpgdxfkyzea65yve2gpjebj2eamlb2bifsoq/cover.png",
  "location": "Metaverse",
  "job": "Innovator",
  "bio": "Polynomics comes from the concepts of \"polyphonic\" sound and \"nomic\" games (see: https://en.wikipedia.org/wiki/Nomic), meaning something like \"many games with negotiable rules\".",
  "website": "https://kubelt.com",
  "claimed": true
}
```

| Profile Field | Description                                             |
| ------------- | ------------------------------------------------------- |
| displayName   | The user's preferred display name.                      |
| pfp.image     | The URL for the user's selected (optionally NFT) PFP.   |
| cover         | The URL for the user's cover photo (optionally an NFT). |
| location      | Text description of the user's location.                |
| job           | Text description of the user's job.                     |
| bio           | Longer text (256 characters) of the user's bio.         |
| website       | User-specified URL for their website.                   |
| claimed       | JSON boolean indicating whether the profile is claimed. |

## Custom User Data

Using 3ID means you don't have to worry about storing user data -- your users can store it themselves!

In order to store your own custom application data within a user's 3ID profile you will need to use a custom application namespace as well as our new encrypted storage RPC methods. [Join our Discord](https://discord.gg/UgwAsJf6C5) to talk to us about your use case and get beta access.
