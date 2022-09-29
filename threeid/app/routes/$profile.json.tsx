import { LoaderFunction, json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getUserSession(request);
  const jwt = session.get("jwt");

  if (!jwt) {
    throw new Error("JWT required for Oort operations");
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
  } = {
    displayname: displayname.result?.value ?? undefined,
    pfp: pfp.result?.value ?? undefined,
  };

  return json(profile);
};
