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

  switch (type) {
    case ToastType.WithLink:
      component = <ToastWithLink {...(props as ToastWithLinkProps)} />
      break
    case ToastType.Info:
      component = <ToastInfo {...props} />
      break
    case ToastType.Success:
      component = <ToastSuccess {...props} />
      break
    case ToastType.Warning:
      component = <ToastWarning {...props} />
      break
    case ToastType.Error:
      component = <ToastError {...props} />
      break
  }

  return rhToast.custom(component, opts)
}

export { toast, Toaster, ToastType }
