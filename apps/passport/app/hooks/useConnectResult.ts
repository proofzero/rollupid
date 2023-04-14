import { ToastType, toast } from '@proofzero/design-system/src/atoms/toast'
import { useEffect } from 'react'

export default (
  handledMessageTypes: string[] = ['SUCCESS', 'ALREADY_CONNECTED']
) => {
  useEffect(() => {
    const url = new URL(window.location.href)

    const connectResult = url.searchParams.get('connect_result')
    if (connectResult) {
      if (!handledMessageTypes.includes(connectResult)) {
        return
      }

      switch (connectResult) {
        case 'SUCCESS':
          toast(
            ToastType.Success,
            { message: 'Account connected' },
            { duration: 2000 }
          )
          break
        case 'ALREADY_CONNECTED':
          toast(
            ToastType.Error,
            { message: 'Account already connected' },
            { duration: 2000 }
          )
          break
      }

      url.searchParams.delete('connect_result')

      history.replaceState(null, '', url.toString())
    }
  }, [])
}
