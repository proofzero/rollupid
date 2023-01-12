import { useState } from 'react'
import ConditionalTooltip from '~/components/conditional-tooltip'

const tabs: Record<string, string> = {
  gallery: 'Gallery',
  collection: 'NFT Collections',
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export type ProfileTabsProps = {
  path: string
  handleTab: (tab: string, opts: { replace: boolean }) => void
  enableGallery?: boolean
}

const ProfileTabs = ({
  path,
  enableGallery = false,
  handleTab,
}: ProfileTabsProps) => {
  const [currentTab, setCurrentTab] = useState<string>(
    tabs[path] || 'collection'
  )
  return (
    <div className="block px-3 lg:px-4">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {Object.keys(tabs).map((tab) => {
            if (!enableGallery && tab === 'gallery') return null
            return (
              <ConditionalTooltip
                placement="top"
                key={tabs[tab]}
                content="Gallery is empty"
                condition={tab === 'gallery' && enableGallery}
              >
                <button
                  disabled={tab === 'gallery' && enableGallery}
                  onClick={() => {
                    setCurrentTab(tabs[tab])
                    handleTab(`./${tab}`, { replace: true })
                  }}
                  className={classNames(
                    tabs[tab] === currentTab
                      ? 'border-indigo-500 font-semibold text-gray-800'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    '',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  )}
                >
                  {tabs[tab]}
                </button>
              </ConditionalTooltip>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default ProfileTabs
