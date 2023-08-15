import onboardingImage from '../images/console_onboarding.svg'

import { Outlet } from '@remix-run/react'

export default function Onboarding() {
  return (
    <div>
      <div
        className={`flex flex-row items-center justify-center h-[100dvh] bg-white dark:bg-gray-900`}
      >
        <div
          className={
            'basis-full 2xl:basis-2/5 flex items-start justify-center py-[2.5%] h-full'
          }
        >
          <Outlet />
        </div>
        <div className="basis-3/5 h-[100dvh] w-full hidden 2xl:flex justify-end items-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <img
            className="max-h-fit mt-[10%]"
            alt="onboarding"
            src={onboardingImage}
          />
        </div>
      </div>
    </div>
  )
}
