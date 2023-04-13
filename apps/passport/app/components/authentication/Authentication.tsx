import circleLogo from './circle-logo.svg'
import subtractLogo from '../../assets/subtract-logo.svg'

import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Avatar } from '@proofzero/design-system'
import { HiOutlineArrowLeft } from 'react-icons/hi'

import passportLogo from '../../assets/PassportLogoIndigo.svg'
import { useNavigate } from '@remix-run/react'

export type AuthenticationProps = {
  logoURL?: string
  appName?: string
  generic?: boolean
  accountSelect?: boolean
  children: JSX.Element
}

export function Authentication({
  logoURL,
  appName,
  generic = false,
  accountSelect = false,
  children,
}: AuthenticationProps) {
  const logo = logoURL || circleLogo
  const navigate = useNavigate()

  return (
    <div className="relative">
      {generic && (
        <div className="relative mx-auto w-full lg:w-[418px]">
          <HiOutlineArrowLeft
            className="absolute left-6 top-[3.25rem] w-6 h-6 cursor-pointer z-10"
            onClick={() => navigate('/authenticate/cancel')}
          />
        </div>
      )}

      <div
        className={`relative flex shrink flex-col items-center ${
          generic ? '' : 'justify-center'
        } gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px] lg:border-rounded-lg`}
        style={{
          border: '1px solid #D1D5DB',
          boxSizing: 'border-box',
        }}
      >
        {generic && (
          <>
            <Text
              size="xl"
              weight="semibold"
              className="text-[#2D333A] mt-6 mb-8"
            >
              Connect Account
            </Text>
          </>
        )}

        {accountSelect && (
          <>
            <Avatar src={passportLogo} size="sm"></Avatar>
            <div className={'flex flex-col items-center gap-2'}>
              <Text size="xl" weight="semibold">
                Choose an account
              </Text>

              {appName && (
                <Text className="text-gray-500">
                  to continue to "
                  <span className="text-indigo-500">{appName}</span>"
                </Text>
              )}
            </div>
          </>
        )}

        {!generic && !accountSelect && (
          <>
            <Avatar src={logo} size="sm"></Avatar>
            <div className={'flex flex-col items-center gap-2'}>
              <h1 className={'font-semibold text-xl'}>
                {appName ? `Login to ${appName}` : 'Welcome to the Private Web'}
              </h1>
              <h2
                style={{ color: '#6B7280' }}
                className={'font-medium text-base'}
              >
                How would you like to continue?
              </h2>
            </div>
          </>
        )}

        <div className="flex-1 w-full flex flex-col gap-4">{children}</div>

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
    </div>
  )
}
