import React, { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import BaseStyles from './base-theme.module.scss'
import '../../../.storybook/global.css'

export interface BaseThemeProps extends React.HTMLAttributes<HTMLDivElement> {
  // theme?: any
  children?: ReactNode
}

export function BaseTheme({ children }: BaseThemeProps) {
  // TODO: implement theme https://storybook.js.org/blog/how-to-build-connected-components-in-storybook/
  // const storyTheme = theme === 'dark' ? darkTheme : lightTheme
  return <ThemeProvider theme={BaseStyles}>{children}</ThemeProvider>
}
