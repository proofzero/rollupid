import { LoaderFunction, json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  let isOwner = false;

  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  if (!jwt) {
    throw new Error("JWT required for Oort operations");
  }

  const address = session.get("address");

  if (address === params.profile) {
    isOwner = true;
  }

  const oortOptions = {
    jwt: jwt,
    cookie: request.headers.get("Cookie") as string | undefined,
  };

  const [displayname, pfp] = await Promise.all([
    oortSend("kb_getData", ["3id.profile", "displayname"], oortOptions),
    oortSend("kb_getData", ["3id.profile", "pfp"], oortOptions),
  ]);

  let profile: {
    displayname?: string;
    pfp?: string;
    isOwner?: boolean;
  } = {
    displayname: displayname.result?.value ?? undefined,
    pfp: pfp.result?.value ?? undefined,
    isOwner,
  };

  if (request.url.toLowerCase().endsWith("/json")) {
    delete profile.isOwner;
  }

  return json(profile);
};
