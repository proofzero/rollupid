import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { ThemeSwitcher } from './theme-switcher';
import { ThemeToggler } from './theme-toggler';

it('should pick the first theme by default', () => {
  const { getByText } = render(<ThemeSwitcher themes={[Theme01, Theme02]} />);

  const rendered = getByText('theme 01');

  expect(rendered).toBeTruthy();
});

it('should pick the relevant theme when setting defaultTheme ', () => {
  const { getByText } = render(<ThemeSwitcher themes={[Theme01, Theme02]} defaultTheme="theme02" />);

  const rendered = getByText('theme 02');

  expect(rendered).toBeTruthy();
});

it('should show the icon of the relevant theme', () => {
  const { getByText } = render(
    <ThemeSwitcher themes={[Theme01, Theme02]} defaultTheme="theme02">
      <ThemeToggler />
    </ThemeSwitcher>
  );

  const rendered = getByText('t02');

  expect(rendered).toBeTruthy();
});

function Theme01({ children }: { children?: ReactNode }) {
  return (
    <div>
      <span>theme 01</span>
      {children}
    </div>
  );
}
Theme01.themeName = 'theme01';
Theme01.Icon = (props: any) => <span {...props}>t01</span>;

function Theme02({ children }: { children?: ReactNode }) {
  return (
    <div>
      <span>theme 02</span>
      {children}
    </div>
  );
}
Theme02.themeName = 'theme02';
Theme02.Icon = (props: any) => <span {...props}>t02</span>;
