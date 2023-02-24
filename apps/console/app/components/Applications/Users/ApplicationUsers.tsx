import { Button, Text } from '@kubelt/design-system'
import type { AuthorizedProfile, edgesMetadata } from '~/types'
import missingImage from '../../../images/missing-img.svg'
import { noLoginsSvg } from '../LoginsPanel/LoginsPanel'
import { AccountURNSpace } from '@kubelt/urns/account'
import { HiOutlineExternalLink } from 'react-icons/hi'

export const ApplicationUsers = ({
  authorizedProfiles,
  error,
  PROFILE_APP_URL,
  metadata,
  loadUsers,
  PAGE_LIMIT,
}: {
  authorizedProfiles: AuthorizedProfile[]
  error?: any
  loadUsers: (val: number) => void
  PROFILE_APP_URL: string
  PAGE_LIMIT: number
  metadata: edgesMetadata
}) => {
  const Users = new Map<
    string,
    {
      imageURL?: string
      name?: string
      date?: string
    }
  >()

  authorizedProfiles.forEach((authProfile) => {
    const decodedAccountURN = AccountURNSpace.decode(authProfile.accountURN)

    // Keys are decoded accountURNs
    Users.set(decodedAccountURN, {
      name: authProfile.name!,
      date: new Date(authProfile.timestamp).toLocaleString('default', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      imageURL: authProfile.imageURL!,
    })
  })

  return (
    <div className="w-full">
      <Text size="2xl" weight="semibold" className="text-gray-900 pb-4">
        Users
      </Text>
      {!Users.size ? (
        <div
          className="flex flex-col bg-white
        shadow rounded-lg border justify-center items-center min-h-[360px] h-full"
        >
          {noLoginsSvg}

          <Text weight="medium" className="text-gray-500 mt-9 mt-2">
            No one signed up to your app yet.
          </Text>
          <Text weight="medium" className="text-gray-500">
            <a className="text-indigo-500" href="/">
              Go to Docs
            </a>{' '}
            and try the signup flow.
          </Text>
        </div>
      ) : (
        <div className="border flex-1 flex flex-col rounded-lg">
          <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-lg">
            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 flex-1 break-all"
            >
              USER ID
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 flex-1 px-2 break-all"
            >
              FIRST AUTHORIZATION
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-gray-500 flex-1 break-all text-right"
            >
              PROFILE
            </Text>
          </div>

          <div
            className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg"
          >
            {Array.from(Users.keys()).map((key, i) => (
              <article key={i} className="flex items-center py-5 px-8 border-t">
                <div
                  className="flex-1 flex flex-col 
                  items-start 
                  md:flex-row md:items-center
                  text-ellipsis md:space-x-4"
                >
                  <img
                    src={Users.get(key)?.imageURL || missingImage}
                    alt="account pfp"
                    className="max-h-[24px] max-w-[24px] rounded-full"
                  />
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 flex-1"
                  >
                    {Users.get(key)?.name}
                  </Text>
                </div>

                <Text
                  size="sm"
                  weight="medium"
                  className="text-ellipsis text-gray-500
                   flex-1 px-2"
                >
                  {Users.get(key)?.date}
                </Text>
                <a
                  className="flex-1 flex justify-end"
                  href={`${PROFILE_APP_URL}/p/${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    btnType="secondary-alt"
                    className="right-0 flex md:flex-row flex-col max-w-max 
                  text-xs leading-4 items-center md:space-x-2"
                  >
                    <HiOutlineExternalLink size={22} />
                    Public Profile
                  </Button>
                </a>
              </article>
            ))}
            <div className="flex items-center py-4 px-8 border-t justify-between">
              <Text className="text-gray-700">
                Showing {metadata.offset + 1} to{' '}
                {Math.min(metadata.offset + PAGE_LIMIT, metadata.edgesReturned)}{' '}
                of {metadata.edgesReturned} results
              </Text>
              <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row ml-2">
                <Button
                  type="button"
                  disabled={metadata.offset === 0}
                  btnSize="l"
                  btnType="secondary-alt"
                  onClick={() => {
                    loadUsers(metadata.offset - PAGE_LIMIT)
                  }}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  disabled={
                    metadata.offset + PAGE_LIMIT >= metadata.edgesReturned
                  }
                  btnSize="l"
                  btnType="secondary-alt"
                  onClick={() => {
                    loadUsers(metadata.offset + PAGE_LIMIT)
                  }}
                  className="sm:ml-4"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
