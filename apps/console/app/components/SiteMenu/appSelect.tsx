/**
 * @file app/shared/components/SiteMenu/appSelect.tsx
 *
 * Derived from TailwindUI > Select Menus > Custom with avatar.
 */

import { useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { HiGlobeAlt } from 'react-icons/hi'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'

import { useNavigate } from '@remix-run/react'

// Utility
// -----------------------------------------------------------------------------

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Given an array of application objects and an Client ID, return
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
  apps: {
    clientId: string
    name?: string
    icon?: string
  }[]
  //
  selectedAppIndex: number
  close?: () => void
}

function AppListbox({ apps, selectedAppIndex, close }: AppListboxProps) {
  const navigate = useNavigate()

  const initiateSelectedApp = (apps: any[], selectedAppIndex: number) => {
    return apps && apps.length !== 0
      ? selectedAppIndex < 0
        ? {
            clientId: 'none',
            name: 'All Applications',
            icon: undefined,
          }
        : apps[selectedAppIndex]
      : {
          clientId: 'none',
          name: 'No Applications',
          icon: undefined,
        }
  }

  const [selected, updateSelected] = useState(
    initiateSelectedApp(apps, selectedAppIndex)
  )

  useEffect(() => {
    updateSelected(initiateSelectedApp(apps, selectedAppIndex))
  }, [selectedAppIndex, apps])

  const setSelected = (selected: { clientId: string }) => {
    // I think it does now („• ֊ •„)
    if (window) {
      if (close) close()
      if (selected.clientId === 'all') {
        navigate(`/`, { replace: true })
      } else if (selected.clientId !== 'none') {
        navigate(`/apps/${selected.clientId}`, { replace: true })
      }
    }
  }

  return (
    <Listbox value={selected} onChange={setSelected}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button
              className="relative w-full cursor-default border border-l-0 border-r-0 border-gray-700
               bg-transparent text-white py-5 pl-4 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none sm:text-sm"
            >
              <span className="flex items-center">
                {/* <img src={selected.icon} alt="" className="h-6 w-6 flex-shrink-0 rounded-full" /> */}
                {selected.clientId === 'none' && (
                  <HiGlobeAlt
                    className={`h-6 w-6 ${
                      apps?.length === 0 ? 'text-gray-600' : 'text-gray-300'
                    } mr-2.5`}
                  />
                )}

                {selected.clientId !== 'none' && (
                  <>
                    {!selected.icon && (
                      <div
                        className="rounded-full w-6 h-6 flex justify-center shrink-0
                        items-center bg-gray-200 overflow-hidden mr-2.5"
                      >
                        <Text className="text-gray-500">
                          {selected.name?.substring(0, 1)}
                        </Text>
                      </div>
                    )}
                    {selected.icon && (
                      <img
                        src={selected.icon}
                        className="object-cover w-6 h-6 rounded-full mr-2.5"
                        alt="app icon"
                      />
                    )}
                  </>
                )}

                <Text
                  weight="medium"
                  className={`${
                    apps?.length === 0 ? 'text-gray-300' : 'text-white'
                  } truncate`}
                >
                  {selected.name}
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
              show={open}
              as="div"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="bg-gray-800"
            >
              <Listbox.Options static className="w-full text-gray-300">
                {apps.length ? (
                  <Listbox.Option
                    className="flex items-center px-4 py-4 border border-l-0 border-r-0 border-t-0 border-gray-700 cursor-pointer hover:bg-gray-700"
                    value={{
                      clientId: 'all',
                    }}
                  >
                    <HiGlobeAlt className={`h-6 w-6 mr-2.5`} />

                    <Text size="sm" weight="medium">
                      All Applications
                    </Text>
                  </Listbox.Option>
                ) : null}

                {apps?.map((app) => (
                  <Listbox.Option key={app.clientId} value={app}>
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center py-2 px-4 cursor-pointer hover:bg-gray-700">
                          {!app.icon && (
                            <div className="rounded-full w-6 h-6 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden mr-2.5">
                              <Text className="text-gray-500">
                                {app.name?.substring(0, 1)}
                              </Text>
                            </div>
                          )}
                          {app.icon && (
                            <img
                              src={app.icon}
                              className="object-cover w-6 h-6 rounded-full mr-2.5"
                              alt="app icon"
                            />
                          )}

                          <Text size="sm" className="truncate" weight="medium">
                            {app.name}
                          </Text>
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
                <Listbox.Option
                  value={{ clientId: 'create' }}
                  className="w-full justify-center border border-l-0 border-r-0 border-gray-700 px-4 py-3"
                >
                  <Button
                    className="w-full"
                    btnType="primary-alt"
                    onClick={() => {
                      navigate(`/apps/new`, { replace: true })
                    }}
                  >
                    Create Application
                  </Button>
                </Listbox.Option>
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  )
}

// Component
// -----------------------------------------------------------------------------

type AppSelectProps = {
  // The list of apps to display in the dropdown.
  apps: {
    clientId: string
    name?: string
    icon?: string
  }[]
  // The currently selected Client ID.
  selected?: string
  close?: () => void
}

export default function AppSelect(props: AppSelectProps) {
  // Get the array index of the application with the given id.
  const appIndex = props.selected ? indexFor(props.apps, props.selected) : -1

  return (
    <AppListbox
      apps={props.apps}
      selectedAppIndex={appIndex}
      close={props.close}
    />
  )
}
