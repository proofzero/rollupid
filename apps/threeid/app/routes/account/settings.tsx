import { Outlet } from '@remix-run/react'
import { useState } from 'react'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from '~/components/typography/Text'

const tabs = [
  { name: 'Profile', to: 'profile' },
  { name: 'Integrations', to: 'integrations', disabled: true },
  { name: 'Connected Accounts', to: 'connections', disabled: true },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AccountSetting() {
  const [notifyPillVal, setNotifyPillVal] = useState<{
    message: string
    success: boolean
  } | null>(null)

  const notify = (success: boolean = true) => {
    setNotifyPillVal({
      message: success ? 'Saved' : 'Save Failed - Please try again',
      success,
    })

    setTimeout(() => {
      setNotifyPillVal(null)
    }, 2500)
  }

  return (
    <div>
      <div className="mb-4 flex flex-row justify-between">
        <Text
          size={TextSize.XL}
          weight={TextWeight.Bold700}
          color={TextColor.Gray900}
          className="my-4"
        >
          Settings
        </Text>

        {notifyPillVal && (
          <div
            className={`p-4 flex flex-row items-center bg-${
              notifyPillVal.success ? 'green' : 'red'
            }-50 rounded-md`}
          >
            <span className="mr-3.5">
              {notifyPillVal.success ? (
                <HiCheckCircle className="text-green-800" />
              ) : (
                <HiXCircle className="text-red-800" />
              )}
            </span>

            <Text
              size={TextSize.SM}
              weight={TextWeight.Medium500}
              color={
                notifyPillVal.success ? TextColor.Green800 : TextColor.Red800
              }
            >
              {notifyPillVal.message}
            </Text>
          </div>
        )}
      </div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          // defaultValue={tabs.find((tab) => tab?.current).name}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={!tab.disabled ? tab.to : '#'}
                // prefetch="render"
                className={classNames(
                  tab?.current
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  tab.disabled ? 'cursor-not-allowed opacity-50' : '',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div>
        <Outlet
          context={{
            notificationHandler: notify,
          }}
        />
      </div>
    </div>
  )
}
