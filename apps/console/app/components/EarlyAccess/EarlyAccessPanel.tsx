import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import { FeaturePill } from '@kubelt/design-system/src/atoms/pills/FeaturePill'
import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'

type EarlyAccessPanelProps = {
  title: string
  subtitle: string
  copy: string
  imgSrc: string
}

const EarlyAccessPanel = ({
  title,
  subtitle,
  copy,
  imgSrc,
}: EarlyAccessPanelProps) => {
  return (
    <>
      <Text size="2xl" weight="semibold" className="text-gray-900 mb-5">
        {title}
      </Text>

      <div className="bg-white p-10 rounded-lg shadow flex flex-col lg:flex-row lg:space-x-28 space-y-4 lg:space-y-0">
        <section className="flex-1">
          <div className="mb-4">
            <FeaturePill text="Early Access" />
          </div>

          <Text size="2xl" weight="semibold" className="text-gray-900">
            {subtitle}
          </Text>

          <Text weight="normal" className="text-gray-500">
            {copy}
          </Text>

          <div className="w-full border-t border-gray-200 mt-8 mb-4" />

          <div>
            <Text size="sm" weight="medium" className="mb-3 text-gray-700">
              Follow us for updates
            </Text>

            <div className="flex flex-row space-x-2">
              <ButtonAnchor key="twitter" href="https://twitter.com/rollupid">
                <FaTwitter style={{ color: '#1D9BF0' }} />

                <span>Twitter</span>
              </ButtonAnchor>

              <ButtonAnchor key="discord" href="https://discord.gg/rollupid">
                <FaDiscord style={{ color: '#1D9BF0' }} />

                <span>Discord</span>
              </ButtonAnchor>

              <ButtonAnchor
                key="github"
                href="https://github.com/proofzero/rollupid"
              >
                <FaGithub />

                <span>GitHub</span>
              </ButtonAnchor>
            </div>
          </div>
        </section>

        <section>
          <img src={imgSrc} />
        </section>
      </div>
    </>
  )
}

export default EarlyAccessPanel
