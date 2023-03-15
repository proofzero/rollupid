import circleLogo from './circle-logo.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Avatar } from '@kubelt/design-system'

export type AuthenticationProps = {
  logoURL?: string
  appName?: string
  children: JSX.Element
}

export function Authentication({
  logoURL,
  appName,
  children,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[598px] lg:max-h-[100dvh] lg:h-1 w-full lg:w-[418px] lg:border-rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      <Avatar src={logo} size="sm"></Avatar>
      <div className={'flex flex-col items-center gap-2'}>
        <h1 className={'font-semibold text-xl'}>
          {appName ? `Login to ${appName}` : 'Welcome to the Private Web'}
        </h1>
        <h2 style={{ color: '#6B7280' }} className={'font-medium text-base'}>
          How would you like to continue?
        </h2>
      </div>

      {children}

      <div className="mt-14 flex justify-center items-center space-x-2">
        <img src={subtractLogo} alt="powered by rollup.id" />
        <Text size="xs" weight="normal" className="text-gray-400">
          Powered by{' '}
          <a href="https://rollup.id" className="hover:underline">
            rollup.id
          </a>
        </Text>
      </div>
    </div>
  )
}
