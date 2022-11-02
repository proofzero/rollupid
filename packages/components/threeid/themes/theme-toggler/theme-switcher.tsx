import React from 'react';
import type { BaseThemeProps } from '@kubelt/threeid.themes.base-theme';
import {
  ThemeSwitcher as ThemeSwitcherBase,
  ThemeSwitcherProps as BaseProps,
} from '@teambit/base-react.themes.theme-switcher';
import { LightAndDarkThemes } from './default-themes';

export type ThemeSwitcherProps = Omit<BaseProps<BaseThemeProps>, 'themes'> & {
  themes?: BaseProps<BaseThemeProps>['themes'];
};

export function ThemeSwitcher({
  themes = LightAndDarkThemes,
  ...props
}: ThemeSwitcherProps) {
  return <ThemeSwitcherBase themes={themes} {...props} />;
}
