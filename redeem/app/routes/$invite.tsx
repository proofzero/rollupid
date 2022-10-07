import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

import { 
    json,
} from "@remix-run/cloudflare";

import {
    useLoaderData,
} from "@remix-run/react";

import IndexLayout from '~/routes/index';

//@ts-ignore
export const loader = async ({ params }) => {

    // @ts-ignore
    const inviteRec = await THREEID_INVITE_CODES.get(params.invite, { type: 'json' })
    return json({ invite: params?.invite })
}


export default function Index() {
    const data = useLoaderData();
  
    return (
        <IndexLayout inviteCode={data.inviteCode} />
    );
}
