import { Button } from '@proofzero/design-system'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import { ListIdentityGroupsOutput } from '@proofzero/platform/account/src/jsonrpc/methods/identity-groups/listIdentityGroups'
import { NavLink, useOutletContext } from '@remix-run/react'

export default () => {
  const { groups } = useOutletContext<{
    groups: ListIdentityGroupsOutput
  }>()
  return (
    <List
      items={groups.map((g) => ({
        key: g.URN,
        val: g,
      }))}
      itemRenderer={(item) => (
        <article className="flex flex-row justify-between items-center flex-1">
          <h2>{item.val.name}</h2>
          <NavLink
            to={`/billing/spuorg/${item.val.URN.split('/')[1]}`}
            className="p-2"
          >
            <Button btnType="secondary-alt">Manage Billing</Button>
          </NavLink>
        </article>
      )}
    />
  )
}
