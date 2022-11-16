import { Authentication } from '~/components/authentication/Authentication'

export default function Index() {
  return (
    <div className={'flex flex-col h-screen justify-center items-center'}>
      <Authentication
        connectCallback={(address) => console.log(address)}
        errorCallback={(error) => console.error(error)}
      />
    </div>
  )
}
