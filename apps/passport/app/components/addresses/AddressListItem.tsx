import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Pill } from '@proofzero/design-system/src/atoms/pills/Pill'
import { PrimaryPill } from '@proofzero/design-system/src/atoms/pills/PrimaryPill'
import { IconPill } from '@proofzero/design-system/src/atoms/pills/IconPill'

import appleIcon from '@proofzero/design-system/src/assets/social_icons/apple.svg'
import discordIcon from '@proofzero/design-system/src/assets/social_icons/discord.svg'
import githubIcon from '@proofzero/design-system/src/assets/social_icons/github.svg'
import googleIcon from '@proofzero/design-system/src/assets/social_icons/google.svg'
import microsoftIcon from '@proofzero/design-system/src/assets/social_icons/microsoft.svg'
import twitterIcon from '@proofzero/design-system/src/assets/social_icons/twitter.svg'

import { OAuthAddressType } from '@proofzero/types/address'

import {
  HiDotsHorizontal,
  HiOutlineEyeOff,
  HiOutlinePencilAlt,
  HiOutlineStar,
  HiOutlinePhotograph,
  HiOutlineTrash,
} from 'react-icons/hi'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

import { getProfileTypeTitle } from '../../utils/profile'

type AddressListItemIconProps = {
  type: string
  iconUrl?: string
}

export const getDefaultIconUrl = (type: string) => {
  switch (type) {
    case OAuthAddressType.Apple:
      return appleIcon
    case OAuthAddressType.Discord:
      return discordIcon
    case OAuthAddressType.GitHub:
      return githubIcon
    case OAuthAddressType.Google:
      return googleIcon
    case OAuthAddressType.Microsoft:
      return microsoftIcon
    case OAuthAddressType.Twitter:
      return twitterIcon
  }
}

export const AddressListItemIcon = ({
  type,
  iconUrl,
}: AddressListItemIconProps) => (
  <div className="rounded-full w-8 h-8 flex justify-center items-center bg-gray-200 overflow-hidden">
    <img
      src={iconUrl || getDefaultIconUrl(type)}
      alt="Not Found"
      className="object-cover"
    />
  </div>
)

export type AddressListItemProps = {
  id: string
  icon?: string
  title: string
  type: string
  address: string
  primary?: boolean
  hidden?: boolean
  disconnected?: boolean
  showReconnectAccount: boolean
  onRenameAccount?: (id: string) => void
  onChangeAvatar?: (id: string) => void
  onSetPrimary?: (id: string) => void
  onSetPrivate?: (id: string) => void
  onDisconnect?: (id: string) => void
}
export const AddressListItem = ({
  id,
  icon,
  title,
  type,
  address,
  disconnected,
  primary = false,
  hidden = false,
  showReconnectAccount = true,
  onRenameAccount,
  onChangeAvatar,
  onSetPrimary,
  onSetPrivate,
  onDisconnect,
}: AddressListItemProps) => {
  const hasBehavior =
    onRenameAccount ||
    onChangeAvatar ||
    onSetPrimary ||
    onSetPrivate ||
    onDisconnect

  const reconnectAccount = (type: string) => {
    const url = new URL(window.location.href)
    url.search = ''

    const qp = new URLSearchParams()
    qp.append('rollup_action', 'reconnect')
    qp.append('client_id', 'passport')
    qp.append('state', 'skip')
    qp.append('login_hint', type)
    qp.append('redirect_uri', url.toString())
    window.location.href = `/authorize?${qp.toString()}`
  }

  return (
    <div className="flex flex-row w-full items-center">
      <section className="mx-3">
        <AddressListItemIcon type={type} iconUrl={icon} />
      </section>

      <section className="flex-1 flex flex-col space-y-1.5">
        <div className="flex flex-row items-center space-x-2 ">
          <Text size="base" weight="semibold" className="text-gray-800">
            {title}
          </Text>

          {primary && <PrimaryPill text="Primary" />}

          {hidden && <IconPill Icon={HiOutlineEyeOff} />}

          {disconnected && (
            <Pill className="flex flex-row items-center bg-orange-50 rounded-xl">
              <Text size="xs" weight="medium" className="text-orange-500">
                No Connection
              </Text>
            </Pill>
          )}
        </div>

        <div className="flex flex-row">
          <Text size="xs" weight="normal" className="text-gray-500 break-all">
            {disconnected && address}
            {!disconnected && (
              <>
                {getProfileTypeTitle(type)} • {address}
              </>
            )}
          </Text>
        </div>
      </section>

      {disconnected && showReconnectAccount && (
        <section className="flex mx-5">
          <Button
            btnType="secondary-alt"
            onClick={() => reconnectAccount(type)}
          >
            Reconnect
          </Button>
        </section>
      )}

      {!disconnected && hasBehavior && (
        <section className="p-1.5 relative">
          {/* Menu could be injected from outside */}
          <Menu>
            <Menu.Button>
              <div className="w-10 h-10 rounded-lg hover:bg-gray-100 focus:bg-gray-100 flex justify-center items-center cursor-pointer">
                <HiDotsHorizontal className="text-lg text-gray-500" />
              </div>
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
              <Menu.Items className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                {onRenameAccount ||
                onChangeAvatar ||
                (onSetPrimary && !primary) ? (
                  <div className="p-1">
                    {onRenameAccount && (
                      <Menu.Item
                        as="div"
                        className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                      hover:rounded-[6px] hover:bg-gray-100 focus:bg-gray-100"
                        onClick={() => {
                          onRenameAccount(id)
                        }}
                      >
                        <HiOutlinePencilAlt className="text-xl font-normal text-gray-600" />

                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-700"
                        >
                          Rename Account
                        </Text>
                      </Menu.Item>
                    )}

                    {onChangeAvatar && (
                      <Menu.Item
                        as="div"
                        className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                      hover:bg-gray-100 focus:bg-gray-100 hover:rounded-[6px]"
                        onClick={() => {
                          onChangeAvatar(id)
                        }}
                      >
                        <HiOutlinePhotograph className="text-xl font-normal text-gray-600" />

                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-700"
                        >
                          Change Avatar
                        </Text>
                      </Menu.Item>
                    )}

                    {onSetPrimary && !primary && (
                      <Menu.Item
                        as="div"
                        className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                      hover:bg-gray-100 focus:bg-gray-100 hover:rounded-[6px]"
                        onClick={() => {
                          onSetPrimary(id)
                        }}
                      >
                        <HiOutlineStar className="text-xl font-normal text-gray-600" />

                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-700"
                        >
                          Set as Primary
                        </Text>
                      </Menu.Item>
                    )}

                    {onSetPrivate && (
                      <Menu.Item
                        as="div"
                        className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                       hover:bg-gray-100 hover:rounded-[6px] focus:bg-gray-100"
                        onClick={() => {
                          onSetPrivate(id)
                        }}
                      >
                        <HiOutlineEyeOff className="text-xl font-normal text-gray-600" />

                        <Text
                          size="sm"
                          weight="normal"
                          className="text-gray-700"
                        >
                          Set as Private
                        </Text>
                      </Menu.Item>
                    )}
                  </div>
                ) : null}

                <div className="p-1">
                  {onDisconnect && (
                    <Menu.Item
                      as="div"
                      className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                      hover:bg-gray-100 hover:rounded-[6px] focus:bg-gray-100"
                      onClick={() => {
                        onDisconnect(id)
                      }}
                    >
                      <HiOutlineTrash className="text-xl font-normal text-red-500" />

                      <Text size="sm" weight="normal" className="text-red-500">
                        Disconnect
                      </Text>
                    </Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </section>
      )}
    </div>
  )
}
