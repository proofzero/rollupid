import { redirect, json } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";

import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";



// Fetch the nonce for address
// @ts-ignore
export const loader = async ({ request, params }) => {
    const session = await getUserSession(request);
    if (session.has("jwt")) {
        const inviteRes = await oortSend("3id_listInvitations", 
            [], 
            session.get("address"), // TODO: remove when RPC url is changed
            session.get("jwt"),
            request.headers.get("Cookie")
        )
        
        return json(inviteRes.result);
    }
    return redirect("/auth");
};

// @ts-ignore
export async function action({ request, params }) {
    let formData = await request.formData();

    // TODO: 3id_redeemInvitation

    // on success redirect to account
    return redirect("/account");
}

export default function AuthGate() {
    const cards = useLoaderData();
    let submit = useSubmit();

    if (cards.length) {
        return (<>
            <h1>YOU HAVE INVITES</h1>
        </>)
    }

    return (
        <div className="gate">
            <p className="auth-message">
                YOU HAVE NO INVITES
            </p>
            
        </div>
    )
}