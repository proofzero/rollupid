import { Button, Text } from '@kubelt/design-system'
import type { AuthorizedProfile } from '~/types'
import missingImage from '../../../images/missing-img.svg'
import { noLoginsSvg } from '../LoginsPanel/LoginsPanel'
import { AccountURNSpace } from '@kubelt/urns/account'

export const ApplicationUsers = ({
  authorizedProfiles,
  fetcherState,
  error,
  setOffset,
  offset,
  PROFILE_APP_URL,
}: {
  fetcherState: { loadingDetails: string; type: string }
  authorizedProfiles: AuthorizedProfile[]
  error?: any
  setOffset: (val: number) => void
  offset: number
  PROFILE_APP_URL: string
}) => {
  const Users = new Map<
    string,
    {
      numOfAuthorizations: number
      imageURL?: string
      name?: string
      date?: string
    }
  >()

  authorizedProfiles.forEach((authProfile) => {
    const decodedAccountURN = AccountURNSpace.decode(authProfile.accountURN)

    // Keys are decoded accountURNs
    if (Users.has(decodedAccountURN)) {
      const user = Users.get(decodedAccountURN)
      Users.set(decodedAccountURN, {
        ...user,
        numOfAuthorizations: user!.numOfAuthorizations + 1,
      })
    } else {
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
        numOfAuthorizations: 1,
      })
    }
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
              className="text-center md:text-left 
              text-gray-500 flex-1 break-all"
            >
              USER ID
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-center md:text-left 
              text-gray-500 flex-1 px-2 break-all"
            >
              FIRST AUTHORIZATION
            </Text>
            <Text
              size="sm"
              weight="medium"
              className="text-center md:text-left 
              text-gray-500 flex-1 break-all"
            >
              NO. OF AUTHORIZATIONS
            </Text>
          </div>

          <div
            className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg"
          >
            {Array.from(Users.keys()).map((key, i) => (
              <article key={i} className="flex items-center py-5 px-8 border-t">
                <a
                  href={`${PROFILE_APP_URL}/p/${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col 
                  items-start
                  md:flex-row md:items-center
                  text-ellipsis md:space-x-4"
                >
                  <img
                    src={Users.get(key)?.imageURL || missingImage}
                    alt="account pfp"
                    className="max-h-[24px] max-w-[24px] rounded-full
                      left-0"
                  />
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 flex-1"
                  >
                    {Users.get(key)?.name}
                  </Text>
                </a>

                <Text
                  size="sm"
                  weight="medium"
                  className="text-ellipsis text-gray-500
                   flex-1 max-[768px]:text-center px-2"
                >
                  {Users.get(key)?.date}
                </Text>
                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1 max-[768px]:text-center"
                >
                  {Users.get(key)?.numOfAuthorizations}
                </Text>
              </article>
            ))}
            <div className="flex items-center py-4 px-8 border-t justify-between">
              <Text className="text-gray-700">
                Showing {offset * 10 + 1} to {(offset + 1) * 10} results
              </Text>
              <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row ml-2">
                <Button
                  type="button"
                  disabled={offset === 0}
                  btnSize="l"
                  btnType="secondary-alt"
                  onClick={() => {
                    setOffset(offset - 1)
                  }}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  btnSize="l"
                  btnType="secondary-alt"
                  onClick={() => {
                    setOffset(offset + 1)
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
