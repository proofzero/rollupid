import React, { useCallback, useRef, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button } from '../../atoms/buttons/Button'
import { Text } from '../../atoms/text/Text'
import { Loader } from '../loader/Loader'

type EmailOTPValidatorProps = {
  email: string

  goBack?: () => void
  requestResend: (email: string) => Promise<void>
  requestVerification: (code: string) => Promise<boolean>
}

export default ({
  email,
  goBack,
  requestResend,
  requestVerification,
}: EmailOTPValidatorProps) => {
  const inputLen = 5
  const inputRefs = Array.from({ length: inputLen }, () =>
    useRef<HTMLInputElement>()
  )

  const [fullCode, setFullCode] = useState('')
  const updateFullCode = useCallback(() => {
    const updatedCode = inputRefs.map((ir) => ir.current?.value).join('')
    setFullCode(updatedCode)
  }, [inputRefs])

  const [isInvalid, setIsInvalid] = useState(false)
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="bg-white rounded-lg p-9 flex flex-col h-full">
      {loading && <Loader />}
      <section className="relative flex justify-center items-center">
        {goBack && (
          <HiOutlineArrowLeft
            className="absolute left-0 w-6 h-6 cursor-pointer"
            onClick={goBack}
          />
        )}
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
              key={i}
              autoFocus={i === 0}
              ref={ref}
              id={`code_${i}`}
              name={`code_${i}`}
              required
              maxLength={1}
              minLength={1}
              onChange={(ev) => {
                if (ev.target.value === '') return

                inputRefs[(i + 1) % inputLen].current.value === ''
                inputRefs[(i + 1) % inputLen].current.focus()
                inputRefs[(i + 1) % inputLen].current.select()

                updateFullCode()
              }}
              onKeyDown={(ev) => {
                if (
                  ev.key === 'Backspace' &&
                  inputRefs[i].current.value === ''
                ) {
                  inputRefs[(i - 1 + inputLen) % inputLen].current.focus()
                  inputRefs[(i - 1 + inputLen) % inputLen].current.select()
                }

                updateFullCode()
              }}
              onKeyUp={(ev) => {
                if (ev.key === inputRefs[i].current.value) {
                  inputRefs[(i + 1) % inputLen].current.focus()
                  inputRefs[(i + 1) % inputLen].current.select()
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

                updateFullCode()
              }}
              onFocus={() => {
                if (isInvalid) {
                  inputRefs[i].current.value = ''
                  setIsInvalid(false)
                }
              }}
              className={`flex text-2xl py-7 px-3.5 h-20 justify-center items-center text-gray-600 border rounded text-center ${
                isInvalid ? 'border-red-500' : ''
              }`}
            />
          ))}
        </div>

        {showInvalidMessage && (
          <Text
            size="sm"
            weight="medium"
            className="text-red-500 mt-4 mb-2 text-center"
          >
            Wrong or expired code. Please try again.
          </Text>
        )}

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
        <Button
          btnType="primary-alt"
          className="flex-1"
          disabled={fullCode.length !== inputLen || loading}
          onClick={async () => {
            setLoading(true)
            setShowInvalidMessage(false)

            const valid = await requestVerification(fullCode)
            setIsInvalid(!valid)

            if (!valid) {
              setShowInvalidMessage(true)
              inputRefs[0].current.focus()
              inputRefs[0].current.select()
            }

            setLoading(false)
          }}
        >
          Verify
        </Button>
      </section>
    </div>
  )
}
