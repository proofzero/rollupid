import React from 'react';
import { render } from '@testing-library/react';
import { BasicButton } from './button.composition';

it('should render with the correct text', () => {
  const { getByText } = render(<BasicButton />);
  const rendered = getByText('hello world!');
  expect(rendered).toBeTruthy();
});
