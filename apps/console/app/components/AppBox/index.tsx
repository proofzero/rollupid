/**
 * @file app/shared/components/AppList/index.tsx
 */

import { Fragment } from 'react'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { Menu, Transition } from '@headlessui/react'

import type { Application } from '~/models/app.server'

import EmptyPrompt from '~/components/EmptyPrompt'

import {
  EllipsisVerticalIcon,
  TrashIcon,
  Cog8ToothIcon,
} from '@heroicons/react/20/solid'
// TODO migrate to FolderPlusIcon and remove bespoke version
import { FolderPlusIcon } from '@heroicons/react/24/outline'
import folderPlus from '~/images/folderPlus.svg'

// CompactMenu
// -----------------------------------------------------------------------------

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function CompactMenu() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'group flex items-center px-4 py-2 text-sm'
                  )}
                >
                  <Cog8ToothIcon
                    className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  Settings
                </a>
              )}
            </Menu.Item>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-red-900' : 'text-red-700',
                      'group flex items-center px-4 py-2 text-sm'
                    )}
                  >
                    <TrashIcon
                      className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500"
                      aria-hidden="true"
                    />
                    Delete Application
                  </a>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

// AppSummary
// -----------------------------------------------------------------------------

type AppSummaryProps = {
  icon: string
  name: string
}

const AppSummary = (props: AppSummaryProps) => {
  const dateCreated = `Date created?`
  return (
    <div className="flex flex-auto bg-white rounded-md">
      <img
        className="inline-block mr-2 rounded-l-md"
        src={props.icon}
        alt={`Icon for ${props.name}`}
      />
      <div className="inline-block flex-grow text-sm pt-1">
        <div className="font-bold">{props.name}</div>
        <div className="text-slate-500">{dateCreated}</div>
      </div>
      <div className="inline-flex flex-col pr-2 justify-center">
        <CompactMenu />
      </div>
    </div>
  )
}

// AppList
// -----------------------------------------------------------------------------

type AppListProps = {
  apps: Array<Application>
}

function AppList(props: AppListProps) {
  if (!props.apps) {
    return <p>No applications to display!</p>
  }

  const appSummaries = props.apps.map((app) => {
    return (
      <AppSummary
        key={`app-${app.id}`}
        id={app.id}
        icon={app.icon}
        name={app.name}
        coreCount={app.coreCount}
      />
    )
  })

  if (props.apps.length <= 0) {
    return (
      <EmptyPrompt
        icon={folderPlus}
        alt="Create App icon"
        title="No Applications"
        description="Get started by creating an Application."
        prompt="Create Application"
        link="/dashboard/apps/new"
      />
    )
  } else {
    return <div className="flex flex-col gap-2">{appSummaries}</div>
  }
}

// LegendItem
// -----------------------------------------------------------------------------

type LegendItemProps = {
  label: string
  color: string
}

function LegendItem(props: LegendItemProps) {
  return (
    <span className="inline-flex items-center px-3 py-0.5 text-sm font-medium text-gray-500">
      <svg className={`-ml-1 mr-1.5 h-2 w-2 ${props.color}`} viewBox="0 0 8 8">
        <circle cx={4} cy={4} r={4} />
      </svg>
      {props.label}
    </span>
  )
}

// AppBox
// -----------------------------------------------------------------------------

type AppBoxProps = {
  // Application model instances
  apps: Array<Application>
  // Link target for creating a new application.
  createLink: string
}

export default function AppBox(props: AppBoxProps) {
  return (
    <div className="mt-8">
      <Link
        to={props.createLink}
        className="flex flow-col md:flex-row items-center md:items-end justify-center md:justify-end md:-mb-8 mb-2 md:items-right"
      ></Link>
      <h3 className="text-xl font-bold mb-6">Your Applications</h3>
      <div className="mb-2 mt-4"></div>
      <AppList apps={props.apps} />
    </div>
  )
}
