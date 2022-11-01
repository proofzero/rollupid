import { useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/cloudflare";

import Confetti from "react-confetti";
import { useWindowWidth, useWindowHeight } from "@react-hook/window-size";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord, faTwitter } from "@fortawesome/free-brands-svg-icons";

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import Spinner from "~/components/spinner";

import openSeaLogo from "~/assets/opensea.svg";

// @ts-ignore
// export const loader = async ({ request }) => {

// }

// @ts-ignore
export const action = async ({ request }) => {
  // get tweet url from link
  const form = await request.formData();
  const address = form.get("address");
  const hash = form.get("hash");
  const invite = form.get("invite");
  const voucher = form.get("voucher");
  const embed = form.get("embed");

  if (!address || !hash || !embed || !voucher) {
    return redirect("/");
  }

  //@ts-ignore
  await RESERVE.delete("reservation"); // clear the reservation

  if (invite) {
    // no need to check response, if it fails, it fails because invite is invalid
    //@ts-ignore
    OORT.fetch(`http://127.0.0.1/invite/submit/${invite}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: address, hash: hash }),
    });
  }

  return json({
    address,
    hash,
    invite,
    voucher: JSON.parse(voucher),
    embed: JSON.parse(embed),
  });
};

export default function Success() {
  const data = useActionData();

  console.log("data", data);

  if (!data && typeof window !== "undefined") {
    window.location.href = "/";
    return <Spinner />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        className="text-center"
        size={TextSize.XL3}
        weight={TextWeight.SemiBold600}
      >
        Congratulations! 🥳
      </Text>

      <div
        style={{
          marginTop: "-2em",
          marginBottom: "0em",
          minHeight: 358,
        }}
      >
        <div className="mx-auto text-center">
          <img
            className="w-full"
            style={{ maxWidth: "28em" }}
            src={data?.embed.image}
          />
        </div>
      </div>

      <div
        className="text-center"
        style={{
          padding: "2em",
          marginTop: "-2em",
        }}
      >
        <Text
          className="text-center"
          size={TextSize.XL}
          weight={TextWeight.Regular400}
        >
          We've successfully minted your invite.
        </Text>
        <a
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "0.75em 2.5em",
            textDecoration: "none",
            fontSize: "1.25em",
            marginBottom: "0.5em",
          }}
          className="action-button"
          href="https://3id.kubelt.com"
        >
          Claim your 3ID!
        </a>
        <div>
          <a
            className="action-button col-12 mx-auto"
            style={{
              fontSize: "1.25em",
              color: "#4b5563",
              padding: "0.75em 2.5em",
              marginBottom: "0.5em",
              backgroundColor: "#F3F4F6",
            }}
            target="_blank"
            href={`https://twitter.com/intent/tweet?text=Just minted my @threeid_xyz invite! 🚀 https://opensea.io/assets/ethereum/0x92ce069c08e39bca867d45d2bdc4ebe94e28321a/${parseInt(
              data?.voucher?.tokenId
            )}%C2%A0 %23web3%C2%A0 %23NFT %23DID`}
          >
            <FontAwesomeIcon style={{ color: "#1DA1F2" }} icon={faTwitter} />{" "}
            Share on Twitter
          </a>
        </div>
        <div>
          <a
            target="_blank"
            className="col-12 mx-auto action-button"
            href="https://opensea.io/collection/3id-invite"
            style={{
              fontSize: "1.25em",
              color: "#4b5563",
              padding: "0.75em 2.5em",
              backgroundColor: "#F3F4F6",
            }}
          >
            <img style={{ height: "1.25em" }} src={openSeaLogo} /> View on
            OpenSea
          </a>
        </div>
        <div style={{ marginTop: "1em" }}>
          <a
            href={`https://etherscan.io/tx/${data?.hash}`}
            style={{ textDecoration: "underline" }}
          >
            View on: Etherscan
          </a>
        </div>
        <Confetti width={useWindowWidth()} height={useWindowHeight()} />
      </div>
    </div>
  );
}
