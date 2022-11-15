import { ConnectButton } from '../../molecules/connect-button/ConnectButton'
import styles from './authentication.module.scss'
import circleLogo from './circle-logo.svg'

export type AuthenticationProps = {
  logoURL: string
}

export function Authentication({ logoURL }: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div className={'flex flex-col items-start gap-6'}>
      <div className={'justify-center'}>
        <img className={''} src={logo} alt="3ID Logo" />
      </div>
      <ConnectButton connectCallback={() => {}} errorCallback={() => {}} />
    </div>
  )
}
