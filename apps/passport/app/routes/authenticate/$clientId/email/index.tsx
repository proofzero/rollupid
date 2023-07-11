import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { redirect } from '@remix-run/cloudflare'
import { useTransition } from '@remix-run/react'
import {
  Form,
  useNavigate,
  useOutletContext,
  useSubmit,
} from '@remix-run/react'

import type { ActionFunction } from '@remix-run/cloudflare'
import {
  BadRequestError,
  ERROR_CODES,
  HTTP_STATUS_CODES,
} from '@proofzero/errors'
import { generateEmailOTP } from '~/utils/emailOTP'
import { useState } from 'react'

export const action: ActionFunction = async ({ request, params }) => {
  const fd = await request.formData()

  const email = fd.get('email')
  if (!email)
    throw new BadRequestError({ message: 'No address included in request' })
  const state = fd.get('state')
  if (!state)
    throw new BadRequestError({ message: 'No state included in request' })

  const qp = new URLSearchParams()
  qp.append('email', email as string)
  qp.append('state', state as string)

  return redirect(
    `/authenticate/${params.clientId}/email/verify?${qp.toString()}`
  )
}

export default () => {
  const { prompt } = useOutletContext<{
    prompt?: string
  }>()

  const [email, setEmail] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const navigate = useNavigate()
  const submit = useSubmit()
  const transition = useTransition()

  return (
    <div
      className={
        'flex shrink flex-col items-center\
         justify-center gap-4 mx-auto bg-white p-6 h-[100dvh]\
          lg:h-[580px] lg:max-h-[100dvh] w-full lg:w-[418px]\
          lg:rounded-lg dark:bg-gray-800 border border-[#D1D5DB] dark:border-gray-600'
      }
      style={{
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
            text-gray-600 dark:text-white cursor-pointer"
            onClick={() => history.back()}
          />

          <Text
            size="xl"
            weight="semibold"
            className="text-[#2D333A] dark:text-white"
          >
            Your Email Address
          </Text>
        </section>
        <section className="flex-1">
          <Input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            label="Enter your email address"
            className="h-12 rounded-lg"
            autoFocus
          />
          {errorMessage ? (
            <Text
              size="sm"
              weight="medium"
              className="text-red-500 mt-4 mb-2 text-center"
            >
              {errorMessage}
            </Text>
          ) : undefined}
        </section>
        <section>
          <Button
            type="submit"
            btnSize="xl"
            onClick={async (e: any) => {
              e.preventDefault()
              e.stopPropagation()
              try {
                const result = await generateEmailOTP(email)
                if (result?.state && result.state.length) {
                  submit({ email, state: result.state }, { method: 'post' })
                }
                if (
                  result?.status === HTTP_STATUS_CODES[ERROR_CODES.BAD_REQUEST]
                ) {
                  setErrorMessage(result.message)
                } else if (errorMessage.length) {
                  // In the case error was hit in last call
                  // here we want to reset the error message
                  setErrorMessage('')
                }
              } catch (e: any) {
                setErrorMessage(e.message ? e.message : e.toString())
              }
            }}
            disabled={transition.state !== 'idle'}
            btnType="primary-alt-skin"
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
            btnType="secondary-alt-skin"
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
