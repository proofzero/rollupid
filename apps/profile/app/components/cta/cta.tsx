import { Link } from '@remix-run/react'
import { useState, useEffect } from 'react'

import { Button, Text } from '@proofzero/design-system'

import type { FullProfile } from '../../types'
import type { ProfileCompletionStatus } from '../../utils/cta.client'
import { determineProfileCompletionStatus } from '../../utils/cta.client'

const CTA = ({
  profile,
  accounts,
}: {
  profile: FullProfile
  accounts: any[]
}) => {
  const ctaDict: {
    [key: string]: {
      head: string
      copy: string
      action: string
      actionURL: string
    }
  } = {
    'cta.base': {
      head: 'Welcome to your profile!',
      copy: 'Get started by filling out your profile information',
      action: 'Go to Settings',
      actionURL: '/account/profile',
    },
    'cta.links': {
      head: 'Add links',
      copy: 'Share with the world your social accounts, websites, and more',
      action: 'Go to Links',
      actionURL: '/account/links',
    },
    'cta.connections': {
      head: 'Connect more accounts',
      copy: 'Verify your other accounts to unlock more features',
      action: 'Go to Connections',
      actionURL: '/account/connections',
    },
    'cta.gallery': {
      head: 'Add NFTs to your gallery',
      copy: 'Curate and show your the best of your NFT collection',
      action: 'Go to Gallery',
      actionURL: '/account/gallery',
    },
  }

  const [cta, setCTA] = useState<string | undefined>()

  const handleCTAKey = (
    pcs: ProfileCompletionStatus,
    key: keyof typeof pcs
  ) => {
    if (!pcs[key]) {
      if (!sessionStorage.getItem(`cta.${key}`)) {
        sessionStorage.setItem(`cta.${key}`, 'show')
        return `cta.${key}`
      } else if (sessionStorage.getItem(`cta.${key}`) !== 'false') {
        return `cta.${key}`
      }
    } else {
      sessionStorage.removeItem(`cta.${key}`)
    }
  }

  const handleCompletionStatus = () => {
    const pcs = determineProfileCompletionStatus(profile, accounts)

    let ctaKey
    ctaKey = handleCTAKey(pcs, 'gallery') || ctaKey
    ctaKey = handleCTAKey(pcs, 'connections') || ctaKey
    ctaKey = handleCTAKey(pcs, 'links') || ctaKey
    ctaKey = handleCTAKey(pcs, 'base') || ctaKey

    setCTA(ctaKey)
  }

  const ignoreCTA = () => {
    Object.keys(ctaDict).forEach((key) => sessionStorage.setItem(key, 'false'))

    handleCompletionStatus()
  }

  useEffect(() => {
    handleCompletionStatus()
  }, [])

  if (!cta) return null

  return (
    <div className="flex flex-col lg:flex-row p-4 border rounded-lg shadow space-y-6 lg:space-y-0">
      <div className="flex flex-row items-center space-x-3">
        <div className="p-2.5 bg-indigo-50 rounded-lg">
          <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_7573_12929)">
              <path
                d="M21 19.25C24.866 19.25 28 16.116 28 12.25C28 8.38401 24.866 5.25 21 5.25C17.134 5.25 14 8.38401 14 12.25C14 16.116 17.134 19.25 21 19.25Z"
                stroke="#6366F1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10.5 36.75V33.25C10.5 31.3935 11.2375 29.613 12.5503 28.3003C13.863 26.9875 15.6435 26.25 17.5 26.25H24.5C26.3565 26.25 28.137 26.9875 29.4497 28.3003C30.7625 29.613 31.5 31.3935 31.5 33.25V36.75"
                stroke="#6366F1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_7573_12929">
                <rect width="42" height="42" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="flex-1 flex-col">
          <Text size="lg" weight="semibold" className="text-gray-800">
            {ctaDict[cta].head}
          </Text>
          <Text size="sm" weight="normal" className="text-gray-500">
            {ctaDict[cta].copy}
          </Text>
        </div>
      </div>

      <div className="flex flex-row space-x-6 flex-1 justify-center lg:justify-end items-center">
        <Text
          size="xs"
          weight="normal"
          className="text-indigo-500 cursor-pointer"
          onClick={ignoreCTA}
        >
          Ignore
        </Text>

        <Link to={ctaDict[cta].actionURL}>
          <Button btnType="primary">{ctaDict[cta].action}</Button>
        </Link>
      </div>
    </div>
  )
}

export default CTA
