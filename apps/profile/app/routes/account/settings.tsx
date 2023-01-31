import {
  Outlet,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react'
import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'

import type { LoaderFunction } from '@remix-run/cloudflare'

import classNames from 'classnames'

import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { json } from '@remix-run/cloudflare'

export const loader: LoaderFunction = async ({ request }) => {
  const splittedUrl = request.url.split('/')
  const path = splittedUrl[splittedUrl.length - 1].split('?')[0]

  return json({
    path,
  })
}

/**
 * I've changed previous array to this object. This way
 * it is easier to navigate tabs.
 */

const tabs: {
  [key: string]: {
    name: string
    path?: string
    disabled?: boolean
  }
} = {
  profile: { name: 'Profile' },
  links: { name: 'Links' },
  integrations: { name: 'Integrations', disabled: true },
  connections: {
    name: 'Connected Accounts',
    path: 'connections',
    disabled: false,
  },
}

export default function AccountSetting() {
  const { path } = useLoaderData()
  const ctx = useOutletContext<{}>()
  const [currentTab, setCurrentTab] = useState<string | undefined>(
    tabs[path].name
  )
  const navigate = useNavigate()

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
          onChange={(evt) => {
            const path = evt.target.value.toLowerCase()
            if (tabs[path].disabled) {
              return
            }

            navigate(`./${path}`, { replace: true })
            setCurrentTab(tabs[path].name)
          }}
        >
          {Object.keys(tabs).map((path: string) => (
            <option key={tabs[path].name}>{tabs[path].name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {Object.keys(tabs).map((path) => (
              <button
                key={tabs[path].name}
                onClick={() => {
                  if (tabs[path].disabled) {
                    return
                  }

                  navigate(`./${path}`, { replace: true })
                  setCurrentTab(tabs[path].name)
                }}
                className={classNames(
                  tabs[path].name === currentTab
                    ? 'border-indigo-500 font-semibold text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  tabs[path].disabled ? 'cursor-not-allowed opacity-50' : '',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                )}
              >
                {tabs[path].name}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div>
        <Outlet
          context={{
            ...ctx,
            notificationHandler: notify,
          }}
        />
      </div>
    </div>
  )
}
