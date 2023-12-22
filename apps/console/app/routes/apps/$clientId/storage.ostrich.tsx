import { Form, useOutletContext } from '@remix-run/react'
import { Button, Text } from '@proofzero/design-system'
import { DocumentationBadge } from '~/components/DocumentationBadge'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'
import { requireJWT } from '~/utilities/session.server'
import { BadRequestError, InternalServerError } from '@proofzero/errors'
import classNames from 'classnames'
import { appDetailsProps } from '~/types'
import { ExternalAppDataPackageType } from '@proofzero/types/billing'
import { HiOutlineShoppingCart, HiOutlineTrash } from 'react-icons/hi'
import { ExternalAppDataPackageStatus } from '@proofzero/platform.starbase/src/jsonrpc/validators/externalAppDataPackageDefinition'

// export const loader: LoaderFunction = getRollupReqFunctionErrorWrapper(
//   async ({ request, context, params }) => {
//     const traceHeader = generateTraceContextHeaders(context.traceSpan)
//     const jwt = await requireJWT(request, context.env)
//     const coreClient = createCoreClient(context.env.Core, {
//       ...getAuthzHeaderConditionallyFromToken(jwt),
//       ...traceHeader,
//     })

//     const { clientId } = params
//     if (!clientId) {
//       throw new InternalServerError({
//         message: 'Client id not found',
//       })
//     }

//     await coreClient.starbase.setExternalAppDataPackage.mutate({
//       clientId,
//       packageType: ExternalAppDataPackageType.STARTER,
//     })

//     return null
//   }
// )

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

    const fd = await request.formData()
    switch (fd.get('op')) {
      case 'enable':
        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
          packageType: ExternalAppDataPackageType.STARTER,
        })
        break
      case 'disable':
        await coreClient.starbase.setExternalAppDataPackage.mutate({
          clientId,
        })
        break
      default:
        throw new BadRequestError({
          message: 'Invalid operation',
        })
    }

    return null
  }
)

export default () => {
  const { appDetails } = useOutletContext<{
    appDetails: appDetailsProps
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

            <div
              className={classNames('w-2 h-2 rounded-full', {
                'bg-green-500': Boolean(
                  appDetails.externalAppDataPackageDefinition
                ),
                'bg-gray-300': !Boolean(
                  appDetails.externalAppDataPackageDefinition
                ),
              })}
            ></div>
          </div>

          {appDetails.externalAppDataPackageDefinition?.status ===
          ExternalAppDataPackageStatus.Deleting ? (
            <>
              <Text>IM DELETING</Text>
            </>
          ) : (
            <>
              {!Boolean(appDetails.externalAppDataPackageDefinition) && (
                <Form method="post">
                  <input type="hidden" name="op" value="enable" />
                  <Button
                    btnType="primary-alt"
                    className="flex flex-row items-center gap-3"
                    type="submit"
                  >
                    <HiOutlineShoppingCart className="w-3.5 h-3.5" />
                    <Text>Purchase Package</Text>
                  </Button>
                </Form>
              )}
              {Boolean(appDetails.externalAppDataPackageDefinition) && (
                <Form method="post">
                  <input type="hidden" name="op" value="disable" />
                  <Button
                    btnType="dangerous-alt"
                    className="flex flex-row items-center gap-3"
                    type="submit"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                    <Text>Cancel Service</Text>
                  </Button>
                </Form>
              )}
            </>
          )}
        </section>

        <section className="mt-2">
          <Text size="sm" className="text-gray-600">
            App Data Storage service provides a hassle-free way to store and
            retrieve per-user data for your application. <br /> Once activated,
            the service can be accessed through our Galaxy API and it supports
            storing data up to 128kb, per user.
          </Text>
        </section>
        <section className="mt-4">
          <div className="w-full h-px bg-gray-200"></div>
          <div className="flex flex-row justify-between items-center py-2">
            <Text size="sm" className="text-gray-800">
              Current Package:
            </Text>
            <Text size="sm" className="text-gray-500">
              {appDetails.externalAppDataPackageDefinition?.packageDetails
                .title ?? 'No active package'}
            </Text>
          </div>
          <div className="w-full h-px bg-gray-200"></div>
          <div className="flex flex-row justify-between items-center py-2">
            <Text size="sm" className="text-gray-800">
              Reads:
            </Text>
            {Boolean(appDetails.externalAppDataPackageDefinition) ? (
              <Text size="sm" className="text-gray-500">
                {
                  appDetails.externalAppDataPackageDefinition?.packageDetails
                    .reads
                }{' '}
                / month
              </Text>
            ) : (
              <Text size="sm" className="text-gray-500">
                -
              </Text>
            )}
          </div>
          <div className="w-full h-px bg-gray-200"></div>
          <div className="flex flex-row justify-between items-center pt-2">
            <Text size="sm" className="text-gray-800">
              Writes:
            </Text>
            {Boolean(appDetails.externalAppDataPackageDefinition) ? (
              <Text size="sm" className="text-gray-500">
                {
                  appDetails.externalAppDataPackageDefinition?.packageDetails
                    .writes
                }{' '}
                / month
              </Text>
            ) : (
              <Text size="sm" className="text-gray-500">
                -
              </Text>
            )}
          </div>
        </section>
      </section>
    </section>
  )
}
