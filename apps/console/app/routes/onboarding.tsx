import { json, redirect, type LoaderFunction } from '@remix-run/cloudflare'
import onboardingImage from '../images/console_onboarding.svg'

import {
  Outlet,
  type ShouldRevalidateFunction,
  useLoaderData,
  useSubmit,
} from '@remix-run/react'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { requireJWT } from '~/utilities/session.server'
import { checkToken } from '@proofzero/utils/token'
import type { IdentityURN } from '@proofzero/urns/identity'
import createCoreClient from '@proofzero/platform-clients/core'
import { getEmailDropdownItems } from '@proofzero/utils/getNormalisedConnectedAccounts'
import { type DropdownSelectListItem } from '@proofzero/design-system/src/atoms/dropdown/DropdownSelectList'
import type { Profile } from '@proofzero/platform.identity/src/types'
import { Avatar, Text } from '@proofzero/design-system'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { HiOutlineBookOpen, HiOutlineLogout } from 'react-icons/hi'
import { TbUserCog } from 'react-icons/tb'
import useConnectResult from '@proofzero/design-system/src/hooks/useConnectResult'
import { Toaster } from '@proofzero/design-system/src/atoms/toast'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context }) => {
    const jwt = await requireJWT(request, context.env)
    const payload = checkToken(jwt!)
    const identityURN = payload.sub as IdentityURN

    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...generateTraceContextHeaders(context.traceSpan),
    })

    const spd = await coreClient.identity.getStripePaymentData.query({
      identityURN,
    })

    const profile = await coreClient.identity.getProfile.query({
      identity: identityURN,
    })

    if (spd?.email?.length) {
      return redirect('/')
    }

    const connectedAccounts = await coreClient.identity.getAccounts.query({
      identity: identityURN,
    })
    const connectedEmails = getEmailDropdownItems(connectedAccounts)

    return json({
      profile,
      connectedEmails,
      PASSPORT_URL: context.env.PASSPORT_URL,
    })
  }
)

// https://remix.run/docs/en/main/route/should-revalidate#actionresult
export const shouldRevalidate = ({
  actionResult,
  defaultShouldRevalidate,
}: {
  actionResult: { success: boolean }
  defaultShouldRevalidate: ShouldRevalidateFunction
}) => {
  if (actionResult?.success) {
    return false
  }
  return defaultShouldRevalidate
}

export default function Onboarding() {
  const { connectedEmails, PASSPORT_URL, profile } = useLoaderData<{
    connectedEmails: DropdownSelectListItem[]
    PASSPORT_URL: string
    profile: Profile
  }>()

  let currentPage = 0

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    const connectResult = url.searchParams.get('rollup_result')
    if (connectResult) {
      currentPage = 1
    }
  }

  useConnectResult()

  const submit = useSubmit()

  return (
    <div className="relative">
      <div
        className={`flex flex-row items-center justify-center h-[100dvh] bg-white dark:bg-gray-900`}
      >
        <div
          className={
            'basis-full 2xl:basis-2/5 flex items-start justify-center py-[2.5%] h-full'
          }
        >
          <Outlet context={{ connectedEmails, PASSPORT_URL, currentPage }} />
        </div>
        <div className="basis-3/5 h-[100dvh] w-full hidden 2xl:flex justify-end items-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <img
            className="max-h-fit mt-[10%]"
            alt="onboarding"
            src={onboardingImage}
          />
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />

      <Menu as="div" className="absolute top-7 right-7">
        {({ close }) => {
          return (
            <>
              <Menu.Button className={'rounded-full bg-gray-800'}>
                <Avatar size="xs" src={profile.pfp?.image!} />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className="absolute right-0 z-10 mt-2 w-56
                        origin-top-right bg-white shadow-lg
                        ring-1 ring-black ring-opacity-5 focus:outline-none rounded-lg"
                >
                  <Menu.Item>
                    <div className="pl-3 pr-2 py-2 flex flex-col w-full">
                      <div className="flex flex-col items-center justify-center my-4 gap-3">
                        <Avatar size="xs" src={profile.pfp?.image!} />
                        <Text
                          size="base"
                          weight="medium"
                          className="max-w-[144px] truncate"
                        >
                          {profile.displayName}
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
                    className="p-3 hover:bg-gray-100
        w-full text-left flex gap-3 items-center border-t text-gray-700 cursor-pointer"
                  >
                    <HiOutlineBookOpen className="w-5 h-5 text-gray-400" />
                    <Text size="sm">Documentation</Text>
                  </Menu.Item>
                  <Menu.Item
                    as="a"
                    href={PASSPORT_URL}
                    target="_blank"
                    onClick={() => {
                      close()
                    }}
                    className="p-3 hover:bg-gray-100
              w-full text-left flex gap-3 items-center border-t text-gray-700 cursor-pointer"
                  >
                    <TbUserCog className="w-5 h-5 text-gray-400" />
                    <Text size="sm">User Settings</Text>
                  </Menu.Item>
                  <Menu.Item
                    as="button"
                    className="p-3 hover:bg-gray-100 rounded-b-lg
        w-full text-left flex gap-3 items-center border-t text-red-500 cursor-pointer"
                    onClick={() => {
                      close()
                      submit(null, { method: 'post', action: '/signout/' })
                    }}
                  >
                    <HiOutlineLogout size={22} className="w-5 h-5" />
                    <Text className="truncate" size="sm" weight="medium">
                      Sign Out
                    </Text>
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </>
          )
        }}
      </Menu>
    </div>
  )
}
