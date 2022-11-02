import { createContext, ComponentType } from 'react';
import type { BaseThemeProps } from '@kubelt/threeid.themes.base-theme';

export type ThemeOption = ComponentType<BaseThemeProps> & {
  /**
   * icon of the theme.
   */
  Icon?: ComponentType<{ className: string; onClick: () => void }>;

  /**
   * name of the theme.
   */
  themeName?: string;
};

export type ThemePicker = {
  /**
   * current theme in use.
   */
  current?: ThemeOption;
  /**
   * theme options.
   */
  options: ThemeOption[];

  /**
   * set a theme.
   */
  setTheme: (option: ThemeOption) => void;
};

export const ThemePickerContext = createContext<ThemePicker | undefined>(
  undefined
);
