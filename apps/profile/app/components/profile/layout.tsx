import type { HTMLAttributes } from 'react'

export type ProfileLayoutProps = {
  Avatar: JSX.Element
  Edit: JSX.Element
  Claim: JSX.Element
  Tabs: JSX.Element
} & HTMLAttributes<HTMLDivElement>

const ProfileLayout = ({
  Avatar,
  Edit,
  Claim,
  Tabs,
  children,
}: ProfileLayoutProps) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full min-h-[192px] mx-auto flex justify-center items-center px-8 mt-12">
        {Avatar}
      </div>

      {Edit}

      <div className="mt-3 max-w-4xl overflow-visible w-full mx-auto py-3 lg:py-0">
        {Claim}

        <div className="py-6">
          {Tabs}

          <div className="py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default ProfileLayout
