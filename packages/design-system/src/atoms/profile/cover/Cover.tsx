import React, { HTMLAttributes } from 'react'

import classNames from 'classnames'

export type CoverProps = HTMLAttributes<HTMLDivElement> & {
  src: string
}

export const Cover = ({ src, ...rest }: CoverProps) => {
  return <div {...rest}>xD</div>
}
