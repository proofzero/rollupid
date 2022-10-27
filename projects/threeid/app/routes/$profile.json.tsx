import { LoaderFunction, json } from "@remix-run/cloudflare";
import { GraphQLClient } from "graphql-request";
import {
  fetchVoucher,
  getCachedVoucher,
  putCachedVoucher,
} from "~/helpers/voucher";
import { getSdk, Visibility } from "~/utils/galaxy.server";
import { getUserSession, requireJWT } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.profile) {
    throw new Error("Profile address required");
  }

  const gqlClient = new GraphQLClient("http://127.0.0.1:8787", {
    fetch,
  });

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfileFromAddress({
    address: params.profile,
  });

  // Core wasn't claimed
  // TOOD: This needs to be realigned with funnel
  // if (true) {
  //   let voucher = await getCachedVoucher(params.profile);
  //   if (!voucher) {
  //     voucher = { "metadata": { "name": "3ID PFP: GEN 0", "description": "3ID PFP for 0x6c60Da9471181Aa54C648c6e201263A5501363F3", "external_url": "https://dapp.threeid.xyz/0x6c60Da9471181Aa54C648c6e201263A5501363F3", "properties": { "metadata": { "name": "ethereum", "chainId": "1", "account": "0x6c60Da9471181Aa54C648c6e201263A5501363F3" }, "traits": { "trait0": { "type": "GEN", "value": { "name": "Mint Green (V0)", "rgb": { "r": 162, "g": 236, "b": 142 }, "rnd": [0.38780612106668766, 0.017285907103053333, 0.5897744827977653, 0.6094869443053592, 0.24573578875547342, 0.6920127960771449] } }, "trait1": { "type": "RARE", "value": { "name": "Blue", "rgb": { "r": 30, "g": 165, "b": 252 }, "rnd": [0.2030785960159347, 0.9656916213805631, 0.27033776137952814, 0.42469118476513223, 0.33409172112312, 0.2809351081173701] } }, "trait2": { "type": "UNCOMMON", "value": { "name": "Sea Foam Green", "rgb": { "r": 207, "g": 241, "b": 214 }, "rnd": [0.832312676819446, 0.048161461333016575, 0.5221457914104424, 0.19520279393984308, 0.4875331859169909, 0.4253653445388048] } }, "trait3": { "type": "COMMON", "value": { "name": "Cocoa", "rgb": { "r": 139, "g": 125, "b": 125 }, "rnd": [0.6543038746644547, 0.39160307456899024, 0.11796866261872507, 0.20431987114235461, 0.8318177454919742, 0.3978469992970446] } } }, "GEN": "Mint Green (V0)", "Priority": "Blue", "Friend": "Sea Foam Green", "Points": "Cocoa" }, "image": "https://nftstorage.link/ipfs/bafybeieglac4mpg4xnhrbw6yyo5z5vvf3fi4gyrpfbmt3g4lqvmqgk2q7a/threeid.png", "cover": "ipfs://bafybeifwdmb4rgq53keuywfr6f3mpf7s7zggwe3vtntgfuigshjtpy5acu/cover.png" }, "voucher": { "recipient": "0x6c60Da9471181Aa54C648c6e201263A5501363F3", "uri": "ipfs://bafyreicchcpxns2djnflhtlfcepnto5hydbabsg6yxjh2gati6fd6xgox4/metadata.json", "signature": "0xa8f26e9b4d59f631e4b2a0e1825873af9314c00855d423308ea9c9b04056ec173215961631a80ae2fc0c890cf5c208adc2b54469edc6da0d77b22cbcbc4333bf1c" }, "signature": { "message": "0x5ea83a0bcc09a96e91ee925467b89d344d2bcee07239f86eb1215e87a79bbef0", "messageHash": "0x713964397904f01b9376e0275b56193773ae189f801473146508fd44ac364030", "v": "0x1c", "r": "0xa8f26e9b4d59f631e4b2a0e1825873af9314c00855d423308ea9c9b04056ec17", "s": "0x3215961631a80ae2fc0c890cf5c208adc2b54469edc6da0d77b22cbcbc4333bf", "signature": "0xa8f26e9b4d59f631e4b2a0e1825873af9314c00855d423308ea9c9b04056ec173215961631a80ae2fc0c890cf5c208adc2b54469edc6da0d77b22cbcbc4333bf1c" }, "contractAddress": "0x3ebfaFE60F3Ac34f476B2f696Fc2779ff1B03193" };
  //     voucher = await fetchVoucher({
  //       address: params.profile,
  //       skipImage: !!voucher,
  //     });
  //     voucher = await putCachedVoucher(params.profile, voucher);
  //   }

  //   const prof = profileRes.profileFromAddress;

  //   // const session = await getUserSession(request);
  //   // const address = session.get("address");
  //   // const jwt = session.get("jwt");

  // //   await gqlClient.request(
  // //     `mutation ($profile: ThreeIDProfileInput, $visibility: Visibility!) {
  // //   updateThreeIDProfile(profile: $profile, visibility: $visibility)
  // // }`,
  // //     {
  // //       profile: {
  // //         id: address, // TODO: Figure out what's up with ID
  // //         displayName: prof?.displayName,
  // //         bio: prof?.bio,
  // //         job: prof?.job,
  // //         location: prof?.location,
  // //         website: prof?.website,
  // //         avatar: voucher.metadata.image,
  // //         cover: voucher.metadata.cover,
  // //         isToken: true

  // //       },
  // //       visibility: Visibility.Public,
  // //     },
  // //     {
  // //       "KBT-Access-JWT-Assertion": jwt,
  // //     }
  // //   );

  //   return json({
  //     ...prof,
  //     avatar: voucher.metadata.image,
  //     cover: voucher.metadata.cover,
  //     isToken: false,
  //     claimed: false,
  //   });
  // }

  return json({
    ...profileRes.profileFromAddress,
    claimed: true,
  });
};
