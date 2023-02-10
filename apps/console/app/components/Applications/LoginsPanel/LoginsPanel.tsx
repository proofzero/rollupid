import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { Tooltip } from 'flowbite-react'
import type { AuthorizedProfile } from '~/types'

import missingImage from '~/images/missing-img.svg'

const noLoginsSvg = (
  <svg
    width="148"
    height="164"
    viewBox="0 0 148 164"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M74 155.893C114.869 155.893 148 122.762 148 81.8931C148 41.024 114.869 7.89307 74 7.89307C33.1309 7.89307 0 41.024 0 81.8931C0 122.762 33.1309 155.893 74 155.893Z"
      fill="#F9FAFB"
    />
    <path
      d="M116.427 50.3198H31.574C28.8494 50.3198 26.6406 52.5286 26.6406 55.2532V158.853C26.6406 161.578 28.8494 163.786 31.574 163.786H116.427C119.152 163.786 121.361 161.578 121.361 158.853V55.2532C121.361 52.5286 119.152 50.3198 116.427 50.3198Z"
      fill="white"
    />
    <path
      d="M64.1348 65.1196H38.4815C36.8467 65.1196 35.5215 66.4449 35.5215 68.0796C35.5215 69.7144 36.8467 71.0396 38.4815 71.0396H64.1348C65.7696 71.0396 67.0948 69.7144 67.0948 68.0796C67.0948 66.4449 65.7696 65.1196 64.1348 65.1196Z"
      fill="#F3F4F6"
    />
    <path
      d="M81.8948 77.9458H38.4815C36.8467 77.9458 35.5215 79.271 35.5215 80.9058C35.5215 82.5406 36.8467 83.8658 38.4815 83.8658H81.8948C83.5296 83.8658 84.8548 82.5406 84.8548 80.9058C84.8548 79.271 83.5296 77.9458 81.8948 77.9458Z"
      fill="#F9FAFB"
    />
    <path
      d="M64.1348 91.7598H38.4815C36.8467 91.7598 35.5215 93.085 35.5215 94.7198C35.5215 96.3545 36.8467 97.6798 38.4815 97.6798H64.1348C65.7696 97.6798 67.0948 96.3545 67.0948 94.7198C67.0948 93.085 65.7696 91.7598 64.1348 91.7598Z"
      fill="#F3F4F6"
    />
    <path
      d="M81.8948 104.586H38.4815C36.8467 104.586 35.5215 105.911 35.5215 107.546C35.5215 109.181 36.8467 110.506 38.4815 110.506H81.8948C83.5296 110.506 84.8548 109.181 84.8548 107.546C84.8548 105.911 83.5296 104.586 81.8948 104.586Z"
      fill="#F9FAFB"
    />
    <path
      d="M64.1348 118.4H38.4815C36.8467 118.4 35.5215 119.726 35.5215 121.36C35.5215 122.995 36.8467 124.32 38.4815 124.32H64.1348C65.7696 124.32 67.0948 122.995 67.0948 121.36C67.0948 119.726 65.7696 118.4 64.1348 118.4Z"
      fill="#F3F4F6"
    />
    <path
      d="M81.8948 131.227H38.4815C36.8467 131.227 35.5215 132.552 35.5215 134.187C35.5215 135.821 36.8467 137.147 38.4815 137.147H81.8948C83.5296 137.147 84.8548 135.821 84.8548 134.187C84.8548 132.552 83.5296 131.227 81.8948 131.227Z"
      fill="#F9FAFB"
    />
    <path
      d="M116.427 0H31.574C28.8494 0 26.6406 2.20873 26.6406 4.93333V34.5333C26.6406 37.2579 28.8494 39.4667 31.574 39.4667H116.427C119.152 39.4667 121.361 37.2579 121.361 34.5333V4.93333C121.361 2.20873 119.152 0 116.427 0Z"
      fill="#E5E7EB"
    />
    <path
      d="M64.1329 10.8535H38.4795C36.8448 10.8535 35.5195 12.1788 35.5195 13.8135C35.5195 15.4483 36.8448 16.7735 38.4795 16.7735H64.1329C65.7676 16.7735 67.0929 15.4483 67.0929 13.8135C67.0929 12.1788 65.7676 10.8535 64.1329 10.8535Z"
      fill="white"
    />
    <path
      d="M81.8929 23.6797H38.4795C36.8448 23.6797 35.5195 25.0049 35.5195 26.6397C35.5195 28.2745 36.8448 29.5997 38.4795 29.5997H81.8929C83.5276 29.5997 84.8529 28.2745 84.8529 26.6397C84.8529 25.0049 83.5276 23.6797 81.8929 23.6797Z"
      fill="white"
    />
  </svg>
)

type LoginsPanelProps = {
  authorizedProfiles: AuthorizedProfile[]
}

export const LoginsPanel = ({ authorizedProfiles }: LoginsPanelProps) => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <Text className="text-gray-600 py-6" weight="medium" size="lg">
        Users
      </Text>
      {authorizedProfiles.length ? (
        <div className="border flex-1 flex flex-col rounded-lg h-full pt-2">
          <div className="bg-[#F9FAFB] flex items-center py-5 px-8 rounded-lg">
            <Text size="sm" weight="medium" className="text-gray-500 flex-1">
              USER ID
            </Text>
            <Text size="sm" weight="medium" className="text-gray-500 flex-1">
              APPROVED
            </Text>
          </div>

          <div
            className="flex flex-1 flex-col bg-white rounded-br-lg
          rounded-bl-lg h-full"
          >
            {authorizedProfiles.map((user, i) => (
              <article key={i} className={`flex items-center py-5 px-8`}>
                <div className="flex-1 flex flex-row items-center space-x-4">
                  <img
                    src={user.profile.pfp?.image || missingImage}
                    alt="account pfp"
                    className="max-h-[24px] max-w-[24px] rounded-full"
                  />
                  <Text
                    size="sm"
                    weight="medium"
                    className="text-gray-500 flex-1"
                  >
                    {user.profile.displayName}
                  </Text>
                </div>

                <Text
                  size="sm"
                  weight="medium"
                  className="text-gray-500 flex-1"
                >
                  {new Date(user.timestamp).toLocaleString('default', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Text>
              </article>
            ))}
            <div className="b-0">
              <div className="w-full px-8">
                <div className="border-t border-gray-200"></div>
              </div>

              <div className="flex flex-row justify-center">
                <Tooltip content="Coming soon!" trigger="hover">
                  <Text
                    size="sm"
                    weight="medium"
                    className="cursor-pointer text-indigo-500 my-4"
                  >
                    View All
                  </Text>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col bg-[#F9FAFB] justify-center items-center h-full">
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
      )}
    </div>
  )
}
