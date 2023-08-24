import React, { useCallback, useEffect, useRef, useState } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Button } from '../../atoms/buttons/Button'
import { Text } from '../../atoms/text/Text'

import { CountdownCircleTimer } from 'react-countdown-circle-timer'

type EmailOTPValidatorProps = {
  loading: boolean

  email: string
  state: string

  invalid: boolean

  children?: JSX.Element

  goBack?: () => void
  onCancel?: () => void

  requestRegeneration: (email: string) => void
  requestVerification: (
    email: string,
    code: string,
    state: string
  ) => Promise<void>

  regenerationTimerSeconds?: number
}

export default function EmailOTPValidator({
  loading,
  email,
  state,
  invalid,
  children,
  goBack,
  onCancel,
  requestRegeneration,
  requestVerification,
  regenerationTimerSeconds = 30,
}: EmailOTPValidatorProps) {
  const inputLen = 6
  const inputRefs = Array.from({ length: inputLen }, () =>
    useRef<HTMLInputElement>()
  )

  const [fullCode, setFullCode] = useState('')
  const updateFullCode = useCallback(() => {
    const updatedCode = inputRefs.map((ir) => ir.current?.value).join('')
    setFullCode(updatedCode)
  }, [inputRefs])

  const [isInvalid, setIsInvalid] = useState(invalid)
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)

  const [regenerationRequested, setRegenerationRequested] = useState(false)
  const [showChildren, setShowChildren] = useState(true)

  const [loadedState, setLoadedState] = useState<undefined | string>()
  useEffect(() => {
    if (state) {
      setLoadedState(state)
    }
  }, [state])

  useEffect(() => {
    setIsInvalid(invalid)

    if (invalid) {
      setShowInvalidMessage(true)
      inputRefs[0].current.focus()
      inputRefs[0].current.select()
    }
  }, [invalid])

  useEffect(() => {
    const handleKeyPress = (evt: KeyboardEvent) => {
      if (
        evt.key === 'Enter' &&
        fullCode.length === inputLen &&
        !loading &&
        !isInvalid
      ) {
        evt.preventDefault()

        const asyncFn = async () => {
          requestVerification(email, fullCode, loadedState)
        }

        asyncFn()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [email, fullCode, loadedState, loading, isInvalid])

  return (
    <>
      <section
        className="relative flex justify-center items-center w-full
      mb-8 mt-6"
      >
        {goBack && (
          <HiOutlineArrowLeft
            className="absolute left-0 lg:left-0 lg:top-[0.15rem] w-6 h-6 cursor-pointer dark:text-white"
            onClick={goBack}
          />
        )}
        <Text
          size="xl"
          weight="semibold"
          className="text-[#2D333A] dark:text-white"
        >
          Please check your email
        </Text>
      </section>

      <section className="flex-1">
        <div className="flex flex-col items-center mt-4 mb-8 text-center">
          <Text className="text-gray-500 dark:text-gray-400">
            We&apos;ve sent a code to
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 font-medium w-[368px] inline-block float-left whitespace-nowrap truncate">
            {email}
          </Text>
        </div>

        <div className="grid grid-cols-6 gap-2.5">
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
              onClick={() => {
                inputRefs[i].current.focus()
              }}
              onChange={(ev) => {
                if (ev.target.value === '') return

                if (i !== inputLen - 1) {
                  inputRefs[(i + 1) % inputLen].current.value === ''
                  inputRefs[(i + 1) % inputLen].current.focus()
                  inputRefs[(i + 1) % inputLen].current.select()
                }
                updateFullCode()
              }}
              onKeyDown={(ev) => {
                if (
                  ev.key === 'Backspace' &&
                  inputRefs[i].current.value === '' &&
                  i !== 0
                ) {
                  inputRefs[(i - 1 + inputLen) % inputLen].current.focus()
                  inputRefs[(i - 1 + inputLen) % inputLen].current.select()
                }
              }}
              onKeyUp={(ev) => {
                updateFullCode()

                if (i === inputLen - 1) return

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
                if (isInvalid && inputRefs[i].current) {
                  setIsInvalid(false)
                }

                inputRefs[i].current?.select()
              }}
              className={`flex text-base lg:text-2xl py-7 px-3.5 h-20 justify-center items-center text-gray-600 dark:text-white dark:bg-gray-800 border rounded-lg text-center ${
                isInvalid ? 'border-red-500' : 'dark:border-gray-600'
              }`}
            />
          ))}
        </div>

        {!loading && (showInvalidMessage || invalid) && (
          <Text
            size="sm"
            weight="medium"
            className="text-red-500 mt-4 mb-2 text-center"
          >
            Wrong or expired code. Please try again.
          </Text>
        )}

        <div className="flex flex-col lg:flex-row space-x-1 justify-center items-center mt-4">
          <Text type="span" size="sm" className="text-gray-500">
            Did not get the code?
          </Text>
          <Text
            type="span"
            size="sm"
            className={`${
              regenerationRequested ? 'text-gray-300' : 'text-indigo-500'
            } cursor-pointer relative`}
            onClick={() => {
              if (regenerationRequested) return

              setRegenerationRequested(true)
              requestRegeneration(email)
              setShowChildren(true)
            }}
          >
            Click to send another
            {regenerationRequested && (
              <div className="absolute right-[-20px] top-[2.5px]">
                <CountdownCircleTimer
                  size={16}
                  strokeWidth={2}
                  isPlaying
                  duration={regenerationTimerSeconds}
                  rotation={'counterclockwise'}
                  colors={'#6366f1'}
                  isGrowing={true}
                  onComplete={() => {
                    setRegenerationRequested(false)
                    setShowChildren(false)
                  }}
                />
              </div>
            )}
          </Text>
        </div>

        {children && showChildren && <div className="my-3">{children}</div>}
      </section>

      <section className="flex flex-row space-x-4 w-full">
        {onCancel && (
          <Button
            btnSize="xl"
            btnType="secondary-alt-skin"
            className="flex-1 w-full"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          btnSize="xl"
          btnType="primary-alt-skin"
          className="flex-1 w-full"
          disabled={fullCode.length !== inputLen || loading || isInvalid}
          onClick={async () => {
            setShowInvalidMessage(false)

            await requestVerification(email, fullCode, loadedState)
          }}
        >
          Verify
        </Button>
      </section>
    </>
  )
}
