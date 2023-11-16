import {
  Form,
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react'
import { appDetailsProps } from '~/types'
import { IdentityURN } from '@proofzero/urns/identity'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { ReadOnlyInput } from '@proofzero/design-system/src/atoms/form/ReadOnlyInput'
import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { HiOutlineShoppingCart } from 'react-icons/hi'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { requireJWT } from '~/utilities/session.server'
import { InternalServerError } from '@proofzero/errors'
import { IdentityFeatures } from '@proofzero/platform.starbase/src/types'
import { InputToggle } from '@proofzero/design-system/src/atoms/form/InputToggle'
import classNames from 'classnames'

export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { clientId } = params
    if (!clientId) {
      throw new InternalServerError({
        message: 'Client id not found',
      })
    }

    const features = await coreClient.starbase.getFeatures.query({
      clientId,
    })

    return {
      featureEnabled: (features & IdentityFeatures.STORAGE) !== 0,
    }
  }
)

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const jwt = await requireJWT(request, context.env)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    const { clientId } = params
    if (!clientId) {
      throw new InternalServerError({
        message: 'Client id not found',
      })
    }

    const features = await coreClient.starbase.getFeatures.query({
      clientId,
    })

    if ((features & IdentityFeatures.STORAGE) === 0) {
      await coreClient.starbase.enableFeature.mutate({
        clientId,
        feature: IdentityFeatures.STORAGE,
      })
    } else {
      await coreClient.starbase.disableFeature.mutate({
        clientId,
        feature: IdentityFeatures.STORAGE,
      })
    }

    return null
  }
)

export default () => {
  const { featureEnabled } = useLoaderData<{
    featureEnabled: boolean
  }>()

  const trans = useTransition()
  const submit = useSubmit()

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

            <div
              className={classNames('w-2 h-2 rounded-full', {
                'bg-green-500': featureEnabled,
                'bg-gray-300': !featureEnabled,
              })}
            ></div>
          </div>

          <InputToggle
            id="toggle_storage"
            checked={featureEnabled}
            onToggle={() => {
              submit(null, {
                method: 'post',
              })
            }}
            disabled={trans.state !== 'idle'}
          />
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
