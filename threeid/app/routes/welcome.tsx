import { 
    json,
    redirect,
  } from "@remix-run/cloudflare";

  import { useLoaderData, useSubmit } from "@remix-run/react";

  import {
      Outlet,
  } from "@remix-run/react";

  import { getUserSession } from "~/utils/session.server";
  
  import styles from "../styles/welcome.css";
  import logo from "../assets/three-id-logo.svg";

  export function links() {
    return [
      { rel: "stylesheet", href: styles }
    ];
}

// @ts-ignore
export const loader = async ({ request }) => {
    const session = await getUserSession(request)
    if (!session.has("jwt")) {
        return redirect("/auth");
    }
    const jwt = session.get("jwt");

    // TODO: call oort for invite code (pass in jwt)

    // TODO: call oort for votes (pass in jwt)
    
    return json({
        inviteCode: "123456",
        votes: [],
    });
};

export default function Welcome() {
    const {inviteCode, votes } = useLoaderData();
    let submit = useSubmit();


    // TODO: sort out layout component

    // TODO: port over welcome screen
    return (
        <>
            <div>welcome</div>
            <button onClick={() => submit(null, {method: 'post', action: `/auth/signout/`})}>Sign Out</button>
        </>
    )
}