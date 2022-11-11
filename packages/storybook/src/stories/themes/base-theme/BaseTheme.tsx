import React, { ReactNode } from 'react'
import classNames from 'classnames'
import { createTheme } from '@teambit/base-react.theme.theme-provider'
// TODO: remove this after replacing icon fonts with components and deprecate this.
import { IconFont } from '@teambit/design.theme.icons-font'
import { BaseThemeSchema } from './base-theme-schema'
import { baseThemeDefaults } from './theme-default.values'
import { getLegacyTokens } from './legacy-tokens'
import { interFont } from './inter-font'
import styles from './base-theme.module.scss'

const ICON_MOON_VERSION = 'bjii9'

const { useTheme, ThemeProvider } = createTheme<BaseThemeSchema>({
  theme: baseThemeDefaults,
})

export interface BaseThemeProps extends React.HTMLAttributes<HTMLDivElement> {
  overrides?: Partial<BaseThemeSchema>
  children?: ReactNode
}

export function BaseTheme({ children, className, ...props }: BaseThemeProps) {
  return (
    <ThemeProvider
      {...props}
      className={classNames(interFont, styles.theme, className)}
    >
      {/* <link
        href="https://fonts.googleapis.com/css?family=Roboto+Mono"
        rel="stylesheet"
      /> */}
      <IconFont query={ICON_MOON_VERSION} />
      <LegacyThemeProvider>{children}</LegacyThemeProvider>
    </ThemeProvider>
  )
}

function LegacyThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()

  return <div style={getLegacyTokens(theme)}>{children}</div>
}

export { useTheme }
