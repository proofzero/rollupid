import React from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button } from '../../atoms/buttons/Button'
import { Input } from '../../atoms/form/Input'
import { Text } from '../../atoms/text/Text'

type EmailOTPValidatorProps = {
  email: string

  goBack: () => void
  requestResend: (email: string) => void
}

export default ({ email, goBack, requestResend }: EmailOTPValidatorProps) => (
  <div className="bg-white rounded-lg p-9 flex flex-col h-full">
    <section className="relative flex justify-center items-center">
      <HiOutlineArrowLeft
        className="absolute left-0 w-6 h-6 cursor-pointer"
        onClick={goBack}
      />
      <Text size="xl" weight="semibold" className="text-[#2D333A]">
        Please check your email
      </Text>
    </section>

    <section className="flex-1">
      <div className="flex flex-col items-center mt-4 mb-8">
        <Text className="text-gray-500">We've sent a code to</Text>
        <Text className="text-gray-500 font-medium">{email}</Text>
      </div>

      <div>
        <Input id="code" label={''} />
      </div>

      <div className="flex flex-row space-x-1 justify-center items-center mt-4">
        <Text type="span" size="sm" className="text-gray-500">
          Didn't get the code?
        </Text>
        <Text
          type="span"
          size="sm"
          className="text-indigo-500 cursor-pointer"
          onClick={() => requestResend(email)}
        >
          Click to resend
        </Text>
      </div>
    </section>

    <section className="flex flex-row space-x-4">
      <Button btnType="secondary-alt" className="flex-1">
        Cancel
      </Button>
      <Button btnType="primary-alt" className="flex-1" disabled>
        Verify
      </Button>
    </section>
  </div>
)
