import { useNavigate, useOutletContext } from '@remix-run/react'
import AppBox from '~/components/AppBox'
import { InfoPanelDashboard } from '~/components/InfoPanel/InfoPanelDashboard'
import type { LoaderData as OutletContextData } from '~/root'

import folderPlus from '~/images/folderPlus.svg'

import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export default () => {
  const navigate = useNavigate()
  const { apps } = useOutletContext<OutletContextData>()

  return (
    <>
      <div className="mb-11">
        <InfoPanelDashboard />
      </div>

      {apps?.length > 0 && (
        <>
          <AppBox
            createLink="/dashboard/new"
            onCreate={() => {
              navigate('/apps/new')
            }}
            navigate={(clientId: string) => navigate(`/apps/${clientId}`)}
            apps={apps}
          />
        </>
      )}

      {apps?.length === 0 && (
        <>
          <Text size="base" weight="semibold" className="text-gray-900 mb-6">
            Your Applications
          </Text>

          <div className="text-center m-auto">
            <img
              className="inline-block mb-2"
              src={folderPlus}
              alt="Wallet icon"
            />

            <Text weight="semibold" className="text-gray-900">
              No Applications
            </Text>
            <Text weight="medium" className="text-gray-500 mb-6">
              Get started by creating an Application.
            </Text>

            <Button
              btnType="primary-alt"
              btnSize="l"
              onClick={() => {
                navigate('/apps/new')
              }}
            >
              Create Application
            </Button>
          </div>
        </>
      )}
    </>
  )
}
