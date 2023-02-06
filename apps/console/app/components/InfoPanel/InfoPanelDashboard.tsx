import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'
import { FaBook, FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import { HiAcademicCap, HiUsers } from 'react-icons/hi2'
import { InfoPanel } from './InfoPanel'

const communityLinks = [
  <ButtonAnchor key="twitter" href="https://twitter.com/rollupid">
    <FaTwitter style={{ color: '#1D9BF0' }} />

    <span>Twitter</span>
  </ButtonAnchor>,
  <ButtonAnchor key="discord" href="https://discord.gg/rollupid">
    <FaDiscord style={{ color: '#1D9BF0' }} />

    <span>Discord</span>
  </ButtonAnchor>,
]

const practiceLinks = [
  <ButtonAnchor key="github" href="https://github.com/rollupid">
    <FaGithub className="text-gray-400" />

    <span>GitHub</span>
  </ButtonAnchor>,
  <ButtonAnchor key="docs" href="https://docs.rollup.id">
    <FaBook className="text-gray-400" />

    <span>Docs</span>
  </ButtonAnchor>,
]

export const InfoPanelDashboard = () => (
  <section className="flex flex-col space-y-1 md:space-y-0 md:flex-row md:space-x-1">
    <InfoPanel
      className="flex-1 rounded-lg rounded-b-none md:rounded-b-lg md:rounded-r-none"
      heading="Join our community"
      subheading="Doloribus dolores nostrum quia qui natus officia quod et dolorem."
      Icon={HiUsers}
      links={communityLinks}
    />
    <InfoPanel
      className="flex-1 rounded-lg rounded-t-none md:rounded-t-lg md:rounded-l-none"
      heading="Learn best practices"
      subheading="Doloribus dolores nostrum quia qui natus officia quod et dolorem."
      Icon={HiAcademicCap}
      links={practiceLinks}
    />
  </section>
)
