import { AppTheme } from '@proofzero/platform/starbase/src/jsonrpc/validators/app'
import React from 'react'

export const ThemeContext = React.createContext<{
  dark: boolean
  theme: AppTheme | undefined
}>({
  dark: false,
  theme: undefined,
})
