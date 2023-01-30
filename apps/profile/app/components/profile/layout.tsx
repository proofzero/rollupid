import type { HTMLAttributes } from 'react'

export type ProfileLayoutProps = {
  Cover: JSX.Element
  Avatar: JSX.Element
  Claim: JSX.Element
  Tabs: JSX.Element
} & HTMLAttributes<HTMLDivElement>

const ProfileLayout = ({
  Cover,
  Avatar,
  Claim,
  Tabs,
  children,
}: ProfileLayoutProps) => {
  return (
    <>
      {Cover}

      <div className="max-w-4xl w-full min-h-[192px] mx-auto flex justify-center items-center px-8 mt-[-6em]">
        {Avatar}
      </div>

      <div className="mt-3 max-w-4xl overflow-visible w-full mx-auto py-3 lg:py-0">
        {Claim}

        <div className="mt-12">
          {Tabs}
          {children}
        </div>
      </div>
    </>
  )
}

export default ProfileLayout
