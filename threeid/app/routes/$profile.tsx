import { DataFunctionArgs, json, LoaderFunction } from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import ProfileCard from "~/components/profile/ProfileCard";

import { loader as profileLoader } from "~/routes/$profile.json";
import { getUserSession } from "~/utils/session.server";

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import { Button, ButtonAnchor, ButtonSize } from "~/components/buttons";
import HeadNav from "~/components/head-nav";
import { useEffect, useState } from "react";

import { links as spinnerLinks } from "~/components/spinner";
import { links as nftCollLinks } from "~/components/profile/ProfileNftCollection";

import { FaBriefcase, FaCamera, FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import ProfileNftCollection from "~/components/profile/ProfileNftCollection";
import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

export function links() {
  return [...spinnerLinks(), ...nftCollLinks()];
}

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args;

  const profileJson = await profileLoader(args).then((res: Response) =>
    res.json()
  );

  let isOwner = false;

  const session = await getUserSession(request);
  const address = session.get("address");

  if (address === params.profile) {
    isOwner = true;
  }

  return json({
    ...profileJson,
    isOwner,
    targetAddress: params.profile,
  });
};

const ProfileRoute = () => {
  const { targetAddress, claimed, pfp, displayname, isOwner } = useLoaderData();
  const [loading, setLoading] = useState(!claimed);

  const [pfpUrl, setPfpUrl] = useState<string | undefined>(pfp?.url);
  const [coverUrl, setCoverUrl] = useState<string | undefined>(pfp?.cover);
  const [minted, setMinted] = useState(pfp?.isToken);

  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.type === "init") {
      if (!claimed)
        fetcher.submit(
          {
            address: targetAddress,
          },
          {
            action: "/onboard/mint/load-voucher",
            method: "get",
          }
        );
    } else if (fetcher.type === "done") {
      if (!fetcher.data.metadata) {
        throw new Error("Unable to assess PFP metadata");
      }

      setPfpUrl(gatewayFromIpfs(fetcher.data.metadata.image));
      setCoverUrl(gatewayFromIpfs(fetcher.data.metadata.cover));
      setMinted(fetcher.data.minted);

      setLoading(false);
    }
  }, [fetcher]);

  return (
    <div className="bg-white h-full min-h-screen">
      <div
        style={{
          backgroundColor: "#192030",
        }}
      >
        <HeadNav />
      </div>

      <div
        className="h-80 w-full relative flex justify-center"
        style={{
          backgroundImage:
            !loading && coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="mt-[6.5rem] lg:mt-28 max-w-7xl w-full mx-auto justify-center lg:justify-start flex">
          <div className="absolute">
            <ProfileCard
              account={targetAddress}
              avatarUrl={!loading && pfpUrl ? pfpUrl : undefined}
              claimed={claimed ? new Date() : undefined}
              displayName={displayname}
              isNft={minted}
            />
          </div>
        </div>

        {isOwner && (
          <div className="absolute top-0 lg:top-auto lg:bottom-0 right-0 my-8 mx-6">
            <ButtonAnchor size={ButtonSize.SM} href="#" Icon={FaCamera}>
              Edit Cover Photo
            </ButtonAnchor>
          </div>
        )}
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

            <Button>Claim This Account</Button>
          </div>
        )}

        {claimed && (
          <div className="lg:ml-[19rem] py-4 px-6">
            <Text
              size={TextSize.Base}
              weight={TextWeight.Medium500}
              color={TextColor.Gray500}
            >
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nunc
              auctor. Etiam dui sem, fermentum vitae, sagittis id, malesuada in,
              quam. Nullam lectus justo, vulputate eget mollis sed, tempor sed
              magna. Nullam sapien sem, ornare ac, nonummy non, lobortis a enim.{" "}
            </Text>

            <hr className="my-6" />

            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-row space-x-10 justify-start items-center text-gray-500 font-size-lg">
                <div className="flex flex-row space-x-3.5 justify-center items-center wrap">
                  <FaMapMarkerAlt /> <Text>Fubar</Text>
                </div>

                <div className="flex flex-row space-x-4 justify-center items-center">
                  <FaBriefcase /> <Text>Fubar</Text>
                </div>
              </div>

              {isOwner && isOwner && (
                <div>
                  <ButtonAnchor size={ButtonSize.SM} href="#" Icon={FaEdit}>
                    Edit Profile
                  </ButtonAnchor>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-20">
          <ProfileNftCollection
            account={displayname ?? targetAddress}
            isOwner={isOwner}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileRoute;
