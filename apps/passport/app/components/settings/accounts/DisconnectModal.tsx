import { useFetcher, Link } from '@remix-run/react'

import { useEffect, useState } from 'react'

import { Text } from '@proofzero/design-system'
import { Loader } from '@proofzero/design-system/src/molecules/loader/Loader'
import { Button } from '@proofzero/design-system'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'

import type { FetcherWithComponents } from '@remix-run/react'

import warn from '~/assets/warning.svg'
import { AccountURN, AccountURNSpace } from '@proofzero/urns/account'

import { FiExternalLink } from 'react-icons/fi'
import { HiChevronDown, HiChevronUp, HiOutlineX } from 'react-icons/hi'
import { ReferenceType } from '@proofzero/platform/account/src/types'

import { Disclosure } from '@headlessui/react'

export type AccountUsageDisconnectModel = {
  title?: string
  external: boolean
  path: string
  type: ReferenceType
}

const AccountUsageItem: React.FC<{
  setIsOpen: (open: boolean) => void
  aum: AccountUsageDisconnectModel
}> = ({ setIsOpen, aum }) => (
  <>
    <div className="w-full border-b border-gray-200"></div>
    <li className="flex flex-row py-3 px-6 bg-gray-50">
      <Text size="xs" weight="medium" className="text-gray-500 flex-1">
        {aum.title}
      </Text>

      {aum.external && (
        <a href={aum.path} target="_blank" onClick={() => setIsOpen(false)}>
          <Text
            size="xs"
            weight="medium"
            className="text-indigo-500 flex flex-row items-center space-x-2"
          >
            <span>Edit</span>
            <FiExternalLink className="text-indigo-500 w-3 h-3" />
          </Text>
        </a>
      )}

      {!aum.external && (
        <Link to={aum.path} onClick={() => setIsOpen(false)}>
          <Text size="xs" weight="medium" className="text-indigo-500 pr-5">
            <span>Edit</span>
          </Text>
        </Link>
      )}
    </li>
  </>
)

const ReferenceTypeDisclosure: React.FC<{
  setIsOpen: (open: boolean) => void
  aums: AccountUsageDisconnectModel[]
  referenceType: ReferenceType
  toggledReferenceType?: ReferenceType
  defaultOpen?: boolean
  handleToggle: (open: boolean) => void
}> = ({
  setIsOpen,
  aums,
  referenceType,
  handleToggle,
  toggledReferenceType,
  defaultOpen = false,
}) => {
  const DisclosureTitle: React.FC<{
    referenceType: ReferenceType
  }> = ({ referenceType }) => {
    switch (referenceType) {
      case ReferenceType.Authorization:
        return <>Address is being used for app(s) authorizations</>
      case ReferenceType.DevNotificationsEmail:
        return <>Email is being used as contact in Console</>
      case ReferenceType.BillingEmail:
        return <>Email is being used as billing email in Console</>
      default:
        return <>Unknown</>
    }
  }

  return (
    <>
      {aums.filter((aum) => aum.type === referenceType).length > 0 && (
        <Disclosure defaultOpen={defaultOpen}>
          {({ open, close }) => (
            <>
              {open &&
                toggledReferenceType &&
                toggledReferenceType !== referenceType &&
                close()}
              <Disclosure.Button
                className="flex flex-row items-center justify-between py-3 px-6 w-full"
                onClick={() => handleToggle(!open)}
              >
                <Text size="sm" className="text-gray-500">
                  <DisclosureTitle referenceType={referenceType} />
                </Text>

                {open ? (
                  <HiChevronUp className="h-6 w-6 text-indigo-500" />
                ) : (
                  <HiChevronDown className="h-6 w-6" />
                )}
              </Disclosure.Button>
              <Disclosure.Panel>
                {aums
                  .filter((aum) => aum.type === referenceType)
                  .map((aum, index) => (
                    <AccountUsageItem
                      key={index}
                      setIsOpen={setIsOpen}
                      aum={aum}
                    />
                  ))}
                <div className="w-full border-b border-gray-200"></div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      )}
    </>
  )
}

export default ({
  fetcher,
  isOpen,
  setIsOpen,
  id,
  data,
  primaryAccountURN,
}: {
  fetcher: FetcherWithComponents<any>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  id: string
  data: {
    title: string
    type: string
  }
  primaryAccountURN: AccountURN
}) => {
  const primaryAccountBaseURN = AccountURNSpace.getBaseURN(primaryAccountURN)
  const localFetcher = useFetcher<AccountUsageDisconnectModel[]>()

  useEffect(() => {
    if (!isOpen || id === primaryAccountBaseURN) {
      return
    }

    localFetcher.submit(
      {
        accountURN: id,
      },
      {
        method: 'post',
        action: '/settings/accounts/references',
      }
    )
  }, [id, primaryAccountBaseURN, isOpen])

  const canDisconnect =
    id !== primaryAccountBaseURN && localFetcher.data?.length === 0

  const [toggledReferenceType, setToggledReferenceType] =
    useState<ReferenceType>()
  const handleDiscolsureToggle = (
    open: boolean,
    referenceType: ReferenceType
  ) => setToggledReferenceType(open ? referenceType : undefined)

  return localFetcher.state !== 'idle' ? (
    <Loader />
  ) : (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`max-w-full w-[512px] relative bg-white text-left
        transition-all rounded-lg overflow-y-auto flex flex-col`}
      >
        <div className="flex flex-row space-x-4 p-6">
          <img src={warn} alt="Not Found" />

          <div
            className={`flex-1 flex flex-row ${
              canDisconnect ? 'items-center' : 'items-start'
            } justify-between`}
          >
            {canDisconnect && (
              <Text size="lg" weight="medium" className="text-gray-900">
                Disconnect account
              </Text>
            )}

            {!canDisconnect && (
              <div className="flex flex-col">
                <Text size="lg" weight="medium" className="text-gray-900">
                  You can't disconnect this account
                </Text>

                <Text size="sm" weight="normal" className="text-gray-500 mt-2">
                  You can't disconnect this account because:
                </Text>
              </div>
            )}
            <button
              className={`bg-white p-2 rounded-lg text-xl cursor-pointer
                      hover:bg-[#F3F4F6]`}
              onClick={() => {
                setIsOpen(false)
              }}
            >
              <HiOutlineX />
            </button>
          </div>
        </div>

        <div>
          {canDisconnect && (
            <Text size="sm" weight="normal" className="text-gray-500 px-6">
              Are you sure you want to disconnect {data.type} account
              {data.title && (
                <>
                  <span className="text-gray-800"> "{data.title}" </span>
                </>
              )}
              from Rollup? You might lose access to some functionality.
            </Text>
          )}

          {!canDisconnect && (
            <ul className="mb-6">
              {primaryAccountBaseURN === id && (
                <>
                  <div className="w-full border-b border-gray-200"></div>
                  <li className="py-3 px-6">
                    <Text size="sm" weight="normal" className="text-gray-500">
                      Primary account cannot be disconnected. You need to set
                      another account as primary before disconnecting this one.
                    </Text>
                  </li>
                </>
              )}

              {primaryAccountBaseURN !== id &&
                localFetcher.data &&
                localFetcher.data.length > 0 && (
                  <>
                    <ReferenceTypeDisclosure
                      setIsOpen={setIsOpen}
                      aums={localFetcher.data}
                      referenceType={ReferenceType.Authorization}
                      defaultOpen={true}
                      toggledReferenceType={toggledReferenceType}
                      handleToggle={(open) =>
                        handleDiscolsureToggle(
                          open,
                          ReferenceType.Authorization
                        )
                      }
                    />

                    <ReferenceTypeDisclosure
                      setIsOpen={setIsOpen}
                      aums={localFetcher.data}
                      referenceType={ReferenceType.DevNotificationsEmail}
                      toggledReferenceType={toggledReferenceType}
                      defaultOpen={
                        localFetcher.data.filter(
                          (el) => el.type === ReferenceType.Authorization
                        ).length === 0
                      }
                      handleToggle={(open) =>
                        handleDiscolsureToggle(
                          open,
                          ReferenceType.DevNotificationsEmail
                        )
                      }
                    />

                    <ReferenceTypeDisclosure
                      setIsOpen={setIsOpen}
                      aums={localFetcher.data}
                      referenceType={ReferenceType.BillingEmail}
                      toggledReferenceType={toggledReferenceType}
                      defaultOpen={
                        localFetcher.data.filter(
                          (el) =>
                            el.type === ReferenceType.DevNotificationsEmail
                        ).length === 0
                      }
                      handleToggle={(open) =>
                        handleDiscolsureToggle(open, ReferenceType.BillingEmail)
                      }
                    />
                  </>
                )}
              <div className="w-full border-b border-gray-200"></div>
            </ul>
          )}

          {canDisconnect && (
            <fetcher.Form
              method="post"
              action="/settings/accounts/disconnect"
              className="p-6"
            >
              <input type="hidden" name="id" value={id} />

              <div className="flex justify-end items-center space-x-3 mt-7">
                <Button
                  btnType="secondary-alt"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  btnType="dangerous"
                  disabled={!canDisconnect}
                >
                  Disconnect
                </Button>
              </div>
            </fetcher.Form>
          )}
        </div>
      </div>
    </Modal>
  )
}
