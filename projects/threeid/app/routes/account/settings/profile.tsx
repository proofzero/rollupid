import { ActionFunction, json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { FaAt, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import InputText from "~/components/inputs/InputText";
import { getUserSession, requireJWT } from "~/utils/session.server";

import { GraphQLClient } from "graphql-request";
import { useState } from "react";
import { getSdk, Visibility } from "~/utils/galaxy.server";

import InputTextarea from "~/components/inputs/InputTextarea";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import { gatewayFromIpfs } from "~/helpers/gateway-from-ipfs";

export const loader: LoaderFunction = async ({ request }) => {
  const jwt = await requireJWT(request);

  // @ts-ignore
  const gqlClient = new GraphQLClient(
    `${GALAXY_SCHEMA}://${GALAXY_HOST}:${GALAXY_PORT}`,
    {
      fetch,
    }
  );

  const galaxySdk = getSdk(gqlClient);

  const profileRes = await galaxySdk.getProfile(undefined, {
    "KBT-Access-JWT-Assertion": jwt,
  });

  return json({
    ...profileRes.profile,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request);

  const formData = await request.formData();

  // @ts-ignore
  const gqlClient = new GraphQLClient(
    `${GALAXY_SCHEMA}://${GALAXY_HOST}:${GALAXY_PORT}`,
    {
      fetch,
    }
  );

  const galaxySdk = getSdk(gqlClient);

  await galaxySdk.updateProfile(
    {
      profile: {
        displayName: formData.get("displayName")?.toString() || null,
        job: formData.get("job")?.toString(),
        location: formData.get("location")?.toString(),
        bio: formData.get("bio")?.toString(),
        website: formData.get("website")?.toString(),
      },
      visibility: Visibility.Public,
    },
    {
      "KBT-Access-JWT-Assertion": jwt,
    }
  );

  return null;
};

export default function AccountSettingsProfile() {
  const { displayName, job, location, bio, website, pfp, cover, isToken } =
    useLoaderData();

  const [profileData, setProfileData] = useState({
    displayName,
    job,
    location,
    bio,
    website,
    pfp,
    cover,
    isToken,
  });

  const submit = useSubmit();

  const postProfile = async () => {
    submit(profileData, { method: "post" });
  };

  return (
    <>
      <div className="flex flex-col space-y-9 mt-12">
        <div className="flex flex-row space-x-10">
          <img
            src={gatewayFromIpfs(pfp.image)}
            style={{
              width: 118,
              height: 118,
            }}
            className="rounded-full"
          />

          <div className="flex flex-col justify-between">
            <div className="flex flex-row space-x-3.5">
              <Button type={ButtonType.Secondary} size={ButtonSize.SM} disabled>
                Change NFT Avatar
              </Button>
              <Button type={ButtonType.Secondary} size={ButtonSize.SM} disabled>
                Upload an Image
              </Button>
            </div>

            <div className="flex flex-col space-y-2.5">
              <Text
                size={TextSize.SM}
                weight={TextWeight.Medium500}
                color={TextColor.Gray400}
              >
                Or use your 1/1 gradient
              </Text>

              <img
                src={gatewayFromIpfs(pfp.image)}
                style={{
                  width: 33,
                  height: 33,
                }}
                className="rounded-md"
              />
            </div>
          </div>
        </div>

        <InputText
          heading="Display Name"
          placeholder="Your Display Name"
          Icon={FaAt}
          defaultValue={profileData.displayName}
          onChange={(val) => {
            let trackedProfileData = profileData;
            trackedProfileData.displayName = val;
            setProfileData(trackedProfileData);
          }}
        />

        <div className="flex flex-col lg:flex-row lg:space-x-9">
          <div className="flex-1">
            <InputText
              heading="Job"
              placeholder="Your Job"
              Icon={FaBriefcase}
              defaultValue={profileData.job}
              onChange={(val) => {
                let trackedProfileData = profileData;
                trackedProfileData.job = val;
                setProfileData(trackedProfileData);
              }}
            />
          </div>

          <div className="flex-1">
            <InputText
              heading="Location"
              placeholder="Your Location"
              Icon={FaMapMarkerAlt}
              defaultValue={profileData.location}
              onChange={(val) => {
                let trackedProfileData = profileData;
                trackedProfileData.location = val;
                setProfileData(trackedProfileData);
              }}
            />
          </div>
        </div>

        <InputText
          heading="Website"
          addon="http://"
          defaultValue={profileData.website}
          onChange={(val) => {
            let trackedProfileData = profileData;
            trackedProfileData.website = val;
            setProfileData(trackedProfileData);
          }}
        />

        <InputTextarea
          heading="Bio"
          charLimit={256}
          rows={3}
          defaultValue={profileData.bio}
          onChange={(val) => {
            let trackedProfileData = profileData;
            trackedProfileData.bio = val;
            setProfileData(trackedProfileData);
          }}
        />

        <div className="flex lg:justify-end">
          <Button type={ButtonType.Primary} onClick={() => postProfile()}>
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
