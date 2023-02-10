import React from 'react'
import { Text } from '@kubelt/design-system'
import type { AuthorizedProfile } from '~/types'
import missingImage from '~/images/missing-img.svg'

export const ApplicationUsers = ({
  authorizedProfiles,
}: {
  authorizedProfiles: AuthorizedProfile[]
}) => {
  const Users = new Map<
    string,
    { pfp?: string; name?: string; authNumber?: number; date?: string }
  >()

  authorizedProfiles.forEach((authProfile) => {
    if (Users.has(authProfile.accountURN)) {
      const user = Users.get(authProfile.accountURN)
      Users.set(authProfile.accountURN, {
        ...user,
        authNumber: user.authNumber + 1,
      })
    } else {
      Users.set(authProfile.accountURN, {
        name: authProfile.profile.displayName!,
        date: new Date(authProfile.timestamp).toLocaleString('default', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        pfp: authProfile.profile.pfp?.image!,
        authNumber: 1,
      })
    }
  })

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
            FIRST AUTHORIZATION
          </Text>
          <Text size="sm" weight="medium" className="text-gray-500 flex-1">
            NO. OF AUTHORIZATIONS
          </Text>
        </div>

        <div
          className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg"
        >
          {Array.from(Users.keys()).map((key, i) => (
            <article key={i} className={`flex items-center py-5 px-8 border-t`}>
              <div className="flex-1 flex flex-row items-center space-x-4">
                <img
                  src={Users.get(key)?.pfp || missingImage}
                  alt="account pfp"
                  className="max-h-[24px] max-w-[24px] rounded-full"
                />
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1"
                >
                  {Users.get(key).name}
                </Text>
              </div>

              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
                {Users.get(key)?.date}
              </Text>

              <Text size="sm" weight="medium" className="text-gray-500 flex-1">
                {Users.get(key)?.authNumber}
              </Text>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
