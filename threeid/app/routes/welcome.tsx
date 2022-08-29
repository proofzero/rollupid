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

// @ts-ignore
export const loader = async ({ request }) => {
    const session = await getUserSession(request)
    if (!session.has("jwt")) {
        return redirect("/auth");
    }

    // TODO: call oort for invite code

    // TODO: call oort for votes
    
    return json({
        inviteCode: "123456",
        votes: [],
    });

};

export default function Welcome() {
    const {inviteCode, votes } = useLoaderData();

    // TODO: sort out layout component

    // TODO: port over welcome screen
    return (
        <div>welcome</div>
    )
}