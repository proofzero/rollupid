import { redirect } from "@remix-run/cloudflare";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";

import { Outlet } from "@remix-run/react";

import { Fragment, useState  } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'

import {
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineKey,
  HiOutlineHome,
} from "react-icons/hi";

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
} from '@heroicons/react/24/outline'

import { getUserSession } from "~/utils/session.server";

import { oortSend } from "~/utils/rpc.server";

import styles from "~/styles/account.css";
import HeadNav from "~/components/head-nav";
import BaseButton, { links as buttonStyles } from "~/components/base-button";

export function links() {
  return [
    ...buttonStyles(),
    { rel: "stylesheet", href: styles },
  ];
}

// @ts-ignore
export const loader = async ({ request }) => {
  const session = await getUserSession(request);
  if (!session.has("jwt")) {
    return redirect("/auth");
  }
  return null;
};

const subNavigation = [
  { name: 'Dashboard', href: '#', icon: HiOutlineHome, current: true },
  { name: 'NFT Gallery', href: '#', icon: SquaresPlusIcon, current: false },
  { name: 'KYC', href: '#', icon: HiOutlineKey, current: false },
  { name: '0xAuth', href: '#', icon: HiOutlineKey, current: false },
  { name: 'Settings', href: 'settings', icon: HiOutlineCog, current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function AccountLayout() {
  useLoaderData();
  let submit = useSubmit();

  const [sidebarOpen, setSidebarOpen] = useState(false)


  // TODO: sort out layout component

  // TODO: port over welcome screen

  return (<>
    <div className="min-h-full">
        <div className="header">
          <HeadNav />
        </div>

        <main className="-mt-72">
          <div className="mx-auto max-w-screen-xl px-4 pb-6 sm:px-6 lg:px-8 lg:pb-16">
            <div className="overflow-hidden bg-white shadow">
              <div className="divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x">
                <aside className="py-6 lg:col-span-3">
                  <nav className="space-y-1">
                    {subNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-teal-50 border-teal-500 text-teal-700 hover:bg-teal-50 hover:text-teal-700'
                            : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                          'group border-l-4 px-3 py-2 flex items-center text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-teal-500 group-hover:text-teal-500'
                              : 'text-gray-400 group-hover:text-gray-500',
                            'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </aside>
                <div className="divide-y divide-gray-200 lg:col-span-9 p-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )

}


