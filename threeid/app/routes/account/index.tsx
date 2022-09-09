import { json, redirect } from "@remix-run/cloudflare";

import {
  useFetcher,
  useLoaderData,
  useSubmit,
  useFetchers,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { FaDiscord, FaTwitter, FaCaretUp } from "react-icons/fa";
import { Tooltip } from "flowbite-react";

import { getUserSession } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";
import datadogRum from "~/utils/datadog.client";

import FAQ from "~/components/FAQ";
import InviteCode from "~/components/invite-code";

import logo from "~/assets/three-id-logo.svg";
import stepComplete from "~/assets/step_complete.png";
import stepSoon from "~/assets/step_soon.png";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import Heading from "~/components/typography/Heading";
import SectionTitle from "~/components/typography/SectionTitle";
import SectionHeading from "~/components/typography/SectionHeading";
import SectionHeadingSubtle from "~/components/typography/SectionHeadingSubtle";
import { ButtonAnchor, ButtonSize } from "~/components/buttons";

// @ts-ignore
export const loader = async ({ request, params }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  // TODO remove session address param when RPC url is changed
  const [inviteCodeRes, votesRes] = await Promise.all([
    oortSend(
      "3id_getInviteCode",
      [],
      address,
      jwt,
      request.headers.get("Cookie")
    ),
    oortSend(
      "kb_getData",
      ["3id.app", "feature_vote_count"],
      address,
      jwt,
      request.headers.get("Cookie")
    ),
  ]);

  if (inviteCodeRes.error || votesRes.error) {
    return redirect(`/error`);
  }
  const [inviteCode, votes] = [inviteCodeRes.result, votesRes.result];

  return json({
    inviteCode,
    votes,
    address,
  });
};

export const action = async ({ request }: any) => {
  const votes = (await request.formData()).get("votes");
  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  oortSend(
    "kb_setData",
    ["3id.app", "feature_vote_count", votes],
    address,
    jwt,
    request.headers.get("Cookie")
  );
  return json({ votes });
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
        <Text
          className="mb-1"
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          Mint your very own 3ID 1/1 PFP.
        </Text>
        <Text
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          For more information see "What is the 3ID?"" PFP in the FAQ section.
        </Text>
      </>
    ),
  },
  {
    title: "Verify ENS",
    description: (
      <>
        <Text
          className="mb-1"
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          Connect your ENS name to your 3ID.
        </Text>
        <Text
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          Use your ENS name as your username for easier profile discovery.
        </Text>
      </>
    ),
  },
  {
    title: "Configure Profile",
    description: (
      <>
        <Text
          className="mb-1"
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          Configure your NFT avatar and profile.
        </Text>
        <Text
          size={TextSize.SM}
          weight={TextWeight.Regular400}
          color={TextColor.Gray400}
        >
          Tell the world about yourself...or don't! It's up to you.
        </Text>
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
    (completeSteps.length + comingNext.length + roadmapSteps.length)) *
  100;

export default function Welcome() {
  const { inviteCode, votes, address } = useLoaderData();
  let submit = useSubmit();

  const currentVotes = JSON.parse(votes.value);

  const [featureVotes, setFeatureVotes] = useState<Set<string>>(
    new Set<string>(currentVotes ? currentVotes : [])
);

  useEffect(() => {
    submit(
      { votes: JSON.stringify(Array.from(featureVotes)) },
      { method: "post" }
    );
  }, [featureVotes]);

  return (
    <div className="dashboard flex flex-col gap-4">
      <div
        className="welcome-banner basis-full"
        style={{
          backgroundColor: "#F9FAFB",
          padding: "30px 30px 23px 16px",
        }}
      >
        <Heading className="mb-3">Welcome to 3ID! 🎉</Heading>

        <Text
          weight={TextWeight.Regular400}
          size={TextSize.Base}
          color={TextColor.Gray500}
          className="mb-6"
        >
          The app is currently in beta. We will be unlocking new features on
          weekly basis. Please follow us on Twitter and join our Discord to stay
          updated!
        </Text>

        <div className="flex flex-row gap-4">
          <ButtonAnchor
            href="https://twitter.com/threeid.xyz"
            Icon={FaTwitter}
            iconColor="#1D9BF0"
          >
            Twitter
          </ButtonAnchor>

          <ButtonAnchor
            href="https://discord.gg/threeid"
            Icon={FaDiscord}
            iconColor="#5865F2"
          >
            Discord
          </ButtonAnchor>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="invite basis-full lg:basis-6/12 order-1 lg:order-2">
          <InviteCode invite={inviteCode} />
          <div className="faq hidden lg:block">
            <FAQ />
          </div>
        </div>
        <div className="roadmap basis-full lg:basis-6/12 order-2 lg:order-1">
          <SectionTitle
            title="Roadmap"
            subtitle="Discover and try new features as we roll them out"
          />

          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="roadmap-ready">
            <SectionHeadingSubtle title="Ready" />

            <div className="roadmap-ready__steps steps grid grid-rows gap-4">
              {completeSteps.map((step, index) => (
                <div
                  className="roadmap-ready__step step grid grid-cols-6"
                  key={index}
                >
                  <div className="row-span-2 mt-1 flex justify-center items-top">
                    <img src={stepComplete} alt="3ID logo" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading>{step.title}</SectionHeading>
                  </div>

                  <div className="col-span-5">
                    <Text
                      size={TextSize.SM}
                      weight={TextWeight.Regular400}
                      color={TextColor.Gray500}
                    >
                      Completed
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="roadmap-next">
            <SectionHeadingSubtle title="Coming next" />

            <div className="roadmap-next__steps steps grid grid-rows gap-4">
              {comingNext.map((step, index) => (
                <div
                  className="roadmap-next__step step grid grid-cols-6"
                  key={index}
                >
                  <div className="row-span-2 mt-1 flex justify-center items-top">
                    <img src={stepSoon} alt="3ID logo" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                  </div>

                  <div className="col-span-5">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="roadmap-vote">
            <SectionHeadingSubtle
              title="Tell us what's next"
              subtitle={`Vote for your favorite features (${
                3 - featureVotes.size
              } votes left)`}
            />

            <div className="roadmap-vote__steps steps grid grid-rows gap-4">
              {roadmapSteps.map((step, index) => (
                <div
                  className="roadmap-vote__step step flex flex-row gap-4 items-center"
                  key={index}
                >
                  <Tooltip
                      content={
                        featureVotes.has(step.title)
                          ? "Already submitted"
                          : "Vote submitted!"
                      }
                      trigger="click"
                      animation="duration-1000"
                    >
                    <button
                      className="roadmap-vote__button mt-1 flex items-center justify-center"
                      disabled={
                        featureVotes.size >= 3 || featureVotes.has(step.title)
                          ? true
                          : false
                      }
                      onClick={(e) => {
                        setTimeout(() => {
                          //dismiss tooltip
                          e.target.dispatchEvent(
                            new MouseEvent("click", {
                              view: window,
                              bubbles: true,
                              cancelable: false,
                            })
                          );
                        }, 1500);
                        featureVotes.add(step.title);
                        setFeatureVotes(new Set(featureVotes));
                        datadogRum.addAction("featureVote", {
                          value: step.title,
                        });
                      }}
                    >
                      <FaCaretUp />
                    </button>
                  </Tooltip>

                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                    <Text
                      size={TextSize.SM}
                      weight={TextWeight.Regular400}
                      color={TextColor.Gray500}
                    >
                      Completed
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="faq basis-full lg:basis-6/12 lg:hidden order-3">
          <FAQ />
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
