import { Button } from '@proofzero/design-system'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import { ListIdentityGroupsOutput } from '@proofzero/platform/identity/src/jsonrpc/methods/identity-groups/listIdentityGroups'
import { NavLink, useOutletContext } from '@remix-run/react'
import { Text } from '@proofzero/design-system'
import { DangerPill } from '@proofzero/design-system/src/atoms/pills/DangerPill'
import { IdentityGroupURN } from '@proofzero/urns/identity-group'

export default () => {
  const { groups, nastyIG } = useOutletContext<{
    groups: ListIdentityGroupsOutput
    nastyIG: IdentityGroupURN[]
  }>()
  return (
    <>
      <section className="flex flex-col lg:flex-row items-center justify-between mb-6">
        <div className="flex flex-row items-center space-x-3">
          <Text
            size="2xl"
            weight="semibold"
            className="text-gray-900 ml-2 lg:ml-0 "
          >
            Billing & Invoicing
          </Text>
        </div>
      </section>

      <List
        items={[
          {
            key: 'self',
            val: undefined,
          },
        ]}
        itemRenderer={() => (
          <article className="flex flex-row justify-between items-center flex-1">
            <Text weight="semibold" className="text-gray-800">
              Personal
            </Text>

            <section className="flex flex-row items-center gap-4">
              <NavLink to={`/billing/personal`} className="p-2">
                <Button btnSize="sm" btnType="secondary-alt">
                  Manage Billing
                </Button>
              </NavLink>
            </section>
          </article>
        )}
      />

      <List
        items={groups.map((g) => ({
          key: g.URN,
          val: g,
        }))}
        itemRenderer={(item) => (
          <article className="flex flex-row justify-between items-center flex-1">
            <Text weight="semibold" className="text-gray-800">
              {item.val.name}
            </Text>

            <section className="flex flex-row items-center gap-4">
              {!item.val.flags.billingConfigured && (
                <DangerPill text="Not Configured" />
              )}
              {nastyIG.includes(item.val.URN) && (
                <DangerPill text="Update Payment Information" />
              )}
              <NavLink
                to={`/billing/groups/${item.val.URN.split('/')[1]}`}
                className="p-2"
              >
                <Button btnSize="sm" btnType="secondary-alt">
                  Manage Billing
                </Button>
              </NavLink>
            </section>
          </article>
        )}
      />
    </>
  )
}
