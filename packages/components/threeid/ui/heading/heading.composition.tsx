import React from 'react';
import { H1, H2, H3, H4, H5, H6 } from './heading';

export const HeadingXl = () => {
  return <H1 style={{ whiteSpace: 'nowrap' }}>main header</H1>;
};
export const HeadingLg = () => <H2 style={{ whiteSpace: 'nowrap' }}>main header</H2>;
export const HeadingMd = () => <H3 style={{ whiteSpace: 'nowrap' }}>main header</H3>;
export const HeadingSm = () => <H4 style={{ whiteSpace: 'nowrap' }}>main header</H4>;
export const HeadingXs = () => <H5 style={{ whiteSpace: 'nowrap' }}>main header</H5>;
export const HeadingXxs = () => <H6 style={{ whiteSpace: 'nowrap' }}>main header</H6>;
