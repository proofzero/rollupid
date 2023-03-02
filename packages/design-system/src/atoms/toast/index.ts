import { ToastWithLink } from './ToastWithLink'
import { ToastInfo } from './ToastInfo'
import { ToastSuccess } from './ToastSuccess'
import { ToastWarning } from './ToastWarning'
import { ToastError } from './ToastError'

enum ToastType {
  WithLink,
  Info,
  Success,
  Warning,
  Error,
}

export {
  ToastWithLink,
  ToastInfo,
  ToastSuccess,
  ToastWarning,
  ToastError,
  ToastType,
}
