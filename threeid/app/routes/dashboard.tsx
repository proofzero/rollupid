import { 
    json,
} from "@remix-run/cloudflare";

import { useLoaderData, useSubmit } from "@remix-run/react";

import {
    Outlet,
} from "@remix-run/react";

import { getUserSession } from "~/utils/session.server";

import styles from "~/styles/dashboard.css";
import logo from "~/assets/three-id-logo.svg";

export function links() {
    return [
      { rel: "stylesheet", href: styles }
    ];
}

// @ts-ignore
export const loader = async ({ request }) => {
    const session = await getUserSession(request)
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
        <div className="wrapper grid grid-cols-3 gap-4">
            <nav className="col-span-3">
            <img src={logo} alt="threeid" />
            </nav>
            <article className="content col-span-3">
                <Outlet />
            </article>
            <footer className="col-span-3">
            <p>
                3ID is non-custodial and secure.<br/>We will never request access to your assets.
            </p>
            </footer>
        </div>
    )
}