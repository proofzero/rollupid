import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { redirect } from '@remix-run/cloudflare'
import { Form, useNavigate, useOutletContext } from '@remix-run/react'

import type { ActionFunction } from '@remix-run/cloudflare'

export const action: ActionFunction = async ({ request, params }) => {
  const fd = await request.formData()

  const email = fd.get('email')
  if (!email) throw new Error('No address included in request')

  const qp = new URLSearchParams()
  qp.append('email', email as string)

  return redirect(
    `/authenticate/${params.clientId}/email/verify?${qp.toString()}`
  )
}

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()

  const navigate = useNavigate()

  return (
    <div
      className={
        'flex shrink flex-col items-center\
         justify-center gap-4 mx-auto bg-white p-6 h-[100dvh]\
          lg:h-[675px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg'
      }
      style={{
        border: '1px solid #D1D5DB',
        boxSizing: 'border-box',
      }}
    >
      <Form className="flex-1 flex flex-col w-full" method="post">
        <section
          className="relative flex justify-center
         items-center mb-8 mt-6 "
        >
          <HiOutlineArrowLeft
            className="absolute left-0 lg:left-0 lg:top-[0.15rem] w-6 h-6
            text-gray-600 cursor-pointer"
            onClick={() => history.back()}
          />

          <Text size="xl" weight="semibold" className="text-[#2D333A]">
            Your Email Address
          </Text>
        </section>
        <section className="flex-1">
          <Input
            type="email"
            id="email"
            label="Enter your email address"
            className="h-12 rounded-lg"
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

      {prompt && (
        <div className="flex w-full">
          <Button
            btnSize="l"
            btnType="secondary-alt"
            className="w-full hover:bg-gray-100"
            onClick={() => navigate('/authenticate/cancel')}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
