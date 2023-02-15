import { Button } from '@kubelt/design-system'
import { Text } from '@kubelt/design-system'

const NoCryptoAddresses = ({
  redirectHandler,
}: {
  redirectHandler: () => void
}) => {
  return (
    <div
      className="w-full h-[40vh] border rounded-lg 
      flex flex-col items-center justify-center"
    >
      <Text className="mb-[27px] text-gray-500">
        No Crypto Account Detected ☹️
      </Text>
      <Button
        btnType="secondary-alt"
        className="bg-gray-100 border-none"
        btnSize="l"
        onClick={() => {
          redirectHandler()
        }}
      >
        <Text className="text-gray-600">Manage Accounts</Text>
      </Button>
    </div>
  )
}

export default NoCryptoAddresses