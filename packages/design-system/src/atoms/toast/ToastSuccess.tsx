import React from 'react'
import { HiCheckCircle } from 'react-icons/hi'
import { Toast } from './Toast'

type ToastSuccessProps = {
  message: string
}

export const ToastSuccess = ({
  message,
  remove,
}: ToastSuccessProps & { remove: () => void }) => (
  <Toast
    message={message}
    PreMessage={<HiCheckCircle className="text-green-400 w-5 h-5" />}
    remove={remove}
    className="bg-green-50 text-green-700"
  />
)
