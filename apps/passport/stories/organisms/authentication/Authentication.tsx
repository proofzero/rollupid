import { ConnectButton } from '../../molecules/connect-button/ConnectButton'
import styles from './authentication.module.scss'

export type AuthenticationProps = {}

export function Authentication({}: AuthenticationProps) {
  return (
    <div>
      something
      <ConnectButton connectCallback={() => {}} errorCallback={() => {}} />
    </div>
  )
}
