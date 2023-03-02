import React from 'react'
import { HiInformationCircle } from 'react-icons/hi'
import { Text } from '../text/Text'
import { Toast } from './Toast'

type ToastWithLinkProps = {
  message: string

  linkHref: string
  linkText: string
}

export const ToastWithLink = ({
  message,
  linkHref,
  linkText,
}: ToastWithLinkProps) => (
  <Toast
    message={message}
    PreMessage={<HiInformationCircle className="text-indigo-400 w-5 h-5" />}
    PostMessage={
      <a href={linkHref}>
        <Text size="sm" weight="medium">
          {`${linkText} ->`}
        </Text>
      </a>
    }
    className="bg-indigo-50 text-indigo-700 w-full"
  />
)
