import { redirect, json } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

import { 
    useDisconnect,
    useAccount,
 } from 'wagmi'


import { oortSend } from "~/utils/rpc.server";
import { getUserSession } from "~/utils/session.server";

import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import Spinner from "~/components/spinner";
import BaseButton, { links as buttonLinks, BaseButtonAnchor } from "~/components/base-button";
import sad from "../../../assets/sad.png";


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}
    
export const links = () => [
    ...buttonLinks(),
];

// Fetch the nonce for address
// @ts-ignore
export const loader = async ({ request, params }) => {
    const session = await getUserSession(request);
    if (session.has("jwt")) {
        const inviteRes = await oortSend("3id_listInvitations", 
            [], 
            {
                jwt: session.get("jwt"),
                cookie: request.headers.get("Cookie")
            },
        )

        return json(inviteRes.result);
    }
    return redirect("/auth");
};

// @ts-ignore
export async function action({ request, params }) {
    const session = await getUserSession(request);
    let formData = await request.formData();

    const redeemRes = await oortSend("3id_redeemInvitation", [
        formData.get("contractAddress"),
        formData.get("tokenId"),
    ],
    {
        jwt: session.get("jwt"),
        cookie: request.headers.get("Cookie")
    })

    // on success redirect to account
    if (redeemRes.result === true) {
        return redirect(`/onboard/nickname`)
    }

    return json({activateFailed: redeemRes});
}

const gatewayFromIpfs = (ipfsUrl: string | undefined): string | undefined => {
    const regex = /(bafy\w*)/;
    const matches = regex.exec(ipfsUrl as string);
  
    if (!matches || !ipfsUrl) return undefined;
  
    const itemPath = ipfsUrl?.split(matches[0])[1];
    const resourceUrl = `https://nftstorage.link/ipfs/${matches[0]}/${itemPath}`;
  
    return resourceUrl;
};

export default function AuthGate() {
    const cards = useLoaderData();

    if (cards.length) {
        // ListBox needs object with id
        const cardsWithId = cards.map((c) => {
            const newCard = {id: c.tokenId, ...c}
            return newCard
        });
        const [selected, setSelected] = useState(cardsWithId[0])
        let submit = useSubmit();

        return (
            <div className="gate justify-center items-center">
                <p className="auth-message">We've detected a 3ID invite!</p>
                <p className="auth-secondary-message">Select an invite to activate your 3ID.</p>
                <div className="invites mx-3">
                    <span className="h-96">
                        <img className="card-image" src={gatewayFromIpfs(selected.image)} />
                    </span>
                    <Listbox value={selected} onChange={(v) => null }>
                        {({ open }) => (
                            <>
                            <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Select invite</Listbox.Label>
                            <div className="grid grid-rows-2 lg:grid-cols-2">
                                <div className="relative">
                                    <Listbox.Button className="relative w-full cursor-default border border-gray-300 bg-white py-4 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                    <span className="block truncate">{selected.title}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                    </Listbox.Button>

                                    <Transition
                                    show={open}
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    >
                                    <Listbox.Options className="absolute z-10 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                        {cards.map((card) => (
                                        <Listbox.Option
                                            key={card.tokenId}
                                            className={({ active }) =>
                                            classNames(
                                                active ? 'text-white bg-indigo-600' : 'text-gray-900',
                                                'relative cursor-default select-none py-2 pl-3 pr-9'
                                            )
                                            }
                                            value={card.title}
                                        >
                                            {({ selected, active }) => (
                                            <>
                                                <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                                                {card.title}
                                                </span>

                                                {selected ? (
                                                <span
                                                    className={classNames(
                                                    active ? 'text-white' : 'text-indigo-600',
                                                    'absolute inset-y-0 right-0 flex items-center pr-4'
                                                    )}
                                                >
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                                ) : null}
                                            </>
                                            )}
                                        </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                    </Transition>
                                </div>
                                <BaseButton text={"Continue to 3ID ->"} color={"dark"} onClick={() => submit(selected, {method: 'post'})} />

                            </div>
                            </>
                        )}
                        </Listbox>
                </div>
            </div>
        )
    }

    // NO INVITES

    if (typeof window === 'undefined') {
        return null;
    }

    const { disconnect } = useDisconnect()
    const { connector, isConnected } = useAccount()
    let navigate = useNavigate();
    let submit = useSubmit();


    useEffect(() => {
        if (!isConnected) {
            submit(null, {action: "/auth/signout", method: 'post'})
            // navigate("/auth");
        }
    }, [connector])

    if (!isConnected || typeof window === 'undefined') {
        return (
            <div className="gate justify-center items-center">
                <Spinner />
            </div>
        )
    } else {

        return (
            <div className="gate justify-center items-center">
                <img className="m-auto pb-12" src={sad}/>
                <p className="auth-message">
                    Your wallet does not hold an invite token.
                </p>
                <p className="auth-secondary-message">
                    If you want to get an early access please join our Discord.
                </p>
                <div className="error-buttons grid grid-rows-2 lg:grid-cols-2">
                    <BaseButton text={"Try Different Wallet"} color={"dark"} onClick={() => {
                        disconnect()
                    }} />
                    <BaseButtonAnchor text={"Join Discord"} color={"light"} href={"https://discord.gg/threeid"} />
                </div>
            </div>
        )
    }
}