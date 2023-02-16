import { Button } from '@kubelt/design-system/src/atoms/buttons/Button'
import { Avatar } from '@kubelt/design-system/src/atoms/profile/avatar/Avatar'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import { Profile } from '@kubelt/platform/account/src/types'
import type { ScopeMeta } from '@kubelt/types/application'

import authorizeCheck from '../../assets/authorize-check.svg'
import iIcon from '../../assets/i.svg'
import accountClassIcon from './account-class-icon.svg'
import addressClassIcon from './address-class-icon.svg'

export type AppProfile = {
  name: string
  published: boolean
  icon: string
  scopes: string[]
}

export type UserProfile = {
  displayName: string
  pfp: {
    image: string
    isToken: boolean
  }
}

export type AuthorizationProps = {
  userProfile: Required<Profile>
  appProfile: AppProfile
  scopeMeta: Record<string, ScopeMeta>
  transition: 'idle' | 'loading' | 'submitting'
  cancelCallback: () => void
  authorizeCallback: (scopes: string[]) => void
}

const scopeIcons: Record<string, string> = {
  account: accountClassIcon,
  address: addressClassIcon,
}

export function Authorization({
  appProfile,
  userProfile,
  scopeMeta,
  transition,
  cancelCallback,
  authorizeCallback,
}: AuthorizationProps) {
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
          src={userProfile.pfp?.image as string}
          hex={false}
          size={'sm'}
          // alt="User Profile"
        />
        <img src={authorizeCheck} alt="Authorize Check" />
        <Avatar src={appProfile.icon} size={'sm'} />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>{appProfile.name}</h1>
        <p style={{ color: '#6B7280' }} className={'font-light text-base'}>
          would like access to the following information
        </p>
      </div>
      <div className={'flex flex-col gap-4 items-start justify-start'}>
        <div className={'items-start justify-start'}>
          <p
            style={{ color: '#6B7280' }}
            className={'mb-2 font-extralight text-sm'}
          >
            Available
          </p>
          <ul
            style={{ color: '#6B7280' }}
            className={'flex flex-col font-light text-base gap-2'}
          >
            {appProfile.scopes.map((scope, i) => {
              return (
                <li key={i} className={'flex flex-row gap-4 items-center'}>
                  <span>
                    <img
                      src={scopeIcons[scopeMeta[scope].class]}
                      alt={`${scope} Icon`}
                    />
                  </span>
                  {scopeMeta[scope].name}
                  <span
                    className={'cursor-pointer'}
                    data-popover-target={`popover-${scope}`}
                    data-tooltip-placement="right"
                  >
                    <img src={iIcon} alt={`${scopeMeta[scope].name} info`} />
                  </span>
                  <div
                    data-popover
                    id={`popover-${scope}`}
                    role="tooltip"
                    className="absolute z-10 invisible inline-block min-w-64 text-sm font-light text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {scope}
                      </h3>
                    </div>
                    <div className="px-3 py-2">
                      <p>{scopeMeta[scope].description}</p>
                    </div>
                    <div data-popper-arrow></div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className={'flex flex-row items-end justify-center gap-4 mt-auto'}>
        {transition == 'idle' && (
          <>
            <Button
              btnType="secondary-alt"
              onClick={() => {
                cancelCallback()
              }}
            >
              Cancel
            </Button>
            <Button
              btnType="primary-alt"
              onClick={() => {
                authorizeCallback(appProfile.scopes)
              }}
            >
              Continue
            </Button>
          </>
        )}
        {transition != 'idle' && <Spinner />}
      </div>
    </div>
  )
}
