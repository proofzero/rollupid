import React from 'react';
import { render } from '@testing-library/react';
import { DarkSchema } from './dark-theme.composition';

it('should render with the correct text', () => {
  const { getByText } = render(<DarkSchema />);
  const rendered = getByText('primaryColor');
  expect(rendered).toBeTruthy();
});
