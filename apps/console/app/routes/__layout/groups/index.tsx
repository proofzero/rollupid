import { Form, NavLink, useNavigate, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../groups'
import { Button, Text } from '@proofzero/design-system'
import { HiDotsVertical, HiUserGroup } from 'react-icons/hi'
import { List } from '@proofzero/design-system/src/atoms/lists/List'
import MultiAvatar from '@proofzero/design-system/src/molecules/avatar/MultiAvatar'

export default () => {
  const { groups } = useOutletContext<GroupRootContextData>()
  const navigate = useNavigate()

  return (
    <>
      <section className="flex flex-row items-center justify-between mb-5">
        <Text size="2xl" weight="semibold">
          Groups
        </Text>

        <Button
          btnType="primary-alt"
          className="flex flex-row items-center gap-2"
        >
          <HiUserGroup />
          Create Group
        </Button>
      </section>

      <section>
        <List
          items={groups.map((g) => ({
            key: g.URN,
            val: g,
          }))}
          itemRenderer={(item) => (
            <article
              key={item.key}
              className="flex flex-row items-center justify-between w-full hover:bg-gray-50"
            >
              <div>
                <Text size="base" weight="semibold" className="text-gray-800">
                  {item.val.name}
                </Text>
                <Text size="sm" weight="normal" className="text-gray-500">
                  No applications
                </Text>
              </div>

              <div className="flex flex-row items-center gap-3">
                <MultiAvatar
                  avatars={item.val.members.map((m) => m.iconURL)}
                  cutoff={3}
                  size={32}
                />

                <button
                  className="p-2"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <HiDotsVertical />
                </button>
              </div>
            </article>
          )}
          onItemClick={(item) => {
            navigate(`/groups/${item.val.URN.split('/')[1]}`)
          }}
        ></List>
      </section>
      <section>
        <Form method="post" action="/groups/create">
          <input type="text" name="name" />
          <button type="submit">Create Group</button>
        </Form>
      </section>

      <section>
        <ul>
          {groups.map((group) => (
            <li key={group.URN}>
              <NavLink to={`/groups/${group.URN.split('/')[1]}`}>
                {group.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
