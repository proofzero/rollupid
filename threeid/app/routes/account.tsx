import { redirect } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";

import { Outlet } from "@remix-run/react";

import { Fragment, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";

import { HiOutlineHome, HiOutlineViewGridAdd } from "react-icons/hi";

import { BiLink, BiIdCard, BiCog } from "react-icons/bi";

// TODO: migrate the above to hi2
//https://github.com/react-icons/react-icons/issues/597
// import {
//   HiBars3,
//   HiOutlineSquaresPlus,
//   HiXMark,
// } from "react-icons/hi2";
import {
  Bars3Icon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { getUserSession } from "~/utils/session.server";

import { oortSend } from "~/utils/rpc.server";

import styles from "~/styles/account.css";
import HeadNav from "~/components/head-nav";
import { links as buttonStyles } from "~/components/base-button";
import { links as faqStyles } from "~/components/FAQ";
import { links as invCodeStyles } from "~/components/invite-code";

import SideNav from "~/components/side-nav/SideNav";

export function links() {
  return [
    ...invCodeStyles(),
    ...buttonStyles(),
    ...faqStyles(),
    { rel: "stylesheet", href: styles },
  ];
}

// @ts-ignore
export const loader = async ({ request }) => {
  const session = await getUserSession(request);
  if (!session || !session.has("jwt")) {
    return redirect("/auth");
  }
  // gate with invites only
  const claimsRes = await oortSend(
    "kb_getCoreClaims",
    [],
    session.get("address"), // TODO: remove when RPC url is changed
    session.get("jwt"),
    request.headers.get("Cookie")
  );

  if (!claimsRes.result.includes("3id.enter")) {
    return redirect(`/auth/gate/${session.get("address")}`);
  }
  return null;
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AccountLayout() {
  useLoaderData();
  let submit = useSubmit();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // TODO: sort out layout component

  // TODO: port over welcome screen

  return (
    <>
      <div className="min-h-full">
        <div className="header">
          <HeadNav />
        </div>

        <main className="-mt-72">
          <div className="mx-auto max-w-screen-xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
            <div className="overflow-hidden bg-white shadow">
              <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                <SideNav />

                <div className="divide-y divide-gray-200 lg:col-start-3 lg:col-end-13 p-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
