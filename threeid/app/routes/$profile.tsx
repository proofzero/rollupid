import { DataFunctionArgs, json, LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { loader as profileLoader } from "~/routes/$profile.json";
import { getUserSession } from "~/utils/session.server";

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
  });
};

const ProfileRoute = () => {
  const profile = useLoaderData();

  return (
    <>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </>
  );
};

export default ProfileRoute;
