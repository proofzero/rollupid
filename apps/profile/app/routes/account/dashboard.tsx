import { useOutletContext } from '@remix-run/react'
import { FaDiscord, FaTwitter } from 'react-icons/fa'

import FAQ from '~/components/FAQ'

import stepComplete from '~/assets/step_complete.png'
import stepSoon from '~/assets/step_soon.png'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'
import Heading from '~/components/typography/Heading'
import SectionTitle from '~/components/typography/SectionTitle'
import SectionHeading from '~/components/typography/SectionHeading'
import SectionHeadingSubtle from '~/components/typography/SectionHeadingSubtle'
import type { Profile } from '@kubelt/galaxy-client'

const completeSteps = [
  {
    title: 'Configure Profile',
    isCompleted: false,
    description: (
      <>
        <Text className="mb-1 text-gray-400" size="sm" weight="normal">
          Configure your NFT avatar and profile.
        </Text>
        <a href="/account/settings">Click here to complete.</a>
      </>
    ),
  },
]

const comingNext = [
  {
    title: 'Link More Accounts',
    description: (
      <>
        <Text className="mb-1 text-gray-400" size="sm" weight="normal">
          Connect more blockchain and social accounts to your 3ID.
        </Text>
      </>
    ),
  },
]

export default function Welcome() {
  const { profile } = useOutletContext<{ profile: Profile }>()

  console.log('dashboard', { profile })

  completeSteps[0].isCompleted = Object.keys(profile || {}).length > 1

  const percentage =
    (completeSteps.filter((step) => step.isCompleted).length /
      (completeSteps.length + comingNext.length)) *
    100

  return (
    <div className="dashboard flex flex-col gap-4">
      <div
        className="welcome-banner basis-full"
        style={{
          backgroundColor: '#F9FAFB',
          padding: '30px 30px 23px 16px',
        }}
      >
        <Heading className="mb-3 flex flex-col lg:flex-row gap-4">
          <span className="order-2 text-center justify-center align-center lg:order-1">
            Congratulations, {profile.displayName}!
          </span>
          <span className="order-1 text-center justify-center align-center lg:order-2">
            🎉
          </span>
        </Heading>

        <Text
          weight="normal"
          size="base"
          className="mb-6 text-center lg:text-left text-gray-500"
        >
          Welcome to the 3ID app. We are currently in beta and will be unlocking
          new features often. Follow us on Twitter and join our Discord to stay
          updated!
        </Text>

        <div className="flex flex-row gap-4 justify-center align-center lg:justify-start">
          <ButtonAnchor
            href="https://twitter.com/threeid_xyz"
            className="bg-gray-100 border-none min-w-[170px]"
          >
            <FaTwitter style={{ color: '#1D9BF0' }} />

            <span>Twitter</span>
          </ButtonAnchor>

          <ButtonAnchor
            href="https://discord.gg/threeid"
            className="bg-gray-100 border-none min-w-[170px]"
          >
            <FaDiscord style={{ color: '#1D9BF0' }} />

            <span>Discord</span>
          </ButtonAnchor>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="faq basis-full lg:basis-6/12 order-2 lg:order-2">
          <FAQ />
        </div>
        <div className="roadmap basis-full lg:basis-6/12 order-1 lg:order-1">
          <SectionTitle
            title="Roadmap"
            subtitle="Discover and try new features as we roll them out"
          />

          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="roadmap-ready">
            <SectionHeadingSubtle title="Ready" />

            <div className="roadmap-ready__steps steps grid grid-rows gap-4">
              {completeSteps.map((step, index) => (
                <div
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img
                      src={step.isCompleted ? stepComplete : stepSoon}
                      alt="3ID Step"
                    />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading>{step.title}</SectionHeading>
                    <div className="col-span-5">
                      <Text size="sm" weight="normal" className="text-gray-500">
                        {step.isCompleted ? 'Completed' : step.description}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="roadmap-next">
            <SectionHeadingSubtle title="Coming next" />

            <div className="roadmap-next__steps steps grid grid-rows gap-4">
              {comingNext.map((step, index) => (
                <div
                  className="roadmap-next__step step flex flex-row gap-4 items-start"
                  key={index}
                >
                  <div className="roadmap-next__check mt-1 flex justify-center items-top">
                    <img src={stepSoon} alt="3ID Step" />
                  </div>

                  <div className="col-span-5">
                    <SectionHeading className="mb-1">
                      {step.title}
                    </SectionHeading>
                    <div className="col-span-5">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="faq basis-full lg:basis-6/12 lg:hidden order-3"></div>
      </div>
    </div>
  )
}
