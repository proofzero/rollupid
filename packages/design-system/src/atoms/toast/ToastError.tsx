import React from 'react'
import { HiXCircle } from 'react-icons/hi'
import { Toast } from './Toast'

type ToastErrorProps = {
  message: string
}

export const ToastError = ({
  message,
  remove,
}: ToastErrorProps & { remove: () => void }) => (
  <Toast
    remove={remove}
    message={message}
    PreMessage={<HiXCircle className="text-red-400 w-5 h-5" />}
    className="bg-red-50 text-red-600"
  />
)
