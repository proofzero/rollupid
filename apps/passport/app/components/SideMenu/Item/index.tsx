import classNames from 'classnames'
import { Text } from '@proofzero/design-system'
import { NavLink } from '@remix-run/react'

type SideNavItemProps = {
  item: {
    name: string
    href: string
    icon: any
    exists?: boolean
  }
}

export const SideMenuItem = ({ item }: SideNavItemProps) => {
  const activeStyle = {
    backgroundColor: 'rgb(243 244 246)',
    borderColor: '#6366f1',
    fontWeight: 600,
    color: '#1f2937',
  }
  return (
    <div className={'basis-1/4 w-100 content-center self-center z-50'}>
      <NavLink
        to={item.href}
        onClick={(e) => {
          if (!item.exists) e.preventDefault()
        }}
        style={({ isActive }) => {
          return isActive && item.href != '#' ? activeStyle : undefined
        }}
        className={({ isActive }) => `text-sm group ${
          isActive ? 'border-l-2' : ''
        } px-4 py-4
                       flex self-center justify-start
                       flex-row  items-start
                       hover:text-gray-500 hover:bg-gray-100`}
      >
        <item.icon
          className={classNames(
            !item.exists && 'opacity-25 cursor-not-allowed',
            'text-sm flex-shrink-0 -ml-1 mr-3 h-6 w-6 self-center'
          )}
          style={{
            color: '#4B5563',
          }}
          aria-hidden="true"
        />

        <span
          className={classNames(
            !item.exists && 'opacity-25 cursor-not-allowed',
            ' self-center'
          )}
        >
          <Text
            className="truncate self-center text-gray-600"
            size="sm"
            weight="medium"
          >
            {item.name}
          </Text>
        </span>
      </NavLink>{' '}
    </div>
  )
}
