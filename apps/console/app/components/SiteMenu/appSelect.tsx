/**
 * @file app/shared/components/SiteMenu/appSelect.tsx
 *
 * Derived from TailwindUI > Select Menus > Custom with avatar.
 */

import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { HiGlobeAlt } from 'react-icons/hi'

// Utility
// -----------------------------------------------------------------------------

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Given an array of application objects and an application ID, return
// the array index of the application with the given unique identifier.
// Note that Array.findIndex() returns -1 if no matching array entry was found.
function indexFor(
  apps: {
    clientId: string
  }[],
  appId: string
): number {
  return apps.findIndex((app) => app.clientId === appId)
}

// AppListbox
// -----------------------------------------------------------------------------

type AppListboxProps = {
  // The list of apps to display in the dropdown.
  // TODO tighten up this definition
  apps: {
    clientId: string
    app: {
      title: string
    }
  }[]
  //
  selectedAppIndex: number
}

function AppListbox({ apps, selectedAppIndex }: AppListboxProps) {
  const [selected] = useState(
    apps.length !== 0
      ? selectedAppIndex < 0
        ? {
            clientId: 'none',
            app: {
              title: 'All Applications',
            },
          }
        : apps[selectedAppIndex]
      : {
          clientId: 'none',
          app: {
            title: 'No Applications',
          },
        }
  )

  const setSelected = (selected: { clientId: string }) => {
    // Using useNavigation hook
    // doesn't refresh the
    // details component
    if (window && selected.clientId !== 'none') {
      window.location.href = `/apps/${selected.clientId}`
    }
  }

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default border border-l-0 border-r-0 border-gray-500 bg-transparent text-white py-5 pl-4 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm">
              <span className="flex items-center">
                {/* <img src={selected.icon} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" /> */}
                {selected.clientId === 'none' && (
                  <HiGlobeAlt
                    className={`h-6 w-6 ${
                      apps.length === 0 ? 'text-gray-600' : 'text-gray-300'
                    } mr-2.5`}
                  />
                )}
                <Text
                  weight="medium"
                  className={`${
                    apps.length === 0 ? 'text-gray-600' : 'text-white'
                  }`}
                >
                  {selected.app.title}
                </Text>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open && selected.clientId !== 'none'}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {apps.map((app) => (
                  <Listbox.Option
                    key={app.clientId}
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-indigo-600' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9'
                      )
                    }
                    value={app}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center">
                          {/* <img src={person.icon} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" /> */}
                          <span
                            className={classNames(
                              selected ? 'font-semibold' : 'font-normal',
                              'ml-3 block truncate'
                            )}
                          >
                            {app.app.title}
                          </span>
                        </div>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

// NoApps
// -----------------------------------------------------------------------------

function NoApps() {
  return (
    <div className="relative mt-1">
      <p className="relative w-full cursor-default border border-l-0 border-r-0 border-gray-500 bg-transparent text-white py-4 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm">
        No Applications
      </p>
    </div>
  )
}

// Component
// -----------------------------------------------------------------------------

type AppSelectProps = {
  // The list of apps to display in the dropdown.
  // TODO tighten up this definition
  apps: {
    clientId: string
    app: {
      title: string
    }
  }[]
  // The currently selected application ID.
  selected?: string
}

export default function AppSelect(props: AppSelectProps) {
  // Get the array index of the application with the given id.
  const appIndex = props.selected ? indexFor(props.apps, props.selected) : -1

  return <AppListbox apps={props.apps} selectedAppIndex={appIndex} />
}
