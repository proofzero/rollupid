import { useOutletContext } from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { IdentityURN } from '@proofzero/urns/identity'
import { Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'

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

      <section className="flex-1 bg-white border rounded-lg px-4 pt-3 pb-6">
        <section className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-2 items-center">
            <Text size="lg" weight="semibold">
              App Data Storage
            </Text>

            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>

          <InputToggle id="toggle_storage" />
        </section>

        <section className="mt-2">
          <Text size="sm" className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Nullam
            rhoncus aliquam metus. Sed elit dui, pellentesque a, faucibus vel,
            interdum nec, diam. Etiam ligula pede, sagittis quis, interdum
            ultricies, scelerisque eu.
          </Text>
        </section>

        <section className="mt-4">
          <ReadOnlyInput
            id="url"
            value="https://rollup.id/API/EqUEbCGHGnZXDMSUbrxhX7"
            label="API url"
            copyable={true}
            onCopy={() =>
              toast(
                ToastType.Success,
                { message: 'Client secret copied to clipboard!' },
                { duration: 2000 }
              )
            }
          />
        </section>
      </section>
    </section>
  )
}
