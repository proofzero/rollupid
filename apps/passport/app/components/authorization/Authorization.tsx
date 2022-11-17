import { Button } from '@kubelt/design-system'

export type AppProfile = {
  name: string
  logo: string
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
}

export function Authorization({ appProfile, userProfile }: AuthorizationProps) {
  return (
    <div className={'flex flex-col gap-4 basis-96'}>
      <div className={'flex flex-col items-center justify-center'}>
        <img className={''} src={appProfile.logo} alt="App Logo" />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>{appProfile.name}</h1>
        <h2 style={{ color: '#6B7280' }} className={'font-light text-base'}>
          Would like access to the following information
        </h2>
      </div>
      <div className={'flex flex-col gap-2 items-start justify-start'}>
        <div className={'items-start justify-start'}>
          <h2
            style={{ color: '#6B7280' }}
            className={'font-extralight text-sm'}
          >
            Available
          </h2>
        </div>
      </div>
      <div className={'flex flex-row items-center justify-center gap-4'}>
        <Button tertiary>Cancel</Button>
        <Button alt>Continue</Button>
      </div>
    </div>
  )
}
