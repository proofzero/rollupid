import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import {
  HiDotsVertical,
  HiOutlinePencilAlt,
  HiArrowRight,
} from 'react-icons/hi'
import { Link, useFetcher } from '@remix-run/react'
import { Fragment, useEffect, useState } from 'react'
import _ from 'lodash'
import ExternalAppDataPackages from '@proofzero/utils/externalAppDataPackages'
import { FaCheck, FaTimes } from 'react-icons/fa'
import { Menu, Transition } from '@headlessui/react'
import { AppLoaderData } from '~/root'
import AppDataStorageModal from '../AppDataStorageModal/AppDataStorageModal'

const AppDataStorageUsageTable: React.FC<{
  apps: AppLoaderData[]
}> = ({ apps }) => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<AppLoaderData | undefined>()

  const fetcher = useFetcher()
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      setIsSubscriptionModalOpen(false)
    }
  }, [fetcher])

  return (
    <>
      {selectedApp && isSubscriptionModalOpen && (
        <AppDataStorageModal
          isOpen={isSubscriptionModalOpen}
          onClose={() => setIsSubscriptionModalOpen(false)}
          subscriptionFetcher={fetcher}
          clientID={selectedApp.clientId!}
          currentPackage={
            selectedApp.externalAppDataPackage?.definition.packageDetails
              .packageType
          }
          topUp={selectedApp.externalAppDataPackage?.definition.autoTopUp}
          currentPrice={
            selectedApp.externalAppDataPackage?.definition.packageDetails.price
          }
          reads={selectedApp.externalAppDataPackage?.usage?.readUsage}
          writes={selectedApp.externalAppDataPackage?.usage?.writeUsage}
          readTopUp={selectedApp.externalAppDataPackage?.usage?.readTopUp}
          writeTopUp={selectedApp.externalAppDataPackage?.usage?.writeTopUp}
        />
      )}

      {apps.length === 0 ? (
        <Text>No apps with usage based billing features</Text>
      ) : (
        <table className="min-w-full table-auto border">
          <thead className="bg-gray-50">
            <tr className="rounded-tl-lg">
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Application
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Service
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Active packages
                </Text>
              </th>
              <th className="px-6 py-3 text-left">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Auto top-up
                </Text>
              </th>
              <th className="px-6 py-3 text-right">
                <Text
                  size="xs"
                  weight="medium"
                  className="uppercase text-gray-500"
                >
                  Action
                </Text>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {apps.map((app) => (
              <tr>
                <td className="px-6 py-3">
                  <div className=" flex items-center gap-2">
                    <Text size="sm" className="text-gray-500">
                      {app.name}
                    </Text>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    App Data Storage
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    {`${
                      ExternalAppDataPackages[
                        app.externalAppDataPackage!.definition.packageDetails
                          .packageType
                      ].title
                    } Package`}
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <Text size="sm" className="text-gray-500">
                    {app.externalAppDataPackage!.definition.autoTopUp ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </Text>
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end">
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
                        <Menu.Items className="absolute z-10 right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="p-1 ">
                            <div
                              onClick={() => {
                                setSelectedApp(app)
                                setIsSubscriptionModalOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Menu.Item
                                as="div"
                                className="py-2 px-4 flex items-center space-x-3 cursor-pointer
            hover:rounded-[6px] hover:bg-gray-100"
                              >
                                <HiOutlinePencilAlt className="text-xl font-normal text-gray-400" />
                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-700"
                                >
                                  Edit Package
                                </Text>
                              </Menu.Item>
                            </div>
                          </div>

                          <div className="p-1">
                            <Menu.Item
                              as="div"
                              className="py-2 px-4 flex items-center space-x-3 cursor-pointer
          hover:rounded-[6px] hover:bg-gray-100"
                            >
                              <HiArrowRight className="text-xl font-normal text-gray-400" />
                              <Link
                                to={`/apps/${app.clientId}/storage/ostrich`}
                              >
                                <Text
                                  size="sm"
                                  weight="normal"
                                  className="text-gray-700"
                                >
                                  Go to Application
                                </Text>
                              </Link>
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default AppDataStorageUsageTable
