
import { Fragment, useState  } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Link } from "@remix-run/react";

import ConditionalTooltip from "~/components/conditional-tooltip";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

import {
  HiOutlineBell,
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
  XMarkIcon,
} from '@heroicons/react/24/outline'

import logo from "~/assets/three-id-logo-white.svg";
import defaultAvatar from "~/assets/circle_gradient.png";
import SignOutLink from "~/components/sign-out-link";

import styles from "./headNav.css";

export const links = () => [{ rel: "stylesheet", href: styles }];

const navigation = [
    { name: 'My Profile', to: "", disabled: true, current: false },
    { name: 'inb0x', to: "", disabled: true, current: false },
    { name: 'b0x', to: "", disabled: true, current: false },
    { name: 'Account', to:'/account', current: true },
]
// TODO: this should be it's own component. These are also function calls not links
const userNavigation = [
    // { name: 'Copy Address', href: '#' },
    // { name: 'Account', href: '#' },
    { name: 'Sign out', component: SignOutLink },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const user = {
    imageUrl: defaultAvatar
}

export default function HeadNav() {

    return (
        <Disclosure as="nav">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10"
                            src={logo}
                            alt="3ID"
                          />
                        </div>
                        <div className="hidden md:block">
                          <div className="ml-10 flex items-baseline space-x-4">
                            {navigation.map((item) => ( 
                              // TODO: convert to NavLink to remove "disabled" and "current" https://remix.run/docs/en/v1/api/remix#navlink
                                <Link
                                  key={item.name}
                                  to={item.to}
                                  className={classNames(
                                    item.current
                                      ? 'bg-gray-800 text-white'
                                      : 'text-gray-700 hover:bg-gray-700 hover:text-white',
                                    'px-3 py-2 text-sm font-medium nav-link-text'
                                  )}
                                  aria-current={item.current ? 'page' : undefined}
                                >
                                  <ConditionalTooltip  content="Coming Soon" condition={!item.current}>

                                    <Text
                                      size={TextSize.SM}
                                      weight={TextWeight.Medium500}
                                      color={item.current ? TextColor.White: TextColor.Gray700}
                                    >
                                      {item.name}
                                    </Text>
                                  </ConditionalTooltip>

                                </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                          <button
                            type="button"
                            className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                          >
                            <span className="sr-only">View notifications</span>
                            <HiOutlineBell className="h-6 w-6" aria-hidden="true" />
                          </button>

                          {/* Profile dropdown */}
                          <Menu as="div" className="relative ml-3">
                            <div>
                              <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                <span className="sr-only">Open user menu</span>
                                <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                              </Menu.Button>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {userNavigation.map((item) => (
                                  <Menu.Item key={item.name}>
                                    {({ active }) => (
                                      <item.component
                                        className={classNames(
                                          active ? 'bg-gray-100' : '',
                                          'block px-4 py-2 text-sm text-gray-700'
                                        )}
                                      />
                                    )}
                                  </Menu.Item>
                                ))}
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </div>
                      <div className="-mr-2 flex md:hidden">
                        {/* Mobile menu button */}
                        <Disclosure.Button className="inline-flex items-center justify-center bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="sr-only">Open main menu</span>
                          {open ? (
                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                          ) : (
                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                          )}
                        </Disclosure.Button>
                      </div>
                    </div>
                </div>

                <Disclosure.Panel className="border-b border-gray-700 md:hidden">
                  <div className="space-y-1 px-2 py-3 sm:px-3">
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'block px-3 py-2 text-base font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-4 pb-3">
                    <div className="flex items-center px-5">
                      <div className="flex-shrink-0">
                        <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium leading-none text-white">{user.name}</div>
                        <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">View notifications</span>
                        <HiOutlineBell className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                      {userNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as={item.component}
                          className="block px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        />
                      ))}
                    </div>
                  </div>
                </Disclosure.Panel>
              </>
            )}
        </Disclosure>
    )
}