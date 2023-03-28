import { HiOutlineArrowLeft } from 'react-icons/hi'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'
import { Input } from '@proofzero/design-system/src/atoms/form/Input'
import { Button } from '@proofzero/design-system/src/atoms/buttons/Button'
import { useState, useEffect } from 'react'

type EmailPanelProps = {
  loading: boolean
  error?: string

  onSendCode: (email: string) => Promise<void>
  onGoBack: () => void
}

export const EmailPanel = ({
  loading,
  error,
  onSendCode,
  onGoBack,
}: EmailPanelProps) => {
  const [isValidEmail, setIsValidEmail] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const handleKeyPress = (evt: KeyboardEvent) => {
      if (evt.key === 'Enter' && isValidEmail) {
        evt.preventDefault()
        onSendCode(email)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isValidEmail, email])

  return (
    <>
      <section className="relative flex justify-center items-center mb-8">
        <HiOutlineArrowLeft
          className="absolute -left-8 -top-8 lg:left-0 lg:top-0 w-6 h-6 cursor-pointer"
          onClick={onGoBack}
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
          pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
          required
          autoFocus
          onChange={(evt) => {
            setEmail(evt.target.value)
            setIsValidEmail(evt.target.checkValidity())
          }}
        />
      </section>

      {error && (
        <Text
          size="sm"
          weight="medium"
          className="text-red-500 mt-4 mb-2 text-center my-2"
        >
          {error}
        </Text>
      )}

      <section>
        <Button
          btnSize="xl"
          btnType="primary-alt"
          className="w-full"
          disabled={!isValidEmail || loading}
          onClick={() => onSendCode(email)}
        >
          Send Code
        </Button>
      </section>
    </>
  )
}
