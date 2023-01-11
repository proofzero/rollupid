import React, { ReactNode } from 'react'

export type PillProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>

export const Pill = ({ className, children }: PillProps) => (
  <div className={`inline-block rounded py-0.5 pl-2 pr-2.5 ${className}`}>
    {children}
  </div>
)
