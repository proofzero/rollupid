import { json, redirect } from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";

import FAQ from "~/components/FAQ";

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
    address
  });
};

export default function Welcome() {
  const { inviteCode, votes, address } = useLoaderData();
  let submit = useSubmit();

  // TODO: sort out layout component

  // TODO: port over welcome screen
  return (
    <div className="dashboard flex flex-col">
      <div className="welcome-banner basis-full">
        <h1>Welcome to 3ID!</h1>
        <p>The app is currently in beta. We will be unlocking new features on weekly basis. 
            Please follow us on Twitter and join our Discord to stay updated! </p>
        <div className="flex flex-row">
          <a href="https://twitter.com/threeid.xyz">Twitter</a>
          <a href="https://discord.gg/threeid">Discord</a>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row">
        
        <div className="invite basis-full lg:basis-6/12 order-1 lg:order-2">
          <h2 className="order">Invite Friends</h2>
          {inviteCode && <div>Invite code: {inviteCode}</div>}
          <div className="faq hidden lg:block">
            <FAQ account={address}/>
          </div>
        </div>
        <div className="roadmap basis-full lg:basis-6/12 order-2 lg:order-1">
          <h2>Roadmap</h2>

        </div>
        <div className="faq basis-full lg:basis-6/12 lg:hidden order-3">
        <FAQ account={address}/>

        </div>
      </div>
      {/* <button
        onClick={() =>
          submit(null, { method: "post", action: `/auth/signout/` })
        }
      >
        Sign Out
      </button> */}
    </div>
  );
}
