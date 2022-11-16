import { useSubmit } from '@remix-run/react'
import { Authentication } from '~/components'

export default function Authenticate() {
  const submit = useSubmit()
  return (
    <Authentication
      connectCallback={async (address) => {
        submit(null, { method: 'get', action: `/authenticate/sign/${address}` })
      }}
      errorCallback={(error) => console.error(error)}
    />
  )
}
