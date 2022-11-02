import React from 'react';
import {
  BaseTheme,
  BaseThemeProps,
} from '@kubelt-ui/threeid.themes.base-theme';
import { darkThemeValues } from './dark-theme.values';
import { DarkThemeIcon } from './dark-theme.icon';

export type DarkThemeProps = BaseThemeProps;

export function DarkTheme(props: DarkThemeProps) {
  return <BaseTheme {...props} overrides={darkThemeValues} />;
}

// theme metadata
DarkTheme.Icon = DarkThemeIcon;
DarkTheme.themeName = 'dark';
