import React from 'react';
import { render } from '@testing-library/react';
import { BasicLoginButton } from './login-button.composition';

it('should render with the correct text', () => {
  const { getByText } = render(<BasicLoginButton />);
  const rendered = getByText('Private Login');
  expect(rendered).toBeTruthy();
});
