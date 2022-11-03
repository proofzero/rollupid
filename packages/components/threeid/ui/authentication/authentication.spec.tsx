import React from 'react';
import { render } from '@testing-library/react';
import { BasicAuthentication } from './authentication.composition';

it('should render with the correct text', () => {
  const { getByText } = render(<BasicAuthentication />);
  const rendered = getByText('hello world!');
  expect(rendered).toBeTruthy();
});
