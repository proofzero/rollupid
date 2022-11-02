import React from 'react';
import classNames from 'classnames';
import { HeadingProps, Heading } from '@teambit/base-ui.text.heading';
import sizeStyles from './heading-sizes.module.scss';
import styles from './heading.module.scss';
import margins from './margins.module.scss';

export type Sizes = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type HeaderProps = {
  /** font-size for the header */
  size?: Sizes;
} & HeadingProps;

/**
 * A set of concrete heading for the workspace docs.
 * H1, H2, H3, H4, H5, H6.
 *
 * To keep a consistent look to the site, headers come in a limited set of sizes.
 * While each header corresponds to a default font-size, it can be overridden using the size prop:
 */
export function H1(props: HeaderProps) {
  return (
    <Heading
      element="h1"
      {...props}
      className={classNames(styles.h1, margins.h1, sizeStyles[props.size || 'lg'], props.className)}
    />
  );
}
export function H2(props: HeaderProps) {
  return (
    <Heading
      element="h2"
      {...props}
      className={classNames(styles.h2, sizeStyles[props.size || 'lg'], props.className)}
    />
  );
}
export function H3(props: HeaderProps) {
  return (
    <Heading
      element="h3"
      {...props}
      className={classNames(styles.h3, sizeStyles[props.size || 'md'], props.className)}
    />
  );
}
export function H4(props: HeaderProps) {
  return (
    <Heading
      element="h4"
      {...props}
      className={classNames(styles.h4, sizeStyles[props.size || 'sm'], props.className)}
    />
  );
}
export function H5(props: HeaderProps) {
  return (
    <Heading
      element="h5"
      {...props}
      className={classNames(styles.h5, sizeStyles[props.size || 'xs'], props.className)}
    />
  );
}
export function H6(props: HeaderProps) {
  return (
    <Heading
      element="h6"
      {...props}
      className={classNames(styles.h6, sizeStyles[props.size || 'xxs'], props.className)}
    />
  );
}
