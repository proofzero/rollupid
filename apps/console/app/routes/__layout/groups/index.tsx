import { Form, NavLink, useOutletContext } from '@remix-run/react'
import { GroupRootContextData } from '../groups'

export default () => {
  const { groups } = useOutletContext<GroupRootContextData>()

  return (
    <>
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
