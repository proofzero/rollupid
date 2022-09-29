import { LoaderFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

import { loader as profileLoader } from "~/routes/$profile.json";

export const loader: LoaderFunction = profileLoader;

const ProfileRoute = () => {
  const profile = useLoaderData();

  return (
    <>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </>
  );
};

export default ProfileRoute;
