import React from 'react';
import { render } from '@testing-library/react';
import { ColorScheme } from './base-theme.composition';
import { BaseTheme, useTheme } from './base-theme';

it('should render with the correct text', () => {
  const { getByText } = render(<ColorScheme />);
  const rendered = getByText('primaryColor');
  expect(rendered).toBeTruthy();
});

it('should forward overrides', () => {
  const overrideValues = { primaryColor: 'override-value' };
  const { getByText } = render(
    <BaseTheme overrides={overrideValues}>
      <GetPrimaryColor />
    </BaseTheme>
  );

  const rendered = getByText(`primaryColor: ${overrideValues.primaryColor}`);
  expect(rendered).toBeTruthy();
});

// make sure can pass down styles, as it is critical for some consumers
it('should forward style and attribute', () => {
  const { getByTestId } = render(
    <BaseTheme data-testid="target" style={{ border: '1px solid black' }} className="some-class">
      base theme
    </BaseTheme>
  );

  const rendered = getByTestId('target');

  expect(rendered).toHaveClass('some-class');
  expect(rendered).toHaveStyle({ border: '1px solid black' });
});

function GetPrimaryColor() {
  const theme = useTheme();

  return <div>primaryColor: {theme.primaryColor}</div>;
}
