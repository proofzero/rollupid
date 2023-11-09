/**
 * @file app/shared/components/SiteHeader/index.tsx
 */

import { Form, SubmitFunction } from '@remix-run/react'
import { gatewayFromIpfs } from '@proofzero/utils'
import { Avatar } from '@proofzero/design-system/src/atoms/profile/avatar/Avatar'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

import { ConsoleLogo } from '../SiteMenu'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiOutlineBookOpen, HiOutlineLogout } from 'react-icons/hi'
import { TbBook, TbBrandGithub, TbUserCog } from 'react-icons/tb'
import { PostHog } from 'posthog-js'

// RollupHeader
// -----------------------------------------------------------------------------

type RollupHeaderProps = {
  avatarUrl: string
  displayName: string
  passportURL: string
  submit: SubmitFunction
  posthog?: PostHog
}

export default function RollupHeader(props: RollupHeaderProps) {
  return (
    <header className="w-full min-h-[80px] h-[80px] bg-gray-900 lg:bg-white lg:border-b lg:shadow flex items-center justify-start lg:justify-end px-2 sm:max-md:px-5 md:px-10">
      <div className="lg:hidden">
        <ConsoleLogo />
      </div>

      <section className="mr-6 flex-row gap-2 items-center hidden lg:flex">
        <a
          href="https://github.com/proofzero/rollupid"
          className="p-1 hover:bg-gray-100 rounded"
        >
          <TbBrandGithub className="text-gray-500 w-5 h-5" />
        </a>

        <a
          href="https://docs.rollup.id"
          className="p-1 hover:bg-gray-100 rounded"
        >
          <TbBook className="text-gray-500 w-5 h-5" />
        </a>
      </section>

      <Form action="/signout" method="post" className="hidden lg:block">
        <Menu as="div" className="relative ml-3">
          <div>
            <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm">
              <span className="sr-only">Open user menu</span>
              <Avatar src={gatewayFromIpfs(props.avatarUrl) || ''} size="xs" />
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
            <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none rounded-lg">
              <Menu.Item>
                <div className="pl-3 pr-2 py-2 flex flex-col w-full">
                  <div className="flex flex-col items-center justify-center my-4 gap-3">
                    <Avatar size="xs" src={props.avatarUrl} />
                    <Text
                      size="base"
                      weight="medium"
                      className="max-w-[144px] truncate"
                    >
                      {props.displayName}
                    </Text>
                  </div>
                </div>
              </Menu.Item>
              <Menu.Item
                as="a"
                href="https://docs.rollup.id"
                target="_blank"
                onClick={() => {
                  close()
                }}
                className="p-3 hover:bg-gray-100 w-full text-left flex gap-3 items-center border-t text-gray-700 cursor-pointer"
              >
                <HiOutlineBookOpen className="w-5 h-5 text-gray-400" />
                <Text size="sm">Documentation</Text>
              </Menu.Item>
              <Menu.Item
                as="a"
                href={props.passportURL}
                target="_blank"
                onClick={() => {
                  close()
                }}
                className="p-3 hover:bg-gray-100 w-full text-left flex gap-3 items-center border-t text-gray-700 cursor-pointer"
              >
                <TbUserCog className="w-5 h-5 text-gray-400" />
                <Text size="sm">User Settings</Text>
              </Menu.Item>
              <Menu.Item
                as="button"
                className="p-3 hover:bg-gray-100 rounded-b-lg w-full text-left flex gap-3 items-center border-t text-red-500 cursor-pointer"
                onClick={() => {
                  close()
                  props.posthog?.reset()
                  props.submit(null, { method: 'post', action: '/signout/' })
                }}
              >
                <HiOutlineLogout size={22} className="w-5 h-5" />
                <Text className="truncate" size="sm" weight="medium">
                  Sign Out
                </Text>
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </Form>
    </header>
  )
}
