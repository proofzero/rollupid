import { LoaderFunction, redirect } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async () => {
  // TODO: check for session. If no session, redirect to login
  return redirect("/auth");
};
