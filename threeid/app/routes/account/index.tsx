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

import { getUserSession, requireJWT } from "~/utils/session.server";
import { oortSend } from "~/utils/rpc.server";
import datadogRum from "~/utils/datadog.client";

import FAQ from "~/components/FAQ";
import InviteCode from "~/components/invite-code";

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
  const jwt = await requireJWT(request, "/auth");

  const oortOptions = {
    jwt: jwt,
    cookie: request.headers.get("Cookie"),
  }

  // TODO remove session address param when RPC url is changed
  const [inviteCodeRes, votesRes, pfpRes, nicknameRes, namesRes] = await Promise.all([
    oortSend(
      "3id_getInviteCode",
      [],
      oortOptions,
    ),
    oortSend(
      "kb_getData",
      ["3id.app", "feature_vote_count"],
      oortOptions,
    ),
    oortSend(
      "kb_getData",
      ["3id.profile", "pfp"],
      oortOptions,
    ),
    oortSend(
      "kb_getData",
      ["3id.profile", "nickname"],
      oortOptions,
    ),
    oortSend(
      "kb_getCoreAddresses",
      [["ens"]],
      oortOptions,
    )
  ]);

  if (inviteCodeRes.error || votesRes.error) {
    return redirect(`/error`);
  }
  const [
    inviteCode,
    votes,
    pfp,
    nickname,
    names
  ] = [
    inviteCodeRes.result,
    votesRes.result,
    pfpRes.result,
    nicknameRes.result,
    namesRes.result
  ];

  return json({
    inviteCode,
    votes,
    pfp,
    nickname,
    names,
  });
};

export const action = async ({ request }: any) => {
  const votes = (await request.formData()).get("votes");
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  oortSend(
    "kb_setData",
    ["3id.app", "feature_vote_count", votes],
    {
      jwt, cookie: request.headers.get("Cookie")
    }
  );
  return json({ votes });
};

const completeSteps = [
  {
    title: "Claim your 3ID",
    isCompleted: true,
  },
  {
    title: "Claim your PFP",
    isCompleted: false,
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
        <a>
          Click here to complete.
        </a>
      </>
    ),
  },
  {
    title: "Verify ENS",
    isCompleted: false,
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
        <a>
          Click here to complete.
        </a>
      </>
    ),
  },
];

const comingNext = [
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

export default function Welcome() {
  const { inviteCode, votes, pfp, nickname, names } = useLoaderData();
  let submit = useSubmit();

  completeSteps[1].isCompleted = pfp?.value?.isToken;
  completeSteps[2].isCompleted = names?.ens?.length;

  const percentage =
    ((completeSteps.filter(step => step.isCompleted)).length /
      (completeSteps.length + comingNext.length + roadmapSteps.length)) *
    100;

  const currentVotes = votes.value ? JSON.parse(votes.value) : [];

  const [featureVotes, setFeatureVotes] = useState<Set<string>>(
    currentVotes.length ? new Set<string>(currentVotes): new Set<string>()
  );

  useEffect(() => {
    submit(
      { votes: JSON.stringify(Array.from(featureVotes)) },
      { action: "", method: "post" }
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
        <Heading className="mb-3 flex flex-col lg:flex-row gap-4">
          <span className="order-2 text-center justify-center align-center lg:order-1">Welcome to 3ID, {nickname.value}!</span>
          <span className="order-1 text-center justify-center align-center lg:order-2">🎉</span>
          </Heading>

        <Text
          weight={TextWeight.Regular400}
          size={TextSize.Base}
          color={TextColor.Gray500}
          className="mb-6 text-center lg:text-left"
        >
          The app is currently in beta. We will be unlocking new features on
          weekly basis. Please follow us on Twitter and join our Discord to stay
          updated!
        </Text>

        <div className="flex flex-row gap-4 justify-center align-center lg:justify-start">
          <ButtonAnchor
            href="https://twitter.com/threeid_xyz"
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
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img src={step.isCompleted ? stepComplete: stepSoon} alt="3ID Step" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading>{step.title}</SectionHeading>
                    <div className="col-span-5">
                      <Text
                        size={TextSize.SM}
                        weight={TextWeight.Regular400}
                        color={TextColor.Gray500}
                      >
                        {step.isCompleted ? "Completed" : step.description}
                      </Text>
                    </div>
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
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img src={stepSoon} alt="3ID Step" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                    <div className="col-span-5">{step.description}</div>
                  </div>
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
                  <button
                    className="roadmap-vote__button mt-1 flex items-center justify-center"
                    disabled={
                      featureVotes.size >= 3 || featureVotes.has(step.title)
                        ? true
                        : false
                    }
                    onClick={(e) => {
                      featureVotes.add(step.title);
                      setFeatureVotes(new Set(featureVotes));
                      datadogRum.addAction("featureVote", {
                        value: step.title,
                      });
                    }}
                  >
                    <FaCaretUp />
                  </button>
                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
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
    </div>
  );
}
