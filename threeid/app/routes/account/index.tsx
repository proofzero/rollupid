import { json, redirect } from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";

import FAQ from "~/components/FAQ";
import InviteCode from "~/components/invite-code";

import logo from "~/assets/three-id-logo.svg";
import stepComplete from "~/assets/step_complete.png";
import stepSoon from "~/assets/step_soon.png";


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
  const [inviteCode, votes] = [inviteCodeRes.result, votesRes.result];

  return json({
    inviteCode,
    votes,
    address
  });
};

const completeSteps = [
  {
    title: "Claim your 3ID",
  },
];

const comingNext = [
  {
    title: "Claim your PFP",
    description: (
      <>
        Mint your very own 3ID 1/1 PFP. <br></br>
        For more information see "What is the 3ID?"" PFP in the FAQ section.
      </>
    ),
  },
  {
    title: "Verify ENS",
    description: (
      <>
        Connect your ENS name to your 3ID. <br></br>
        Use your ENS name as your username for easier profile discovery.
      </>
    ),
  },
  {
    title: "Configure Profile",
    description: (
      <>
        Configure your NFT avatar and profile. <br></br>
        Tell the world about yourself...or don't! It's up to you.
      </>
    ),
  },
];

const roadmapSteps = [
  {
    title: "Create NFT gallery",
  },
  {
    title: "Link More Accounts",
  },
  {
    title: "Receive First Credential",
  },
  {
    title: "Setup Secure KYC",
  },
  {
    title: "Send First Message",
  },
  {
    title: "Publish First File",
  },
  {
    title: "Permission First App",
  },
];

const percentage =
  (completeSteps.length /
    (completeSteps.length + comingNext.length + roadmapSteps.length)) * 100;


export default function Welcome() {
  const { inviteCode, votes, address } = useLoaderData();
  let submit = useSubmit();


  // TODO: sort out layout component

  // TODO: port over welcome screen
  return (
    <div className="dashboard flex flex-col gap-4">
      <div className="welcome-banner basis-full">
        <h1>Welcome to 3ID!</h1>
        <p>The app is currently in beta. We will be unlocking new features on weekly basis. 
            Please follow us on Twitter and join our Discord to stay updated!{" "}</p>
        <div className="flex flex-row gap-4">
          <a href="https://twitter.com/threeid.xyz">Twitter</a>
          <a href="https://discord.gg/threeid">Discord</a>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="invite basis-full lg:basis-6/12 order-1 lg:order-2">
         <InviteCode invite={inviteCode}/>
          <div className="faq hidden lg:block">
            <FAQ account={address}/>
          </div>
        </div>
        <div className="roadmap basis-full lg:basis-6/12 order-2 lg:order-1">
          <h2>Roadmap</h2>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${percentage}%` }}></div>
          </div>
          <div className="roadmap-ready">
            <h3>Ready</h3>
            <div className="roadmap-ready__steps steps">
              {completeSteps.map((step, index) => (
                <div className="roadmap-ready__step step grid grid-cols-6" key={index}>
                  <img src={stepComplete} alt="3ID logo" className="row-span-2 mt-2" />
                  <p className="col-span-5">{step.title}</p>
                  <p className="col-span-5">Completed</p>
                </div>
              ))}
            </div>
          </div>
          <div className="roadmap-next">
            <h3>COMING NEXT</h3>
            <div className="roadmap-next__steps steps">
              {comingNext.map((step, index) => (
                <div className="roadmap-next__step step grid grid-cols-6" key={index}>
                  <img src={stepSoon} alt="3ID logo" className="row-span-2 mt-2" />
                  <p className="col-span-5">{step.title}</p>
                  <p className="col-span-5">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="roadmap-vote">
            <h3>TELL US WHAT'S NEXT</h3>
            <p>Vote for your favorite features ({3 - votes.size} votes left)</p>
            <div className="roadmap-vote__steps steps">
              {roadmapSteps.map((step, index) => (
                <div className="roadmap-vote__step step grid grid-cols-6" key={index}>
                  <img src={logo} alt="3ID logo" className="row-span-2 mt-2" />
                  <p className="col-span-5">{step.title}</p>
                </div>
              ))}
            </div>
          </div>

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
