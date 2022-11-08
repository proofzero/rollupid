import React from 'react';
import { useNextTheme, useThemePicker } from '@teambit/base-react.themes.theme-switcher';

import styles from './theme-toggler.module.scss';

export function ThemeToggler() {
  const themePicker = useThemePicker();
  const setNextTheme = useNextTheme();
  if (!themePicker) return null;

  const currentTheme = themePicker.current;
  if (!currentTheme) return null;

  const { Icon, displayName } = currentTheme;

  if (!Icon)
    return (
      <div className={styles.toggler} onClick={setNextTheme}>
        {displayName}
      </div>
    );

  return <Icon className={styles.toggler} onClick={setNextTheme} />;
}
