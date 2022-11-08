import React from 'react';
import { BaseTheme, useTheme } from './base-theme';

export const ColorScheme = () => {
  return (
    <BaseTheme>
      <ListTokens />
    </BaseTheme>
  );
};

function ListTokens() {
  const theme = useTheme();
  return (
    <div style={{ width: 'fit-content', display: 'grid', gridTemplateColumns: 'auto auto auto', gap: '8px 4px' }}>
      {Object.entries(theme).map(([key, value]) => (
        <ColorBox key={key} colorName={key} value={value} />
      ))}
    </div>
  );
}

const colorBoxStyle = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: '1px solid black',
};

function ColorBox({ colorName, value }: { colorName: string; value: string }) {
  return (
    <>
      <div
        style={{
          ...colorBoxStyle,
          background: value,
        }}
      />
      <div>{colorName}</div>
      <div>
        <code>{value}</code>
      </div>
    </>
  );
}
