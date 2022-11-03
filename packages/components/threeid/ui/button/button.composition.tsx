import React from 'react';
import { Button } from './button';

export const PrimaryButton = () => {
  return <Button>hello world!</Button>;
};

export const SecondaryButton = () => {
  return <Button secondary>hello world!</Button>;
};

export const TertiaryButton = () => {
  return <Button tertiary>hello world!</Button>;
};

export const DisabledButton = () => {
  return <Button disabled>hello world!</Button>;
};

export const ExtraSmallButton = () => {
  return <Button size={'xs'}>hello world!</Button>;
};

export const SmallButton = () => {
  return <Button size={'sm'}>hello world!</Button>;
};

export const LargeButton = () => {
  return <Button size={'lg'}>hello world!</Button>;
};

export const ExtraLargeButton = () => {
  return <Button size={'xl'}>hello world!</Button>;
};
