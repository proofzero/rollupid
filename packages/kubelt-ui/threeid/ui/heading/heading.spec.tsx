import React from 'react';
import { render } from '@testing-library/react';
import { HeadingXl } from './heading.composition';

it('should render with the correct text', () => {
  const { getByText } = render(<HeadingXl />);
  const rendered = getByText('main header');
  expect(rendered).toBeTruthy();
});
