import { json } from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";

import logo from "~/assets/three-id-logo.svg";

// @ts-ignore
export const loader = async ({ request }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  const base64Url = jwt.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const address = JSON.parse(decodeURIComponent(atob(base64))).sub;

  const { code } = (await oortSend("3id_getInviteCode", [], address)).result;

  return json({
    inviteCode: code,
    votes: [],
  });
};

export default function Welcome() {
  const { inviteCode, votes } = useLoaderData();
  let submit = useSubmit();

  // TODO: sort out layout component

  // TODO: port over welcome screen
  return (
    <>
      <div>welcome!</div>
      <button
        onClick={() =>
          submit(null, { method: "post", action: `/auth/signout/` })
        }
      >
        Sign Out
      </button>
    </>
  );
}
