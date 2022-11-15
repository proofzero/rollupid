import { ConnectButton } from '../../molecules/connect-button/ConnectButton'
import styles from './authentication.module.scss'
import circleLogo from './circle-logo.svg'

export type AuthenticationProps = {
  logoURL: string
}

export function Authentication({ logoURL }: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div className={'fixed right-0'}>
      <div className={'justify-center'}>
        <img className={''} src={logo} alt="3ID Logo" />
      </div>
      <ConnectButton connectCallback={() => {}} errorCallback={() => {}} />
    </div>
  )
}
