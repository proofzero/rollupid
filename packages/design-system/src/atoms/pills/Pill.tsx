import React from 'react'

export type PillProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  className?: string
}

export const Pill = ({ className, children }: PillProps) => (
  <div className={`w-fit inline-block rounded py-0.5 px-2 ${className}`}>
    {children}
  </div>
)
