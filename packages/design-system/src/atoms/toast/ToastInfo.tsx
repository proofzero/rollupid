import React from 'react'
import { HiInformationCircle } from 'react-icons/hi'
import { Toast } from './Toast'

type ToastInfoProps = {
  message: string
}

export const ToastInfo = ({
  message,
  remove,
}: ToastInfoProps & { remove: () => void }) => (
  <Toast
    remove={remove}
    message={message}
    PreMessage={<HiInformationCircle className="text-indigo-400 w-5 h-5" />}
    className="bg-indigo-50 text-indigo-700"
  />
)
