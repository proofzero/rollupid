import { ConnectButton } from '../../../app/components/connect-button/ConnectButton'
import subtractLogo from '../../assets/subtract-logo.svg'
import circleLogo from './circle-logo.svg'

import ConnectGoogleButton from '~/components/connect-google-button'
import ConnectGithubButton from '../connect-github-button'
import ConnectTwitterButton from '~/components/connect-twitter-button'
import ConnectMicrosoftButton from '../connect-microsoft-button'

export type AuthenticationProps = {
  logoURL?: string
  enableWalletConnect: boolean
  enableOAuthConnect?: boolean
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
}

export function Authentication({
  logoURL,
  enableWalletConnect = true,
  enableOAuthConnect = false,
  connectCallback,
  connectErrorCallback,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div
      className={
        'flex flex-col items-center justify-center gap-4 basis-96 m-auto bg-white p-6'
      }
      style={{
        width: 418,
        height: 598,
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
        borderRadius: 8,
      }}
    >
      <div className={''}>
        <img className={''} src={logo} alt="3ID Logo" />
      </div>
      <div className={'flex flex-col items-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>Welcome to the Private Web</h1>
        <h2 style={{ color: '#6B7280' }} className={'font-medium text-base'}>
          How would you like to continue?
        </h2>
      </div>
      <ConnectButton
        disabled={!enableWalletConnect}
        connectCallback={connectCallback}
        connectErrorCallback={connectErrorCallback}
      />
      {enableOAuthConnect ? (
        <>
          <ConnectGoogleButton />
          <ConnectGithubButton />
          <ConnectTwitterButton />
          <ConnectMicrosoftButton />
        </>
      ) : null}
    </div>
  )
}
