import { ActionFunction, redirect } from "@remix-run/cloudflare";
import { requireJWT, getUserSession} from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  await requireJWT(request);
  const session = await getUserSession(request);
  const core = session.get("core");

  // @ts-ignore
  await ONBOARD_STATE.put(core, true);
 
  return redirect(`/account`);
};
