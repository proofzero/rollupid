import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { PrimaryPill } from '@kubelt/design-system/src/atoms/pills/PrimaryPill'
import { IconPill } from '@kubelt/design-system/src/atoms/pills/IconPill'
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

type AddressListItemIconProps = {
  iconUrl: string
}
export const AddressListItemIcon = ({ iconUrl }: AddressListItemIconProps) => (
  <div className="rounded-full w-8 h-8 flex justify-center items-center bg-gray-200 overflow-hidden">
    <img src={iconUrl} className="object-cover" />
  </div>
)

export type AddressListItemProps = {
  id: string
  icon: string
  title: string
  wallet: string
  network: string
  chain: string
  address: string
  primary?: boolean
  hidden?: boolean
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
  wallet,
  network,
  chain,
  address,
  primary = false,
  hidden = false,
  onRenameAccount,
  onChangeAvatar,
  onSetPrimary,
  onSetPrivate,
  onDisconnect,
}: AddressListItemProps) => (
  <article className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white p-4">
    <section className="mx-4">
      <AddressListItemIcon iconUrl={icon} />
    </section>

    <section className="flex-1 flex flex-col space-y-1.5">
      <div className="flex flex-row items-center space-x-2">
        <Text size="base" weight="semibold" className="text-gray-800">
          {title}
        </Text>

        {primary && <PrimaryPill text="Primary" />}

        {hidden && <IconPill Icon={HiOutlineEyeOff} />}
      </div>

      <div className="flex flex-row">
        <Text size="xs" weight="normal" className="text-gray-500">
          {wallet} • {network} {chain} • {address}
        </Text>
      </div>
    </section>

    <section className="p-1.5 relative">
      {/* Menu could be injected from outside */}
      <Menu>
        <Menu.Button>
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex justify-center items-center cursor-pointer">
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
            <div className="p-1">
              {onRenameAccount && (
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    onRenameAccount(id)
                  }}
                >
                  <HiOutlinePencilAlt className="text-xl font-normal text-gray-600" />

                  <Text size="sm" weight="normal" className="text-gray-700">
                    Rename Account
                  </Text>
                </Menu.Item>
              )}

              {onChangeAvatar && (
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    onChangeAvatar(id)
                  }}
                >
                  <HiOutlinePhotograph className="text-xl font-normal text-gray-600" />

                  <Text size="sm" weight="normal" className="text-gray-700">
                    Change Avatar
                  </Text>
                </Menu.Item>
              )}

              {onSetPrimary && (
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    onSetPrimary(id)
                  }}
                >
                  <HiOutlineStar className="text-xl font-normal text-gray-600" />

                  <Text size="sm" weight="normal" className="text-gray-700">
                    Set as Primary
                  </Text>
                </Menu.Item>
              )}

              {onSetPrivate && (
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer"
                  onClick={() => {
                    onSetPrivate(id)
                  }}
                >
                  <HiOutlineEyeOff className="text-xl font-normal text-gray-600" />

                  <Text size="sm" weight="normal" className="text-gray-700">
                    Set as Private
                  </Text>
                </Menu.Item>
              )}
            </div>

            <div className="p-1">
              {onDisconnect && (
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer"
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
  </article>
)
