import { ConnectButton } from '../../../app/components/connect-button/ConnectButton'
import circleLogo from './circle-logo.svg'

export type AuthenticationProps = {
  logoURL?: string
  enableWalletConnect: boolean
  connectCallback: (address: string) => void
  connectErrorCallback: (error: Error) => void
}

export function Authentication({
  logoURL,
  enableWalletConnect = true,
  connectCallback,
  connectErrorCallback,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div className={'flex flex-col items-center justify-center gap-4'}>
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
    </div>
  )
}
