import React from 'react'
import { HiInformationCircle } from 'react-icons/hi'
import { IoWarning } from 'react-icons/io5'
import { Text } from '../text/Text'
import { Toast } from './Toast'

export type ToastWithLinkProps = {
  message: string
  linkHref: string
  linkText: string
  type?: 'urgent' | 'deferred' | 'warning'
  remove?: () => void
}

const ToastIcon = {
  urgent: <IoWarning className="text-black w-5 h-5" />,
  deferred: <HiInformationCircle className="text-indigo-400 w-5 h-5" />,
}

const ToastStyle = {
  urgent: 'bg-yellow-200 text-black w-full px-6',
  deferred: 'bg-indigo-50 text-indigo-700 w-full',
  warning: 'bg-orange-50 text-orange-600 w-full',
}

export const ToastWithLink = ({
  message,
  remove,
  linkHref,
  linkText,
  type = 'deferred',
}: ToastWithLinkProps) => (
  <Toast
    message={message}
    remove={remove}
    PreMessage={ToastIcon[type]}
    PostMessage={
      <a href={linkHref}>
        <Text size="sm" weight="medium">
          {`${linkText} ->`}
        </Text>
      </a>
    }
    className={ToastStyle[type]}
  />
)
