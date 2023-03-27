import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { ActionFunction, redirect } from '@remix-run/cloudflare'
import { Form } from '@remix-run/react'

export const action: ActionFunction = async ({ request, params }) => {
  const fd = await request.formData()

  const address = fd.get('address')
  if (!address) throw new Error('No address included in request')

  const qp = new URLSearchParams()
  qp.append('address', address as string)

  return redirect(
    `/authenticate/${params.clientId}/email/verify?${qp.toString()}`
  )
}

export default () => {
  return (
    <div
      className={
        'flex shrink flex-col items-center justify-center gap-4 mx-auto bg-white p-6 h-[100dvh] lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px] lg:border-rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      <Form className="flex-1 flex flex-col w-full" method="post">
        <section className="relative flex justify-center items-center mb-8">
          <HiOutlineArrowLeft
            className="absolute left-0 lg:left-0 lg:top-[0.15rem] w-6 h-6 cursor-pointer"
            onClick={() => history.back()}
          />

          <Text size="xl" weight="semibold" className="text-[#2D333A]">
            Your Email Address
          </Text>
        </section>
        <section className="flex-1">
          <Input
            type="address"
            id="address"
            label="Enter your email address"
            pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
            required
            autoFocus
          />
        </section>
        <section>
          <Button
            type="submit"
            btnSize="xl"
            btnType="primary-alt"
            className="w-full"
          >
            Send Code
          </Button>
        </section>
      </Form>
    </div>
  )
}
