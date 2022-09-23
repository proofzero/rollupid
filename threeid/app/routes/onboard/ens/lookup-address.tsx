import { LoaderFunction, redirect } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const address = session.get("address");
  const jwt = session.get("jwt");

  // gate with invites only
  const claimsRes = await oortSend("kb_getCoreClaims", [], {
    address,
    jwt,
    cookie: request.headers.get("Cookie") as string,
  });

  if (!claimsRes || !claimsRes.result.includes("3id.enter")) {
    return redirect(`/auth`);
  }

  const ensRes = await oortSend("ens_lookupAddress", [address], {
    address,
    jwt,
    cookie: request.headers.get("Cookie") as string,
  });

  const ensEntries: string[] = [];

  if (ensRes.error) {
    console.error(ensRes.error);
  } else {
    ensEntries.push(ensRes.result);
  }

  return json({
    ensEntries,
  });
};
