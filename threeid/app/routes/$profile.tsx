import { json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import ProfileCard from "~/components/profile/ProfileCard";

import { loader as profileLoader } from "~/routes/$profile.json";
import { getUserSession } from "~/utils/session.server";

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import { Button } from "~/components/buttons";

import HeadNav from "~/components/head-nav";

import { links as spinnerLinks } from "~/components/spinner";
import { links as nftCollLinks } from "~/components/profile/ProfileNftCollection";

import ProfileNftCollection from "~/components/profile/ProfileNftCollection";
import { FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

export function links() {
  return [...spinnerLinks(), ...nftCollLinks()];
}

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args;

  const profileJson = await profileLoader(args).then((profileRes: Response) =>
    profileRes.json()
  );

  let isOwner = false;

  const session = await getUserSession(request);
  const jwt = session.get("jwt");
  const address = session.get("address");

  if (address === params.profile) {
    isOwner = true;
  }

  return json({
    ...profileJson,
    isOwner,
    targetAddress: params.profile,
    loggedIn: jwt ? true : false,
  });
};

const ProfileRoute = () => {
  const {
    targetAddress,
    claimed,
    displayName,
    bio,
    job,
    location,
    isOwner,
    loggedIn,
    avatar,
    cover,
    isToken,
  } = useLoaderData();

  return (
    <div className="bg-white h-full min-h-screen">
      <div
        style={{
          backgroundColor: "#192030",
        }}
      >
        <HeadNav loggedIn={loggedIn} pfp={avatar} />
      </div>

      <div
        className="h-80 w-full relative flex justify-center"
        style={{
          backgroundImage: cover ? `url(${gatewayFromIpfs(cover)})` : undefined,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="mt-[6.5rem] lg:mt-28 max-w-7xl w-full mx-auto justify-center lg:justify-start flex">
          <div className="absolute">
            <ProfileCard
              account={targetAddress}
              avatarUrl={gatewayFromIpfs(avatar)}
              claimed={claimed ? new Date() : undefined}
              displayName={displayName}
              isNft={isToken}
            />
          </div>
        </div>

        {/* {isOwner && (
          <div className="absolute top-0 lg:top-auto lg:bottom-0 right-0 my-8 mx-6">
            <ButtonAnchor size={ButtonSize.SM} href="#" Icon={FaCamera}>
              Edit Cover Photo
            </ButtonAnchor>
          </div>
        )} */}
      </div>

      <div className="mt-44 lg:mt-0 p-3 max-w-7xl w-full mx-auto">
        {!claimed && (
          <div className="lg:ml-[19rem] rounded-md bg-gray-50 py-4 px-6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 flex-row justify-between mt-7">
            <div>
              <Text
                size={TextSize.LG}
                weight={TextWeight.SemiBold600}
                color={TextColor.Gray600}
              >
                This Account is yet to be claimed - Are you the owner?
              </Text>
              <Text
                className="break-all"
                size={TextSize.Base}
                weight={TextWeight.Regular400}
                color={TextColor.Gray500}
              >
                {targetAddress}
              </Text>
            </div>

            <a href="https://get.threeid.xyz/">
              <Button>Claim This Account</Button>
            </a>
          </div>
        )}

        {claimed && (
          <div
            className="lg:ml-[19rem] py-4 px-6"
            style={{
              minHeight: "8rem",
            }}
          >
            <Text
              size={TextSize.Base}
              weight={TextWeight.Medium500}
              color={TextColor.Gray500}
            >
              {bio}
            </Text>

            <hr className="my-6" />

            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-row space-x-10 justify-start items-center text-gray-500 font-size-lg">
                <div className="flex flex-row space-x-3.5 justify-center items-center wrap">
                  <FaMapMarkerAlt /> <Text>{location}</Text>
                </div>

                <div className="flex flex-row space-x-4 justify-center items-center">
                  <FaBriefcase /> <Text>{job}</Text>
                </div>
              </div>

              {/* {isOwner && isOwner && (
                <div>
                  <ButtonAnchor size={ButtonSize.SM} href="#" Icon={FaEdit}>
                    Edit Profile
                  </ButtonAnchor>
                </div>
              )} */}
            </div>
          </div>
        )}

        <div className="mt-20">
          <ProfileNftCollection
            account={targetAddress}
            displayname={displayName}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileRoute;
