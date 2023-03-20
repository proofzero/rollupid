import React from 'react'

import { ToastWithLink, ToastWithLinkProps } from './ToastWithLink'
import { ToastInfo } from './ToastInfo'
import { ToastSuccess } from './ToastSuccess'
import { ToastWarning } from './ToastWarning'
import { ToastError } from './ToastError'

import { toast as rhToast, Toaster, ToastOptions } from 'react-hot-toast'
import { ToastMessageProps } from './Toast'

enum ToastType {
  WithLink,
  Info,
  Success,
  Warning,
  Error,
}

const toast = (
  type: ToastType,
  props: ToastMessageProps | ToastWithLinkProps,
  opts?: ToastOptions
) => {
  let component: JSX.Element

  const remove = () => {
    rhToast.remove()
  }

  switch (type) {
    case ToastType.WithLink:
      component = (
        <ToastWithLink remove={remove} {...(props as ToastWithLinkProps)} />
      )
      break
    case ToastType.Info:
      component = <ToastInfo remove={remove} {...props} />
      break
    case ToastType.Success:
      component = <ToastSuccess remove={remove} {...props} />
      break
    case ToastType.Warning:
      component = <ToastWarning remove={remove} {...props} />
      break
    case ToastType.Error:
      component = <ToastError remove={remove} {...props} />
      break
  }

  return rhToast.custom(component, opts)
}

export { toast, Toaster, ToastType }
