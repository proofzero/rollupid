import { List } from '@proofzero/design-system/src/atoms/lists/List'
import type { AccountListItemProps } from './AccountListItem'
import { AccountListItem } from './AccountListItem'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

export type AccountListProps = {
  accounts: AccountListItemProps[]
}

export const AccountList = ({ accounts }: AccountListProps) => {
  return accounts.length ? (
    <List
      items={accounts.map((ali) => ({ key: ali.id, val: ali }))}
      itemRenderer={(item) => <AccountListItem key={item.key} {...item.val} />}
    />
  ) : (
    <div className="w-full flex flex-col items-center justify-center">
      <Text className="mb-[27px] text-gray-500">
        No Vaults Account Detected ☹️
      </Text>
    </div>
  )
}
