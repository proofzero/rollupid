import { redirect, json } from "@remix-run/cloudflare";
import { requireJWT } from "~/utils/session.server";

import BaseButton, {
  links as buttonLinks,
  BaseButtonAnchor,
} from "~/components/base-button";

import sad from "../../../assets/sad.png";

export const links = () => [...buttonLinks()];

// Fetch the nonce for address
// @ts-ignore
export const loader = async ({ request }) => {
  await requireJWT(request);
  return null;
};

export default function AuthGate() {
  return (
    <div className="gate justify-center items-center">
      <img className="m-auto pb-12" src={sad} />
      <p className="auth-message">Oh no!</p>
      <p className="auth-secondary-message">
        We couldn't validate a proof for your account.
      </p>
      <div className="error-buttons grid grid-rows-2 lg:grid-cols-2">
        <BaseButtonAnchor
          color={"dark"}
          text={"Create a Proof"}
          href={"https://proof.kubelt.com"}
        />
        <BaseButtonAnchor
          text={"Join Discord"}
          color={"light"}
          href={"https://discord.gg/threeid"}
        />
      </div>
    </div>
  );
}
