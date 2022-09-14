import { 
    json, redirect,
} from "@remix-run/cloudflare";

 import { oortSend } from "~/utils/rpc.server";
 import { getUserSession } from "~/utils/session.server";

export const signMessageTemp = `Welcome to 3ID!

Click "Sign" to sign in and accept the 3ID Terms of Service (https://threeid.xyz/tos), no password needed!

This will not trigger a blockchain transaction or cost any gas fees.

You will remain connected until you sign out.

{{nonce}}
`;

// Fetch the nonce for address
// TODO: support application/json response
// @ts-ignore
export const loader = async ({ request, params }) => {
    const session = await getUserSession(request)
    if (session.has("jwt")) {
        return redirect("/auth/gate/" + params.address)
    }

    const url = new URL(request.url);
    const isTest = url.searchParams.get("isTest")

    // @ts-ignore
    const nonceRes = await oortSend("kb_getNonce", [
            params.address,
            {"3id.profile": ["read", "write"], "3id.app": ["read", "write"]},
            signMessageTemp,
        ], params.address)
    
    return redirect(`/auth/sign/${params.address}?nonce=${nonceRes.result.nonce}${isTest ? "&isTest=true": ''}`);
};
