import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import teamSVG from '~/assets/early/team.svg'

export default () => (
  <EarlyAccessPanel
    title="Team & Contact"
    subtitle="Manage Permissions"
    copy="The team management, roles, and permissions feature allows yo to control access and enhance security by defining roles and permissions for team members."
    imgSrc={teamSVG}
    url={'https://docs.rollup.id/platform/console#teams'}
  />
)
