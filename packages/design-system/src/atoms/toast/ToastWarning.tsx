import React from 'react'
import { HiExclamation } from 'react-icons/hi'
import { Toast } from './Toast'

type ToastWarningProps = {
  message: string
}

export const ToastWarning = ({
  message,
  remove,
}: ToastWarningProps & { remove?: () => void }) => (
  <Toast
    remove={remove}
    message={message}
    PreMessage={<HiExclamation className="text-orange-400 w-5 h-5" />}
    className="bg-orange-50 text-orange-600"
  />
)
