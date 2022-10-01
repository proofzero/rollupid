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

    return json({
        inviteCode: params.invite,
    });

}


export default function Index() {
    const data = useLoaderData();
  
    return (
        <IndexLayout inviteCode={data.inviteCode} />
    );
}
