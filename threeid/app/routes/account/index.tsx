import { json, redirect } from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";

import logo from "~/assets/three-id-logo.svg";

// @ts-ignore
export const loader = async ({ request, params }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  // TODO remove session address param when RPC url is changed
  const [inviteCodeRes, votesRes] = await Promise.all([
    oortSend("3id_getInviteCode", [], address, jwt, request.headers.get("Cookie")),
    oortSend("kb_getData", ["3id.app", "feature_vote_count"], address, jwt, request.headers.get("Cookie")),
  ]);

  if (inviteCodeRes.error || votesRes.error) {
    return redirect(`/error`);
  }
  const [inviteCode, votes] = [inviteCodeRes.result.code, votesRes.result];

  return json({
    inviteCode,
    votes,
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
