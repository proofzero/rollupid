import { useFetcher } from '@remix-run/react'

import { Button, Text } from '@proofzero/design-system'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'
import UserPill from '@proofzero/design-system/src/atoms/pills/UserPill'

import { Disclosure } from '@headlessui/react'
import { useState } from 'react'

import passportLogoURL from '~/assets/PassportIcon.svg'
import { TbCrown } from 'react-icons/tb'
import { Modal } from '@proofzero/design-system/src/molecules/modal/Modal'
import warningImg from '~/assets/warning.svg'
import InputText from '~/components/inputs/InputText'
import { startCase } from 'lodash'
import { HiOutlineExternalLink } from 'react-icons/hi'

export const ConfirmRevocationModal = ({
  title,
  clientId,
  isOpen,
  setIsOpen,
}: {
  title: string
  clientId: string
  isOpen: boolean
  setIsOpen: (val: boolean) => void
}) => {
  const [confirmationString, setConfirmationString] = useState('')
  const fetcher = useFetcher()

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)}>
      <div
        className={`min-w-[260px] sm:min-w-[400px] md:max-w-[512px] lg:max-w-[512px]
       relative rounded-lg bg-white px-4 pb-4 text-left
      transition-all sm:px-6 sm:pb-6 overflow-y-auto`}
      >
        <div className="flex flex-row space-x-6 items-center justify-start">
          <img
            src={warningImg}
            className="object-cover w-10 h-10 rounded"
            alt="Not found"
          />

          <div className="flex flex-col space-y-2">
            <Text weight="medium" size="lg" className="text-gray-900">
              Revoke Access
            </Text>
            <Text size="xs" weight="normal">
              {`Are you sure you want to revoke access to ${title}? This action
                cannot be undone once confirmed.`}
            </Text>
          </div>
        </div>
        <div className="flex flex-col my-7 space-y-2">
          <InputText
            onChange={(text: string) => {
              setConfirmationString(text)
            }}
            heading="Type REVOKE to confirm*"
          />
        </div>

        <div className="flex justify-end items-center space-x-3">
          <Button
            btnType="secondary-alt"
            onClick={() => setIsOpen(false)}
            className="bg-gray-100"
          >
            Cancel
          </Button>

          <fetcher.Form
            action={`/settings/applications/${clientId}/revoke`}
            method="post"
          >
            <Button
              type="submit"
              btnType="dangerous-alt"
              disabled={confirmationString !== 'REVOKE'}
            >
              Revoke Access
            </Button>
          </fetcher.Form>
        </div>
      </div>
    </Modal>
  )
}

const AccountExpandedView = ({
  account,
  source,
  titleFieldName,
  titleFieldValue,
  addressFieldName,
  connectedAccounts = false
}: {
  account: {
    icon: string
    address: string
    type?: string
    title?: string
  }
  titleFieldName?: string
  titleFieldValue?: JSX.Element
  addressFieldName?: string
  source?: string
  connectedAccounts?: boolean
}) => {
  return <div className="flex flex-col gap-2 p-2.5 bg-white rounded-lg">
    {
      connectedAccounts &&
      <section className="flex flex-row gap-2 items-center">
        <img
          src={account.icon}
          className="rounded-full w-5 h-5"
        />

        <Text
          size="sm"
          weight="semibold"
          className="text-gray-800 truncate"
        >
          {account.address}
        </Text>
      </section>}

    {
      titleFieldName &&
      <div className="flex flex-row gap-1 items-center">
        <Text size="xs" weight="semibold" className="text-gray-500">
          {titleFieldName}:
        </Text>
        {titleFieldValue}
      </div>
    }

    <div className="flex flex-row gap-1 items-center">
      <Text size="xs" weight="semibold" className="text-gray-500">
        {addressFieldName}:
      </Text>
      <Text
        size="xs"
        weight="medium"
        className="text-gray-500 truncate"
      >
        {account.address}
      </Text>
    </div>

    <div className="flex flex-row gap-1 items-center">
      <Text size="xs" weight="semibold" className="text-gray-500">
        Source:
      </Text>
      <Text
        size="xs"
        weight="medium"
        className="text-gray-500 truncate"
      >
        {source}
      </Text>
    </div>
  </div>
}
// ------------------------------------------------------------------- MOBILE //
export const ClaimsMobileView = ({ scopes }: { scopes: any[] }) => {
  const RowView = ({
    account,
    appAskedFor,
    whatsBeingShared,
    sourceOfData,
    sourceOfDataIcon,
    dropdown = true
  }: {
    appAskedFor: string
    sourceOfData: string
    sourceOfDataIcon: JSX.Element
    dropdown?: boolean
    whatsBeingShared?: string
    account?: {
      address: string,
      icon: string
    }
  }) => {
    return <Disclosure as="div" className="focus-within:bg-gray-50">
      {({ open }) => (
        <div className="border border-gray-200 rounded-lg flex flex-col focus-within:bg-gray-50 w-full">
          {
            dropdown
              ? <Disclosure.Button as="button"
                className="flex flex-row items-center px-3.5 py-2">
                <section className="flex-1 flex flex-col gap-2.5">
                  <Text
                    size="sm"
                    weight="bold"
                    className="text-gray-800 text-start truncate"
                  >
                    {appAskedFor}
                  </Text>
                  {
                    whatsBeingShared &&
                    <Text size="sm"
                      weight="medium"
                      className="text-gray-500 text-start truncate">
                      {whatsBeingShared}
                    </Text>
                  }
                </section>
                {open ? (
                  <FaChevronDown className="w-[22px] h-[22px] text-indigo-500" />
                ) : (
                  <FaChevronRight className="w-[22px] h-[22px] text-gray-500" />
                )}
              </Disclosure.Button>
              : <div className="flex flex-row items-center px-3.5 py-2">
                <section className="flex-1 flex flex-col gap-2.5">
                  <Text
                    size="sm"
                    weight="bold"
                    className="text-gray-800 text-start truncate"
                  >
                    {appAskedFor}
                  </Text>
                  {
                    whatsBeingShared &&
                    <Text size="sm"
                      weight="medium"
                      className="text-start text-gray-500 truncate">
                      {whatsBeingShared}
                    </Text>
                  }
                </section>
                {sourceOfDataIcon}
              </div>
          }

          {dropdown &&
            <Disclosure.Panel>
              <div
                className="py-3.5 px-6 border shadow-inner">
                <Text
                  className="mb-2"
                  size="sm"
                  weight="medium"
                >{appAskedFor}</Text>
                <AccountExpandedView
                  account={account!}
                  titleFieldName='Picture'
                  titleFieldValue={
                    <div className='flex flex-row items-center'>
                      <img src={account!.icon} className='w-[22px] h-[22px] mr-2 rounded-full' />
                      <a href={account!.icon} className='text-sm
                       weight-medium text-indigo-500 
                       cursor-pointer flex flex-row items-center gap-1.5 hover:underline'
                        target='_blank'
                        rel='noreferrer' >
                        <Text size='sm' weight="medium" className='max-w-[200px] truncate'>
                          {account!.icon}
                        </Text>
                        <HiOutlineExternalLink />
                      </a>
                    </div>
                  }
                  addressFieldName='Name'
                  source={sourceOfData}
                />
              </div>
            </Disclosure.Panel>
          }
        </div>
      )}
    </Disclosure >
  }

  const ExpandableRowView = ({
    accounts,
    title,
    source,
    titleFieldName,
    addressFieldName,
    connectedAccounts = false,
    scWallets = false
  }: {
    accounts: Array<{
      icon: string
      address: string
      type: string
      title?: string
    }>
    title: string
    source?: string
    titleFieldName?: string,
    addressFieldName?: string
    connectedAccounts?: boolean
    scWallets?: boolean
  }) => {
    const [selectedAccount, setSelectedAccount] = useState<
      | {
        icon: string
        address: string
        type: string
        title?: string
      }
      | undefined
    >()

    return (
      <Disclosure>
        {({ open }) => (
          <div className="border border-gray-200 rounded-lg flex flex-col focus-within:bg-gray-50 w-full">
            <Disclosure.Button
              className="flex flex-row items-center px-3.5 py-2"
              onClick={() => {
                setSelectedAccount(undefined)
              }}
            >
              <section className="flex-1 flex flex-col gap-2.5">
                <Text
                  size="sm"
                  weight="bold"
                  className="text-gray-800 text-start"
                >
                  {title}
                </Text>
                {
                  scWallets
                    ? <Text
                      size="sm"
                      weight="medium"
                      className="text-start text-gray-500 truncate">
                      {accounts.map((a) => a.icon)!.length} Smart Contract Wallet(s)
                    </Text>
                    : <MultiAvatar avatars={accounts.map((a) => a.icon)!} />
                }
              </section>
              <section>
                {open ? (
                  <FaChevronDown className="w-[22px] h-[22px] text-indigo-500" />
                ) : (
                  <FaChevronRight className="w-[22px] h-[22px] text-gray-500" />
                )}
              </section>
            </Disclosure.Button>

            <Disclosure.Panel className="flex flex-col gap-3.5 px-3.5 py-2 pointer-events-none">
              <div className="w-full -mt-2">
                <div className="border-t border-gray-200"></div>
              </div>

              <section className="flex flex-row flex-wrap gap-2">
                {accounts.map((a, i) => (
                  <UserPill
                    key={i}
                    size={20}
                    text={scWallets ? a.title! : a.address}
                    avatarURL={a.icon}
                    onClick={() => setSelectedAccount(a)}
                    className={'pointer-events-auto'}
                  />
                ))}
              </section>

              {
                selectedAccount && (
                  <AccountExpandedView
                    account={selectedAccount}
                    source={
                      source
                        ? source
                        : `${startCase(selectedAccount.type)} - ${selectedAccount.address}`
                    }
                    titleFieldName={titleFieldName}
                    titleFieldValue={scWallets
                      ? <Text
                        size="xs"
                        weight="medium"
                        className="text-gray-500 truncate"
                      >
                        {selectedAccount.title}
                      </Text>
                      : undefined}
                    addressFieldName={addressFieldName}
                    connectedAccounts={connectedAccounts}
                  />
                )
              }
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {scopes.map((scope, i) => {
        switch (scope.claim) {
          case 'email':
            return <RowView
              key={i}
              appAskedFor='Email'
              whatsBeingShared={scope.address}
              sourceOfData={scope.address}
              sourceOfDataIcon={
                <img src={scope.icon} className="w-5 h-5 rounded-full" />
              }
              dropdown={false}
            />
          case 'connected_accounts':
            return <ExpandableRowView
              key={i}
              title={"Connected Accounts"}
              addressFieldName={"Address"}
              accounts={scope.accounts}
              connectedAccounts={true}
            />
          case 'system_identifiers':
            return <RowView
              appAskedFor='System Identifiers'
              sourceOfData='Rollup Identity'
              sourceOfDataIcon={
                <img src={passportLogoURL} className="w-5 h-5" />
              }
              key={i}
              dropdown={false}
            />
          case 'profile':
            return <RowView
              appAskedFor='Profile'
              whatsBeingShared='Picture, Name'
              sourceOfData='Primary Account'
              sourceOfDataIcon={
                <div className='flex items-center justify-center
                      w-5 h-5 bg-gray-50 rounded-full'>
                  <TbCrown className="text-[#F59E0B]" />
                </div>
              }
              key={i}
              account={scope.account}
            />
          case 'erc_4337':
            return <ExpandableRowView
              key={i}
              title="Smart Contract Wallet"
              accounts={scope.accounts}
              source='Smart Contract Wallet'
              titleFieldName='Wallet Name'
              addressFieldName='Wallet ID'
              scWallets={true}
            />
        }
      })}
    </div>
  )
}
// ----------------------------------------------------------------------- PC //
export const ClaimsWideView = ({ scopes }: { scopes: any[] }) => {
  const RowView = ({
    account,
    appAskedFor,
    whatsBeingShared,
    sourceOfData,
    sourceOfDataIcon,
    dropdown = true
  }: {
    appAskedFor: string
    sourceOfData: string
    sourceOfDataIcon: JSX.Element
    dropdown?: boolean
    whatsBeingShared?: string
    account?: {
      address: string,
      icon: string
    }
  }) => {
    return <Disclosure>
      {({ open }) => (
        <>
          <tr>
            <td className={`px-6 py-3 ${open ? `bg-gray-50` : ''}`}>
              {dropdown ?
                <Disclosure.Button className="flex flex-row items-center gap-1.5">
                  {open ? (
                    <FaChevronDown className="w-3 h-3 text-indigo-500" />
                  ) : (
                    <FaChevronRight className="w-3 h-3 text-gray-500" />
                  )}

                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 truncate"
                  >
                    {appAskedFor}
                  </Text>
                </Disclosure.Button>
                :
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 truncate"
                >
                  {appAskedFor}
                </Text>}
            </td>
            <td className="px-6 py-3">
              {
                whatsBeingShared &&
                <Text size="sm" weight="medium" className="text-gray-500 truncate">
                  {whatsBeingShared}
                </Text>
              }
            </td>
            <td className="px-6 py-3 flex flex-row items-center gap-2.5">
              {sourceOfDataIcon}

              <Text
                size="sm"
                weight="medium"
                className="text-gray-500 truncate"
              >
                {sourceOfData}
              </Text>
            </td>
          </tr>
          {dropdown &&
            <Disclosure.Panel as="tr">
              <td
                colSpan={4}
                className="py-3.5 px-6 bg-gray-50 border shadow-inner"
              >
                <Text
                  className="mb-2"
                  size="sm"
                  weight="medium"
                >{appAskedFor}</Text>
                <AccountExpandedView
                  account={account!}
                  titleFieldName='Picture'
                  titleFieldValue={
                    <div className='flex flex-row items-center'>
                      <img src={account!.icon} className='w-5 h-5 mr-2 rounded-full' />
                      <a href={account!.icon} className='text-sm
                       weight-medium text-indigo-500 
                       cursor-pointer flex flex-row items-center gap-1.5 hover:underline'
                        target='_blank'
                        rel='noreferrer' >
                        <Text size='sm' weight="medium" className='max-w-[200px] truncate'>
                          {account!.icon}
                        </Text>
                        <HiOutlineExternalLink />
                      </a>
                    </div>
                  }
                  addressFieldName='Name'
                  source={sourceOfData}
                />
              </td>
            </Disclosure.Panel>
          }
        </>
      )}
    </Disclosure>
  }

  const ExpandableRowView = ({
    accounts,
    title,
    source,
    titleFieldName,
    addressFieldName,
    connectedAccounts = false,
    scWallets = false
  }: {
    accounts: Array<{
      icon: string
      address: string
      type: string
      title?: string
    }>
    title: string
    source?: string
    titleFieldName?: string,
    addressFieldName?: string
    connectedAccounts?: boolean
    scWallets?: boolean
  }) => {
    const [selectedAccount, setSelectedAccount] = useState<
      | {
        icon: string
        address: string
        type: string
        title?: string
      }
      | undefined
    >()

    return (
      <Disclosure>
        {({ open }) => (
          <>
            <tr>
              <td className={`px-6 py-3 ${open ? `bg-gray-50` : ''}`}>
                <Disclosure.Button className="flex flex-row items-center gap-1.5">
                  {open ? (
                    <FaChevronDown className="w-3 h-3 text-indigo-500" />
                  ) : (
                    <FaChevronRight className="w-3 h-3 text-gray-500" />
                  )}

                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 truncate"
                  >
                    {title}
                  </Text>
                </Disclosure.Button>
              </td>
              <td className="px-6 py-3">
                {
                  scWallets
                    ? <Text size="sm" weight="medium" className="text-gray-500 truncate">
                      {accounts.map((a) => a.icon)!.length} Smart Contract Wallet(s)
                    </Text>
                    : <MultiAvatar avatars={accounts.map((a) => a.icon)!} />
                }
              </td>
              <td className="px-6 py-3 flex flex-row items-center gap-2.5">
                <img src={passportLogoURL} className="w-5 h-5" />

                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 truncate"
                >
                  Rollup Identity
                </Text>
              </td>
            </tr>
            <Disclosure.Panel as="tr">
              <td
                colSpan={4}
                className="py-3.5 px-6 bg-gray-50 border shadow-inner"
              >
                <Text
                  className="mb-2"
                  weight='medium'
                  size='sm'
                >{title}</Text>

                <section className="flex flex-row flex-wrap gap-2">
                  {accounts.map((a, i) => (
                    <UserPill
                      key={i}
                      size={20}
                      text={scWallets ? a.title! : a.address}
                      avatarURL={a.icon}
                      onClick={() => setSelectedAccount(a)}
                      className={'pointer-events-auto'}
                    />
                  ))}
                </section>
                {
                  selectedAccount && (
                    <AccountExpandedView
                      account={selectedAccount}
                      source={
                        source
                          ? source
                          : `${startCase(selectedAccount.type)} - ${selectedAccount.address}`
                      }
                      titleFieldName={titleFieldName}
                      titleFieldValue={scWallets
                        ? <Text
                          size="xs"
                          weight="medium"
                          className="text-gray-500 truncate"
                        >
                          {selectedAccount.title}
                        </Text>
                        : undefined}
                      addressFieldName={addressFieldName}
                      connectedAccounts={connectedAccounts}
                    />
                  )
                }
              </td>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure >
    )
  }

  return (
    <>
      {scopes.map((scope, i) => {
        switch (scope.claim) {
          case 'email':
            return <RowView
              key={i}
              appAskedFor='Email'
              whatsBeingShared={scope.address}
              sourceOfData={scope.address}
              sourceOfDataIcon={
                <img src={scope.icon} className="w-5 h-5 rounded-full" />
              }
              dropdown={false}
            />
          case 'connected_accounts':
            return <ExpandableRowView
              key={i}
              title={"Connected Accounts"}
              addressFieldName={"Address"}
              accounts={scope.accounts}
              connectedAccounts={true}
            />
          case 'system_identifiers':
            return <RowView
              appAskedFor='System Identifiers'
              sourceOfData='Rollup Identity'
              sourceOfDataIcon={
                <img src={passportLogoURL} className="w-5 h-5" />
              }
              key={i}
              dropdown={false}
            />
          case 'profile':
            return <RowView
              appAskedFor='Profile'
              whatsBeingShared='Picture, Name'
              sourceOfData='Primary Account'
              sourceOfDataIcon={
                <div className='flex items-center justify-center
                      w-5 h-5 bg-gray-50 rounded-full'>
                  <TbCrown className="text-[#F59E0B]" />
                </div>
              }
              key={i}
              account={scope.account}
            />
          case 'erc_4337':
            return <ExpandableRowView
              key={i}
              title="Smart Contract Wallet"
              accounts={scope.accounts}
              source='Smart Contract Wallet'
              titleFieldName='Wallet Name'
              addressFieldName='Wallet ID'
              scWallets={true}
            />
        }
      })}
    </>
  )
}
