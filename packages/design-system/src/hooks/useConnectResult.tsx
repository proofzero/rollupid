import { ToastType, toast } from '../atoms/toast'
import { useEffect } from 'react'

export default (
  handledMessageTypes: string[] = ['SUCCESS', 'ACCOUNT_CONNECT_ERROR', 'CANCEL']
) => {
  useEffect(() => {
    const url = new URL(window.location.href)

    const connectResult = url.searchParams.get('rollup_result')
    if (connectResult) {
      if (handledMessageTypes.includes(connectResult)) {
        switch (connectResult) {
          case 'SUCCESS':
            toast(
              ToastType.Success,
              { message: 'Account connected' },
              { duration: 2000 }
            )
            break
          case 'ACCOUNT_CONNECT_ERROR':
            toast(
              ToastType.Error,
              {
                message: 'Could not connect this account to your identity.\
               It may be connected to another identity.' },
              { duration: 2000 }
            )
            break
          case 'ALREADY_CONNECTED_ERROR':
            toast(
              ToastType.Error,
              {
                message: 'Account is already connected to your identity.' },
              { duration: 2000 }
            )
          case 'CANCEL':
            toast(
              ToastType.Warning,
              { message: 'Cancelled' },
              { duration: 2000 }
            )
            break
        }
      }

      url.searchParams.delete('rollup_result')

      history.replaceState(null, '', url.toString())
    }
  }, [])
}
