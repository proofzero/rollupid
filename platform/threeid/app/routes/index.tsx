import { redirect } from "@remix-run/cloudflare";

import { getUserSession } from "~/utils/session.server";

// @ts-ignore
export const loader = async ({ request }) => {
  const session = await getUserSession(request);
  if (!session.has("jwt")) {
    return redirect("/auth");
  }
  return redirect("/account");
};
