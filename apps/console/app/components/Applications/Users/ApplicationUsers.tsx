import React from 'react'
import { Text } from '@kubelt/design-system'

export const ApplicationUsers = () => {
  const users = [
    { name: '0ndrej.eth', firstAuth: 'Feb 17 2022 18:32:32', number: 1 },
    { name: '0xd...a4q1', firstAuth: 'Feb 17 2022 18:32:32', number: 2 },
    { name: '0x8...1dq0', firstAuth: 'Feb 17 2022 18:32:32', number: 3 },
  ]

  return (
    <div>
      <Text size="2xl" weight="semibold" className="text-gray-900 pb-6">
        Users
      </Text>
      <div className="border flex-1 flex flex-col rounded-lg">
        <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-lg">
          <Text size="sm" weight="medium" className="text-gray-500 flex-1">
            USER ID
          </Text>
          <Text size="sm" weight="medium" className="text-gray-500 flex-1">
            FIRST AUTHORIZATIONS
          </Text>
          <Text size="sm" weight="medium" className="text-gray-500 flex-1">
            NO. OF AUTHORIZATIONS
          </Text>
        </div>

        <div
          className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg"
        >
          {users.map((user, i) => (
            <article key={i} className={`flex items-center py-5 px-8 border-t`}>
              <div className="flex-1 flex flex-row items-center space-x-4">
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1"
                >
                  {user.name}
                </Text>
              </div>

              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
                {user.firstAuth}
              </Text>

              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
                {user.number}
              </Text>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
