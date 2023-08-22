import { Form, Link, useOutletContext } from '@remix-run/react'
import { GroupDetailsContextData } from '../$groupID'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'
import { Text } from '@proofzero/design-system'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { getRollupReqFunctionErrorWrapper } from '@proofzero/utils/errors'
import { appendToastToFlashSession } from '~/utils/toast.server'
import { ToastType } from '@proofzero/design-system/src/atoms/toast'
import { commitFlashSession } from '~/utilities/session.server'

export const action: ActionFunction = getRollupReqFunctionErrorWrapper(
  async ({ request, context, params }) => {
    const toastSession = await appendToastToFlashSession(
      request,
      {
        message: `Awesome`,
        type: ToastType.Success,
      },
      context.env
    )

    return redirect(`/spuorg/${params.groupID}/apps/new`, {
      headers: {
        'Set-Cookie': await commitFlashSession(toastSession, context.env),
      },
    })
  }
)

export default () => {
  const { group, groupID } = useOutletContext<GroupDetailsContextData>()

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
    </>
  )
}
