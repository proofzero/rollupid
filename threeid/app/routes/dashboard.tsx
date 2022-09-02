import { json } from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import { Outlet } from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";

import { oortSend } from "~/utils/rpc.server";

import styles from "~/styles/dashboard.css";
import logo from "~/assets/three-id-logo.svg";
import BaseButton, { links as buttonStyles } from "~/components/BaseButton";

export function links() {
  return [...buttonStyles(), { rel: "stylesheet", href: styles }];
}

// @ts-ignore
export const loader = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const base64Url = jwt.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const address = JSON.parse(decodeURIComponent(atob(base64))).sub;

  const { code } = (await oortSend("3id_getInviteCode", [], address)).result;

  const votes = (
    await oortSend("kb_getData", ["3id.app", "feature_vote_count"], address)
  ).result;

  return json({
    inviteCode: code,
    votes,
  });
};

export default function Welcome() {
  const { inviteCode, votes } = useLoaderData();
  let submit = useSubmit();

  // TODO: sort out layout component

  // TODO: port over welcome screen
  return (
    <div className="wrapper flex flex-col justify-center align-center">
      <div className="header flex-none flex-grow order-none">
        <nav className="flex flex-row justify-between align-center gap-80">
          <div className="nav-items flex flex-row align-center justify-start gap-12">
            <ul className="flex flex-row flex-start gap-4">
              <li className="flex flex-row align-center">
                <img src={logo} alt="threeid" />
              </li>
              <li className="flex flex-row align-center">My Profile</li>
            </ul>
          </div>
          <div className="nav-button flex flex-row justify-center align-center gap-2.5">
            <BaseButton text={"fff"} color={"light"} onClick={() => null} />
          </div>
        </nav>
      </div>
      <article className="content col-span-3">
        <Outlet />
      </article>
      <footer className="col-span-3">
        <p>
          3ID is non-custodial and secure.
          <br />
          We will never request access to your assets.
        </p>
      </footer>
    </div>
  );
}
