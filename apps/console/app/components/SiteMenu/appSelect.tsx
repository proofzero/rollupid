/**
 * @file app/shared/components/SiteMenu/appSelect.tsx
 *
 * Derived from TailwindUI > Select Menus > Custom with avatar.
 */

import { useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { TbWorld } from 'react-icons/tb'
import { Button, Text } from '@proofzero/design-system'

import { useNavigate } from '@remix-run/react'
import { ServicePlanType } from '@proofzero/types/billing'
import { Pill } from '@proofzero/design-system/src/atoms/pills/Pill'
import {
  IdentityGroupURN,
  IdentityGroupURNSpace,
} from '@proofzero/urns/identity-group'

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
    appPlan?: ServicePlanType
    groupName?: string
  }[]
  //
  selectedAppIndex: number
  close?: () => void
  paymentFailedIdentityGroups?: IdentityGroupURN[]
}

function AppListbox({
  apps,
  selectedAppIndex,
  close,
  paymentFailedIdentityGroups,
}: AppListboxProps) {
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
               bg-transparent text-white py-5 pl-4 pr-10 text-left shadow-sm sm:text-sm"
            >
              <span className="flex items-center">
                {selected.clientId === 'none' && (
                  <TbWorld
                    className={`h-6 w-6 ${
                      apps?.length === 0 ? 'text-gray-600' : 'text-gray-300'
                    } mr-2.5`}
                  />
                )}

                {selected.clientId !== 'none' && (
                  <div className="relative mr-2.5">
                    {!selected.icon && (
                      <div
                        className="rounded-full w-6 h-6 flex justify-center shrink-0
                        items-center bg-gray-200 overflow-hidden"
                      >
                        <Text className="text-gray-500">
                          {selected.name?.substring(0, 1)}
                        </Text>
                      </div>
                    )}
                    {selected.icon && (
                      <img
                        src={selected.icon}
                        className="object-cover w-6 h-6 rounded-full"
                        alt="app icon"
                      />
                    )}
                    {selected.groupID &&
                      paymentFailedIdentityGroups?.includes(
                        IdentityGroupURNSpace.urn(
                          selected.groupID
                        ) as IdentityGroupURN
                      ) && (
                        <div className="absolute right-0 bottom-0 w-2 h-2 bg-orange-400 rounded-full border border-white"></div>
                      )}
                  </div>
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
                    <TbWorld className={`h-6 w-6 mr-2.5`} />

                    <Text size="sm" weight="medium">
                      All Applications
                    </Text>
                  </Listbox.Option>
                ) : null}

                {apps?.map((app) => (
                  <Listbox.Option key={app.clientId} value={app}>
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center justify-between py-2 pl-4 pr-2 cursor-pointer hover:bg-gray-700 ">
                          <div className="flex flex-row items-center space-x-2.5">
                            {!app.icon && (
                              <div className="rounded-full w-6 h-6 flex justify-center items-center bg-gray-200 shrink-0 overflow-hidden">
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

                            <div className="flex flex-col justify-start">
                              <Text
                                size="sm"
                                className="truncate"
                                weight={selected ? 'semibold' : 'medium'}
                              >
                                {app.name}
                              </Text>

                              {app.groupName && (
                                <Text
                                  size="xs"
                                  weight="medium"
                                  className="text-gray-400"
                                >
                                  {app.groupName}
                                </Text>
                              )}
                            </div>
                          </div>

                          {app.appPlan !== ServicePlanType.FREE ? (
                            <Pill
                              className={`rounded-3xl py-none text-gray-400 ${
                                active ? 'bg-gray-800' : 'bg-gray-700'
                              }`}
                            >
                              <Text size="xs">{app.appPlan}</Text>
                            </Pill>
                          ) : null}
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
                <Listbox.Option
                  value={{ clientId: 'new' }}
                  className="w-full justify-center border border-l-0 border-r-0 border-gray-700 px-4 py-3"
                >
                  <Button className="w-full" btnType="primary-alt">
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
    appPlan?: ServicePlanType
    groupName?: string
  }[]
  // The currently selected Client ID.
  selected?: string
  close?: () => void
  paymentFailedIdentityGroups?: IdentityGroupURN[]
}

export default function AppSelect(props: AppSelectProps) {
  // Get the array index of the application with the given id.
  const appIndex = props.selected ? indexFor(props.apps, props.selected) : -1

  return (
    <AppListbox
      apps={props.apps}
      selectedAppIndex={appIndex}
      close={props.close}
      paymentFailedIdentityGroups={props.paymentFailedIdentityGroups}
    />
  )
}
