import { useEffect, useState } from "react";

import { redirect } from "@remix-run/cloudflare";

import Countdown from "react-countdown";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import blankCard from "~/assets/blankcard.png";

// @ts-ignore
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const invite = url.searchParams.get("invite");
  const address = url.searchParams.get("address");
  const signature = url.searchParams.get("signature");

  if (!address) {
    return redirect(`/?${invite ? `?invite=${invite}` : ""}`);
  }

  //@ts-ignore
  const reservation = await RESERVE.get("reservation", { type: "json" });
  if (!reservation || reservation.address == address) {
    return redirect(
      `/mint/redeem?address=${address}&signature=${signature}${
        invite ? `&invite=${invite}` : ""
      }`
    );
  }

  return null;
};

export default function Queue() {
  const [expired, setExpired] = useState(false);

  const reserveTimerRender = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      setExpired(true);
      return;
    }
    return (
      <Text
        size={TextSize.LG}
        weight={TextWeight.Regular400}
        color={expired ? TextColor.White : TextColor.Gray700}
      >
        {expired
          ? "Refresh"
          : `Try again in:${" "}
            ${minutes < 10 ? `0${minutes}` : minutes}:
            ${seconds < 10 ? `0${seconds}` : seconds}`}
      </Text>
    );
  };

  return (
    <div className="mx-auto text-center">
      <div className="row d-flex align-self-center">
        <div className="col-12 mx-auto text-center mb-2">
          <Text
            className="text-center"
            size={TextSize.XL3}
            weight={TextWeight.SemiBold600}
          >
            You're in the queue! ⏳
          </Text>
        </div>
      </div>

      <div className="row d-flex align-self-center">
        <div className="col-12 mx-auto text-center">
          <Text
            className="text-center"
            size={TextSize.XL}
            weight={TextWeight.Regular400}
          >
            Someone else is minting the next card.
          </Text>
        </div>
      </div>

      <div
        style={{
          marginTop: "1em",
          marginBottom: "1em",
          minHeight: 358,
        }}
      >
        <div className="mx-auto text-center">
          <img
            className="w-full px-4"
            style={{ maxWidth: "28em" }}
            src={blankCard}
          />
        </div>
      </div>

      <div className="row d-flex align-self-center">
        <div className="col-12 mx-auto text-center">
          <button
            className="py-4 px-6 text-white"
            style={{
              backgroundColor: !expired ? "#ccc" : "#1f2937",
            }}
            disabled={!expired}
            onClick={() => window.location.reload()}
          >
            <Countdown
              date={Date.now() + 15000}
              renderer={reserveTimerRender}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
