import { Tooltip } from 'flowbite-react'
import { FaCopy, FaDiscord, FaGlobe, FaTwitter } from 'react-icons/fa'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'

export type ProfileCardProps = {
  account: string
  claimed?: Date

  displayName?: string

  discordUrl?: string
  webUrl?: string
  twitterUrl?: string

  avatarUrl: string | undefined

  isNft?: boolean
}

const ProfileCard = ({
  account,
  displayName,
  avatarUrl,
  isNft = false,
  claimed,
  discordUrl,
  webUrl,
  twitterUrl,
}: ProfileCardProps) => {
  const shortenedAccount = `${account.substring(0, 4)} ... ${account.substring(
    account.length - 4
  )}`

  return (
    <div className="rounded-xl shadow-lg py-8 px-14 bg-white flex flex-col items-center">
      <div className="w-40 h-40 flex justify-center items-center">
        {!avatarUrl && <Spinner />}

        {avatarUrl && !isNft && (
          <img src={avatarUrl} className="w-40 h-40 rounded-full" />
        )}
        {avatarUrl && isNft && (
          <div
            className="w-40 h-40"
            style={{
              clipPath:
                'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
              boxShadow: 'inset 0px 10px 100px 10px white',
              transform: 'scale(1.2)',
            }}
          >
            <img src={avatarUrl} className="w-40 h-40" />
          </div>
        )}
      </div>

      <Text className="mt-5 mb-2.5 text-gray-600" weight="bold" size="2xl">
        {displayName ?? shortenedAccount}
      </Text>

      <div
        className="mb-7 cursor-pointer"
        onClick={() => {
          navigator.clipboard.writeText(account)
        }}
      >
        <Tooltip
          content="Copied!"
          trigger="click"
          animation="duration-1000"
          className="font-[Inter]"
        >
          <Text weight="semibold" className="text-gray-400 " size="xs">
            <span className="flex flex-row items-center">
              <FaCopy className="mr-3" />

              {shortenedAccount}
            </span>
          </Text>
        </Tooltip>
      </div>

      <div className={`mb-6 flex flex-row space-x-3`}>
        <a
          href={discordUrl}
          target={'_blank'}
          rel={'noopener noopener noreferrer'}
          className={`${discordUrl ? 'text-gray-500' : 'text-gray-100'}`}
        >
          <FaDiscord className="w-5 h-5" />
        </a>

        <a
          href={`${webUrl?.includes('://') ? webUrl : `http://${webUrl}`}`}
          target={'_blank'}
          rel={'noopener noopener noreferrer'}
          className={`${webUrl ? 'text-gray-500' : 'text-gray-100'}`}
        >
          <FaGlobe className="w-5 h-5" />
        </a>

        <a
          href={twitterUrl}
          target={'_blank'}
          rel={'noopener noopener noreferrer'}
          className={`${twitterUrl ? 'text-gray-500' : 'text-gray-100'}`}
        >
          <FaTwitter className="w-5 h-5" />
        </a>
      </div>

      <Text weight="medium" size="xs" className="text-gray-300">
        &nbsp;
        {/* {`${
          claimed
            ? `Joined ${formattedDate} ${claimed.getFullYear()}`
            : "Unclaimed Profile"
        }`} */}
      </Text>
    </div>
  )
}

export default ProfileCard
