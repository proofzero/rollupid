import { Button } from '@proofzero/design-system'
import { Text } from '@proofzero/design-system'

const NoCryptoAccounts = ({
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
        className="bg-gray-100 hover:bg-gray-200 border-none"
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

export default NoCryptoAccounts
