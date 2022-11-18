import { Button } from '@kubelt/design-system'

import authorizeCheck from '../../assets/authorize-check.svg'
import publicProfileScopeIcon from './profile-scope-icon.svg'

export type ScopeMeta = {
  name: string
  description: string
}

export type AppProfile = {
  name: string
  logo: string
  scopes: string[]
}

export type UserProfile = {
  displayName: string
  pfp: {
    url: string
    isToken: boolean
  }
}

export type AuthorizationProps = {
  userProfile: UserProfile
  appProfile: AppProfile
  scopeMeta: Record<string, ScopeMeta>
}

export function Authorization({
  appProfile,
  userProfile,
  scopeMeta,
}: AuthorizationProps) {
  const scopeFamilies = new Set(
    appProfile.scopes.map((scope) => scope.split('.')[0])
  )
  let collapsedScopes: Record<string, ScopeMeta> = {}
  scopeFamilies.forEach((family) => {
    collapsedScopes[family] =
      scopeMeta[`${family}.write`] || scopeMeta[`${family}.read`]
  })

  return (
    <div className={'flex flex-col gap-4 basis-96'}>
      <div className={'flex flex-row items-center justify-center'}>
        <img className={''} src={appProfile.logo} alt="App Logo" />
        <img src={authorizeCheck} alt="Authorize Check" />
        {/* TODO: replace with avatar component */}
        <img
          src={userProfile.pfp.url}
          style={{ width: 50 }}
          alt="User Profile"
        />
        {/*  */}
      </div>
      <div className={'flex flex-col items-center justify-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>{appProfile.name}</h1>
        <p style={{ color: '#6B7280' }} className={'font-light text-base'}>
          Would like access to the following information
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
            className={'flex flex-col font-light text-base'}
          >
            {Object.keys(collapsedScopes).map((scope, i) => {
              return (
                <li key={i} className={'flex flex-row gap-4 items-center'}>
                  <span>
                    <img
                      src={publicProfileScopeIcon}
                      alt={`${collapsedScopes[scope].name} Icon`}
                    />
                  </span>
                  {collapsedScopes[scope].name}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className={'flex flex-row items-center justify-center gap-4'}>
        <Button tertiary>Cancel</Button>
        <Button alt>Continue</Button>
      </div>
    </div>
  )
}
