import React from 'react'
import { Avatar } from '../../atoms/profile/avatar/Avatar'
import { Text } from '../../atoms/text/Text'
import authorizeCheck from './authorize-check.svg'
import { SmartContractWalletSelect } from '../../atoms/smart_contract_wallets/SmartContractWalletSelect'
import subtractLogo from '../../assets/subtract-logo.svg'
import { Spinner } from '../../atoms/spinner/Spinner'
import { Button } from '../../atoms/buttons/Button'
import Info from '../../atoms/info/Info'
import {
  EmailSelectListItem,
  OptionType,
  SCWalletSelectListItem,
} from '@proofzero/utils/getNormalisedConnectedAccounts'
import { EmailSelect } from '../../atoms/email/EmailSelect'
import { ConnectedAccountSelect } from '../../atoms/accounts/ConnectedAccountSelect'
import { GetAddressProfileResult } from '@proofzero/platform/address/src/jsonrpc/methods/getAddressProfile'
import { AuthorizationControlSelection } from '@proofzero/types/application'
import { AddressURN } from '@proofzero/urns/address'
import { ScopeDescriptor } from '@proofzero/security/scopes'

import profileClassIcon from './profile-class-icon.svg'
import addressClassIcon from './connected-addresses-class-icon.svg'
import emailClassIcon from './email-class-icon.svg'
import smartContractWalletClassIcon from './sc-wallet-class-icon.svg'
import systemIdentifiersClassIcon from './system-identifiers-class-icon.svg'

export const scopeIcons: Record<string, string> = {
  connected_accounts: addressClassIcon,
  profile: profileClassIcon,
  email: emailClassIcon,
  erc_4337: smartContractWalletClassIcon,
  system_identifiers: systemIdentifiersClassIcon,
}

type UserProfile = {
  pfpURL: string
}

type AppProfile = {
  name: string
  iconURL: string
  termsURL: string
  privacyURL: string
}

type ScopeMeta = { scopes: Record<string, ScopeDescriptor> }

type AuthorizationProps = {
  userProfile: UserProfile
  appProfile: AppProfile

  requestedScope: string[]
  scopeMeta: ScopeMeta
  scopeIcons: Record<string, string>

  transitionState: 'idle' | 'submitting' | 'loading'

  connectedSmartContractWallets: SCWalletSelectListItem[]
  addNewSmartWalletCallback: () => void
  selectSmartWalletCallback: (selected: AddressURN[]) => void

  connectedEmails: EmailSelectListItem[]
  addNewEmailCallback: () => void
  selectEmailCallback: (selected: EmailSelectListItem) => void

  connectedAccounts: GetAddressProfileResult[]
  addNewAccountCallback: () => void
  selectAccountsCallback: (
    selected: AddressURN[] | AuthorizationControlSelection[]
  ) => void

  cancelCallback: () => void
  authorizeCallback: (scopes: string[]) => void
  disableAuthorize?: boolean
}

export default ({
  userProfile,
  appProfile,
  requestedScope,
  scopeMeta,
  scopeIcons,
  transitionState,
  connectedSmartContractWallets,
  addNewSmartWalletCallback,
  selectSmartWalletCallback,
  connectedEmails,
  addNewEmailCallback,
  selectEmailCallback,
  connectedAccounts,
  addNewAccountCallback,
  selectAccountsCallback,
  cancelCallback,
  authorizeCallback,
  disableAuthorize = false,
}: AuthorizationProps) => {
  const scopesToDisplay = [...requestedScope].filter((scope) => {
    return scopeMeta.scopes[scope].hidden !== true
  })
  if (
    requestedScope.some((scope) => {
      return scopeMeta.scopes[scope].hidden === true
    })
  ) {
    scopeMeta.scopes['system_identifiers'] = {
      name: 'System Identifiers',
      description:
        "Read account's system identifiers and other non-personally identifiable information",
      class: 'implied',
    }
    scopesToDisplay.unshift('system_identifiers')
  }
  return (
    <div
      className={'flex flex-col gap-4 basis-96 m-auto bg-white p-6'}
      style={{
        width: 418,
        height: 598,
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        borderRadius: 8,
      }}
    >
      <div className={'flex flex-row items-center justify-center'}>
        <Avatar
          src={userProfile.pfpURL}
          hex={false}
          size={'sm'}
          // alt="User Profile"
        />
        <img src={authorizeCheck} alt="Authorize Check" />
        <Avatar src={appProfile.iconURL} size={'sm'} />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>{appProfile.name}</h1>
        <p style={{ color: '#6B7280' }} className={'font-light text-base'}>
          would like access to the following information
        </p>
      </div>
      <div className={'flex flex-col gap-4 items-start justify-start w-full'}>
        <p
          style={{ color: '#6B7280' }}
          className={'mb-2 font-extralight text-xs'}
        >
          REQUESTED
        </p>
        <ul
          style={{ color: '#6B7280' }}
          className={'flex flex-col font-light text-base gap-2 w-full'}
        >
          {scopesToDisplay.map((scope: string, i: number) => {
            return (
              <li key={i} className={'flex flex-row gap-2 items-center w-full'}>
                <div className="flex flex-row w-full gap-2 items-center">
                  <img src={scopeIcons[scope]} alt={`${scope} Icon`} />

                  {(scope === 'profile' || scope === 'system_identifiers') && (
                    <Text
                      size="sm"
                      weight="medium"
                      className="flex-1 text-gray-500"
                    >
                      {scopeMeta.scopes[scope].name}
                    </Text>
                  )}

                  {scope === 'erc_4337' && (
                    <div className="flex-1 min-w-0">
                      <SmartContractWalletSelect
                        wallets={connectedSmartContractWallets}
                        onSelect={(selected: SCWalletSelectListItem) => {
                          if (selected?.type === OptionType.AddNew) {
                            addNewSmartWalletCallback()
                          } else if (selected) {
                            selectSmartWalletCallback([selected.addressURN])
                          }
                        }}
                      />
                    </div>
                  )}

                  {scope === 'email' && (
                    <div className="flex-1 min-w-0">
                      <EmailSelect
                        items={connectedEmails || []}
                        enableAddNew={true}
                        defaultAddress={connectedEmails![0]?.addressURN}
                        onSelect={(selected: EmailSelectListItem) => {
                          if (selected?.type === OptionType.AddNew) {
                            addNewEmailCallback()
                          } else if (selected) {
                            selectEmailCallback(selected)
                          }
                        }}
                      />
                    </div>
                  )}

                  {scope === 'connected_accounts' && (
                    <div className="flex-1 min-w-0">
                      <ConnectedAccountSelect
                        accounts={connectedAccounts.map((ca) => ({
                          addressURN: ca.id,
                          address: ca.address,
                          title: ca.title,
                          provider: ca.type === 'eth' ? 'blockchain' : ca.type,
                        }))}
                        onSelect={(addresses) => {
                          selectAccountsCallback(
                            addresses.map((a) => a.addressURN)
                          )
                        }}
                        onSelectAll={() => {
                          selectAccountsCallback([
                            AuthorizationControlSelection.ALL,
                          ])
                        }}
                        onConnectNew={() => {
                          addNewAccountCallback()
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <Info
                      name={scopeMeta.scopes[scope].name}
                      description={scopeMeta.scopes[scope].description}
                    />

                    <div
                      data-popover
                      id={`popover-${scope}`}
                      role="tooltip"
                      className="absolute z-10 invisible inline-block
                    font-[Inter]
                     min-w-64 text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {scope}
                        </h3>
                      </div>
                      <div className="px-3 py-2">
                        <p>{scopeMeta.scopes[scope].description}</p>
                      </div>
                      <div data-popper-arrow></div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {(appProfile?.termsURL || appProfile?.privacyURL) && (
        <Text size="sm" className="text-gray-500 mt-7">
          Before using this app, you can review {appProfile?.name ?? `Company`}
          's{' '}
          <a href={appProfile.privacyURL} className="text-indigo-500">
            privacy policy
          </a>
          {appProfile?.termsURL && appProfile?.privacyURL && <span> and </span>}
          <a href={appProfile.termsURL} className="text-indigo-500">
            terms of service
          </a>
          .
        </Text>
      )}
      <div className="flex flex-col w-full items-center justify-center mt-auto">
        <div className={'flex flex-row w-full items-end justify-center gap-4'}>
          {transitionState === 'idle' && (
            <>
              <Button
                btnSize="xl"
                btnType="secondary-alt"
                onClick={cancelCallback}
              >
                Cancel
              </Button>
              <Button
                btnSize="xl"
                btnType="primary-alt"
                disabled={disableAuthorize}
                onClick={() => {
                  authorizeCallback(requestedScope)
                }}
              >
                Continue
              </Button>
            </>
          )}
          {transitionState !== 'idle' && <Spinner />}
        </div>
        <div className="mt-5 flex justify-center items-center space-x-2">
          <img src={subtractLogo} alt="powered by rollup.id" />
          <Text size="xs" weight="normal" className="text-gray-400">
            Powered by{' '}
            <a href="https://rollup.id" className="hover:underline">
              rollup.id
            </a>
          </Text>
        </div>
      </div>
    </div>
  )
}
