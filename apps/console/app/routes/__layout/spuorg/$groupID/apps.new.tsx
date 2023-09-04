import { Form, Link, NavLink, useOutletContext } from '@remix-run/react'
import { GroupDetailsContextData } from '../$groupID'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'
import { Text } from '@proofzero/design-system'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { commitFlashSession, requireJWT } from '~/utilities/session.server'
import { BadRequestError } from '@proofzero/errors'
import createCoreClient from '@proofzero/platform-clients/core'
import { generateTraceContextHeaders } from '@proofzero/platform-middleware/trace'
import {
  IdentityGroupURNSpace,
  IdentityGroupURN,
} from '@proofzero/urns/identity-group'
import { getAuthzHeaderConditionallyFromToken } from '@proofzero/utils'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const groupID = params.groupID as string
    const groupURN = IdentityGroupURNSpace.urn(
      groupID as string
    ) as IdentityGroupURN

    const jwt = await requireJWT(request, context.env)

    const fd = await request.formData()
    const appName = fd.get('app_name')
    if (!appName) {
      throw new BadRequestError({
        message: 'appName is required',
      })
    }

    const traceHeader = generateTraceContextHeaders(context.traceSpan)
    const coreClient = createCoreClient(context.env.Core, {
      ...getAuthzHeaderConditionallyFromToken(jwt),
      ...traceHeader,
    })

    try {
      const { clientId } = await coreClient.starbase.createApp.mutate({
        clientName: appName as string,
        identityGroupURN: groupURN,
      })

      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `Application created successfully.`,
          type: ToastType.Success,
        },
        context.env
      )

      return redirect(`/apps/${clientId}`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    } catch (ex) {
      const toastSession = await appendToastToFlashSession(
        request,
        {
          message: `There was an issue creating the application. Please try again.`,
          type: ToastType.Error,
        },
        context.env
      )

      return redirect(`/spuorg/${params.groupID}/apps/new`, {
        headers: {
          'Set-Cookie': await commitFlashSession(toastSession, context.env),
        },
      })
    }
  }
)

export default () => {
  const { group, groupID, apps } = useOutletContext<GroupDetailsContextData>()

  return (
    <>
      {group && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/spuorg',
              },
              {
                label: group.name,
                href: `/spuorg/${groupID}`,
              },
              {
                label: 'Create Application',
              },
            ]}
            LinkType={Link}
          />
        </section>
      )}

      <section className="mb-[87px]">
        <Text size="2xl" weight="semibold">
          Create Application
        </Text>
      </section>

      <section className="flex justify-center items-center">
        <Form className="flex flex-col gap-4 w-[464px]" method="post">
          <Input
            id="group_name"
            label="Group"
            readOnly
            disabled
            value={group.name}
          />

          <Input id="app_name" label="Application Name" required />

          <Button btnType="primary-alt" type="submit" className="w-full">
            Create Application
          </Button>
        </Form>
      </section>

      {apps.filter((a) => !a.groupID) && (
        <section>
          <NavLink to={`/spuorg/${groupID}/apps/transfer`}>Transfer!</NavLink>
        </section>
      )}
    </>
  )
}
