import { BaseTheme } from '@kubelt/threeid.themes.base-theme';
import { DarkTheme } from '@kubelt/threeid.themes.dark-theme';
import { ThemeOption } from './theme-picker-context';

export const DefaultThemeProvider = BaseTheme;
export const LightAndDarkThemes: ThemeOption[] = [BaseTheme, DarkTheme];
