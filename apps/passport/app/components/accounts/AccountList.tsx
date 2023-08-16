import { AccountURNSpace } from '@proofzero/urns/account'
import type { AccountURN } from '@proofzero/urns/account'

import { List } from '@proofzero/design-system/src/atoms/lists/List'
import { Text } from '@proofzero/design-system/src/atoms/text/Text'

import type { AccountListItemProps } from './AccountListItem'
import { AccountListItem } from './AccountListItem'

export type AccountListProps = {
  accounts: AccountListItemProps[]
  primaryAccountURN: AccountURN
  showReconnectAccount?: boolean
  onSetPrimary?: (id: string) => void
}

export const AccountList = ({
  accounts,
  primaryAccountURN,
  showReconnectAccount = true,
  onSetPrimary,
}: AccountListProps) => {
  return accounts.length ? (
    <List
      items={accounts.map((ali) => ({
        key: ali.id,
        val: ali,
        primary:
          AccountURNSpace.decode(ali.id as AccountURN) ===
          AccountURNSpace.decode(primaryAccountURN),
      }))}
      itemRenderer={(item) => (
        <AccountListItem
          key={item.key}
          {...item.val}
          primary={item.primary}
          showReconnectAccount={showReconnectAccount}
          onSetPrimary={onSetPrimary}
        />
      )}
    />
  ) : (
    <div className="w-full flex flex-col items-center justify-center">
      <Text className="mb-[27px] text-gray-500">
        No Vaults Account Detected ☹️
      </Text>
    </div>
  )
}
