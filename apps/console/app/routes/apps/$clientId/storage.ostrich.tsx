import { useOutletContext } from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { IdentityURN } from '@proofzero/urns/identity'
import { Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'

export default () => {
  const { appDetails, identityURN } = useOutletContext<{
    appDetails: appDetailsProps
    identityURN: IdentityURN
  }>()

  return (
    <section className="flex flex-col space-y-5">
      <div className="flex flex-row items-center space-x-3">
        <Text size="2xl" weight="semibold" className="text-gray-900">
          Storage
        </Text>
        <DocumentationBadge
          url={'https://docs.rollup.id/platform/console/storage'}
        />
      </div>

      <section className="flex-1 bg-white border rounded-lg">Hello!</section>
    </section>
  )
}
