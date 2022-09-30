import { LoaderFunction, json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  // const session = await getUserSession(request);
  // const jwt = session.get("jwt");

  // if (!jwt) {
  //   throw new Error("JWT required for Oort operations");
  // }

  // const oortOptions = {
  //   jwt: jwt,
  //   cookie: request.headers.get("Cookie") as string | undefined,
  // };

  // const [displayname, pfp] = await Promise.all([
  //   oortSend("kb_getData", ["3id.profile", "displayname"], oortOptions),
  //   oortSend("kb_getData", ["3id.profile", "pfp"], oortOptions),
  // ]);

  // @ts-ignore
  const url = `${OORT_SCHEMA}://${OORT_HOST}:${OORT_PORT}/@${params.profile}/3id/profile`;

  const publicProfile = await fetch(url);
  const publicProfileJson = await publicProfile.json();

  if (publicProfileJson.error) {
    throw new Error(publicProfileJson.error);
  }

  return json(publicProfileJson);
};
