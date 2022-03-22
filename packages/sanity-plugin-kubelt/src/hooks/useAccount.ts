import {useState, useEffect} from 'react'

import {$account} from '../domain/kubeltWallet'

export const useAccount = () => {
  const [account, setAccount] = useState(null)

  useEffect(() => {
    const accountSub = $account.subscribe((updAccount) => setAccount(updAccount))

    return () => {
      accountSub.unsubscribe()
    }
  }, [])

  return account
}

export default useAccount
