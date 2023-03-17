import React, { useCallback, useRef, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button } from '../../atoms/buttons/Button'
import { Text } from '../../atoms/text/Text'

type EmailOTPValidatorProps = {
  email: string

  goBack: () => void
  requestResend: (email: string) => void
}

export default ({ email, goBack, requestResend }: EmailOTPValidatorProps) => {
  const inputLen = 5
  const [inputRefs] = useState(() =>
    Array.from({ length: inputLen }, () => useRef<HTMLInputElement>())
  )

  return (
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

        <div className="grid grid-cols-5 gap-2.5">
          {inputRefs.map((ref, i) => (
            <input
              autoFocus={i === 0}
              ref={ref}
              id={`code_${i}`}
              name={`code_${i}`}
              maxLength={1}
              minLength={1}
              onChange={(ev) => {
                if (ev.target.value === '') return

                inputRefs[(i + 1) % inputLen].current.value === ''
                inputRefs[(i + 1) % inputLen].current.focus()
                inputRefs[(i + 1) % inputLen].current.select()
              }}
              onKeyDown={(ev) => {
                if (
                  ev.key === 'Backspace' &&
                  inputRefs[i].current.value === ''
                ) {
                  inputRefs[(i - 1 + inputLen) % inputLen].current.focus()
                  inputRefs[(i - 1 + inputLen) % inputLen].current.select()
                }
              }}
              onPaste={(ev) => {
                ev.preventDefault()
                const text = ev.clipboardData.getData('text')
                text
                  .split('')
                  .slice(0, inputLen)
                  .forEach((char, j) => {
                    inputRefs[(i + j) % inputLen].current.value = char
                    inputRefs[(i + j) % inputLen].current.blur()
                  })
              }}
              className="flex text-2xl py-7 px-3.5 h-20 justify-center items-center text-gray-600 border rounded text-center"
            />
          ))}
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
}
