import { Menu, Transition } from '@headlessui/react'
import { Pill } from '@proofzero/design-system/src/atoms/pills/Pill'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { ServicePlanType } from '@proofzero/types/billing'
import { Fragment } from 'react'
import { HiDotsVertical, HiOutlineCog } from 'react-icons/hi'
import { HiOutlineTrash } from 'react-icons/hi2'

type ApplicationListItemPublishedStateProps = {
  published?: boolean
}
export const ApplicationListItemPublishedState = ({
  published,
}: ApplicationListItemPublishedStateProps) => (
  <span
    className={`rounded-full w-2 h-2 ${
      published ? 'bg-green-400' : 'bg-gray-300'
    }`}
  ></span>
)

type ApplicationListItemIconProps = {
  title: string
  iconUrl?: string
}
export const ApplicationListItemIcon = ({
  title,
  iconUrl,
}: ApplicationListItemIconProps) => (
  <div className="rounded-l w-16 h-14 flex justify-center items-center bg-gray-200 overflow-hidden">
    {!iconUrl && (
      <Text className="text-gray-500">{title?.substring(0, 1)}</Text>
    )}
    {iconUrl && <img src={iconUrl} alt="Not Found" className="object-cover" />}
  </div>
)

export type ApplicationListItemProps = {
  id: string
  name?: string
  createdTimestamp?: number
  icon?: string
  published?: boolean
  hasCustomDomain: boolean
  appPlan: ServicePlanType
  groupName?: string
  groupID?: string
  navigate?: (clientId: string) => void
  onDeleteApplication?: (
    clientId: string,
    appName: string,
    hasCustomDomain: boolean
  ) => void
}
export const ApplicationListItem = ({
  id,
  name,
  createdTimestamp,
  icon,
  published,
  hasCustomDomain,
  onDeleteApplication,
  navigate,
  appPlan,
}: ApplicationListItemProps) => (
  <article className="flex justify-center items-center border border-gray-200 shadow-sm rounded bg-white">
    <section>
      <ApplicationListItemIcon title={name ?? ''} iconUrl={icon} />
    </section>

    <section className="px-4 flex-1">
      <div className="flex flex-row space-x-2 items-center">
        <Text size="sm" weight="medium" className="text-gray-900">
          <span
            onClick={() => {
              if (navigate) navigate(id)
            }}
            className="hover:underline cursor-pointer"
          >
            {name}
          </span>
        </Text>
        <ApplicationListItemPublishedState published={published} />
        {appPlan !== ServicePlanType.FREE ? (
          <Pill className="border rounded-3xl py-none">
            <Text size="xs">{appPlan}</Text>
          </Pill>
        ) : null}
      </div>

      <Text size="sm" weight="normal" className="text-gray-400">
        {createdTimestamp && new Date(createdTimestamp).toDateString()}
      </Text>
    </section>

    <section className="p-1.5 relative">
      {/* Menu could be injected from outside */}
      <Menu>
        <Menu.Button>
          <div
            className="w-8 h-8 flex justify-center items-center cursor-pointer
          hover:bg-gray-100 hover:rounded-[6px]"
          >
            <HiDotsVertical className="text-lg text-gray-400" />
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
          <Menu.Items
            className="absolute z-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100
          rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y
           divide-gray-100"
          >
            <div className="p-1 ">
              <div
                onClick={() => {
                  if (navigate) navigate(id)
                }}
                className="cursor-pointer"
              >
                <Menu.Item
                  as="div"
                  className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                  hover:rounded-[6px] hover:bg-gray-100"
                >
                  <HiOutlineCog className="text-xl font-normal text-gray-400" />
                  <Text size="sm" weight="normal" className="text-gray-700">
                    Settings
                  </Text>
                </Menu.Item>
              </div>
            </div>

            <div className="p-1">
              <Menu.Item
                as="div"
                className="py-2 px-4 flex items-center space-x-3 cursor-pointer
                hover:rounded-[6px] hover:bg-gray-100 "
                onClick={() => {
                  if (onDeleteApplication) {
                    onDeleteApplication(id, name ?? '', hasCustomDomain)
                  }
                }}
              >
                <HiOutlineTrash className="text-xl font-normal text-red-500" />

                <Text size="sm" weight="normal" className="text-red-500">
                  Delete Application
                </Text>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </section>
  </article>
)
