/**
 * @file app/routes/auth/signout.tsx
 */

import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import { logout } from "~/shared/utilities/session.server";

// Loader
// -----------------------------------------------------------------------------

export const loader: LoaderFunction = async () => {
  return redirect("/");
};

// Action
// -----------------------------------------------------------------------------

//@ts-ignore
export const action: ActionFunction = async ({ request }) => {
  return logout(request);
}
