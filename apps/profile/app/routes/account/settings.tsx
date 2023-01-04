import { Outlet } from '@remix-run/react'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'

const tabs = [
  { name: 'Profile', to: 'profile' },
  { name: 'Integrations', to: 'integrations', disabled: true },
  { name: 'Connected Accounts', to: 'connections', disabled: true },
]

let firstEnabledTab = tabs.filter((t) => !t.disabled)[0]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export default function AccountSetting() {
  const [currentTab, setCurrentTab] = useState<string | undefined>(
    firstEnabledTab?.name
  )

  const notify = (success: boolean = true) => {
    if (success) {
      toast.success('Saved')
    } else {
      toast.error('Save Failed -- Please try again')
    }
  }

  return (
    <div>
      <div
        className="mb-4 flex flex-row justify-between
      "
      >
        <Text size="xl" weight="bold" className="my-4 text-gray-900">
          Settings
        </Text>

        <Toaster position="top-right" reverseOrder={false} />
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
                href={!tab.disabled ? tab.to : '/'}
                onClick={() => {
                  if (tab.disabled) {
                    return
                  }

                  setCurrentTab(tab.name)
                }}
                // prefetch="render"
                className={classNames(
                  tab.name === currentTab
                    ? 'border-indigo-500 font-semibold text-gray-800'
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
