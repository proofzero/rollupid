import React from 'react';
import { ThemeToggler } from './theme-toggler';
import { ThemeSwitcher } from './theme-switcher';

export function TogglerPreview() {
  return (
    <ThemeSwitcher defaultTheme="dark" style={{ padding: 8 }}>
      <ThemeToggler />
    </ThemeSwitcher>
  );
}
