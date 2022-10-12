import { LoaderFunction, json } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request, params }) => {
  // @ts-ignore
  const url = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/@${params.profile}/3id/profile`;

  const publicProfile = await fetch(url);

  // Core wasn't claimed
  if (publicProfile.status === 404) {
    return json({
      claimed: false,
    });
  }

  const publicProfileJson = await publicProfile.json();

  if (publicProfileJson.error) {
    throw new Error(publicProfileJson.error);
  }

  return json({
    ...publicProfileJson,
    claimed: true,
  });
};
