import React from 'react';
import { useTheme } from '@kubelt/threeid.themes.base-theme';
import {
  ColorSchema,
  SchemaTestPage,
} from '@teambit/design.themes.color-schema';
import { DarkTheme } from './dark-theme';

export const DarkSchema = () => {
  return (
    <DarkTheme>
      <ShowTokens />
    </DarkTheme>
  );
};

export const TestPage = () => {
  return (
    <DarkTheme>
      <SchemaTestPage />
    </DarkTheme>
  );
};

// need a separate component to use react context
function ShowTokens() {
  const theme = useTheme();
  const tokens = Object.entries(theme).map(
    ([name, value]: [string, string]) => ({
      name,
      value,
    })
  );

  return <ColorSchema tokens={tokens} />;
}
