import { Link, useOutletContext } from '@remix-run/react'
import { GroupDetailsContextData } from '../$groupID'
import Breadcrumbs from '@proofzero/design-system/src/atoms/breadcrumbs/Breadcrumbs'

export default () => {
  const { group, groupID } = useOutletContext<GroupDetailsContextData>()
  return (
    <>
      {group && (
        <section className="-mt-4">
          <Breadcrumbs
            trail={[
              {
                label: 'Groups',
                href: '/spuorg',
              },
              {
                label: group.name,
                href: `/spuorg/${groupID}`,
              },
              {
                label: 'Create Application',
              },
            ]}
            LinkType={Link}
          />
        </section>
      )}
    </>
  )
}
