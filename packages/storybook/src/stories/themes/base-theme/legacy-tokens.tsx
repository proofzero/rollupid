import React from 'react';
import { BaseThemeSchema } from './base-theme-schema';

export function getLegacyTokens(theme: BaseThemeSchema): React.CSSProperties {
  return {
    // # colors:
    // ----------

    // texts:
    '--bit-text-color-light': theme.onBackgroundMediumColor, // [✓] was #6c707c
    '--bit-text-color': theme.onBackgroundColor, // [✓x] was #414141
    '--bit-text-color-heavy': theme.onBackgroundHighColor, // [✓] was #2b2b2b
    '--bit-text-inactive': theme.onBackgroundLowColor, // [✓x] was #babec9
    '--bit-text-inactive-heavy': theme.onBackgroundLowColor, // [✓] was #878c9a

    // backgrounds:
    '--bit-bg-bedrock': theme.backgroundColor, // [✓] was #ffffff
    '--bit-bg-color': theme.surfaceNeutralColor, // [✓] was #ffffff, visible in dark mode
    '--bit-bg-heavy': theme.surfaceNeutralHoverColor, // [✓] was #f6f6f6
    '--bit-bg-heaviest': theme.surfaceNeutralActiveColor, // [✓] was #ededed
    '--bit-bg-dent': theme.surfaceNeutralHoverColor, // [✓] was #f6f6f6
    '--bit-bg-tooltip': theme.surfaceNeutralColor, // [✓] was #ffffff, visible in dark mode
    '--bit-bg-tooltip-heavy': theme.surfaceNeutralHoverColor, // [✓] was #f6f6f6
    '--bit-bg-navigation': theme.surfaceNeutralHoverColor, // [✓] was #f6f6f6
    '--bit-bg-overlay': theme.surfaceNeutralColor, // [✓] was #ffffff,
    '--bit-bg-modal': theme.surfaceNeutralColor, // [✓] was #ffffff,

    // borders:
    '--bit-border-color-lightest': theme.borderMediumColor, // [✓] was #ededed,
    '--bit-border-color-light': theme.borderMediumHoverColor, // [✓] was #cccfd4,
    '--bit-border-color': theme.borderHighColor, // [✓] was #babec9,
    '--bit-border-color-heavy': theme.borderHighActiveColor, // [✓] was #878c9a,

    // primary accent color:
    // '--bit-accent-light':, // [ ] was #897dec;
    '--bit-accent-color': theme.primaryColor, // [✓] was #6c5ce7;
    // '--bit-accent-heavy':, // [ ] was #5d4aec;
    '--bit-text-on-accent': theme.onPrimaryColor, // [✓] was #ffffff;

    '--bit-accent-text': theme.primaryColor, // [✓] was #6c5ce7;
    // '--bit-accent-text-heavy':, // [ ] was #5d4aec;
    '--bit-accent-bg': theme.surfaceHoverColor, // [✓] was #eceaff;
    '--bit-accent-bg-heavy': theme.surfaceActiveColor, // [x✓] was #c9c3f6;

    // # shadows:
    // ----------
    '--bit-shadow-none': 'none',

    // not final
    '--bit-shadow-faint': '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
    '--bit-shadow-resting': '0px 0px 4px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.08)',

    // raised, ie attached to background
    '--bit-shadow-raised-low': '0 -1px 1px 0 rgba(0, 0, 0, 0.09), 0 2px 2px 0 rgba(0, 0, 0, 0.23)',
    //' --bit-shadow-raised-medium': '',
    //' --bit-shadow-raised-hight': '',

    // hover, as in floating above
    '--bit-shadow-hover-low': '0 2px 8px 0 rgba(0, 0, 0, 0.2)',
    '--bit-shadow-hover-medium': '0 0 20px 0 rgba(0, 0, 0, 0.12), 0 2px 6px 0 rgba(0, 0, 0, 0.24)',
    '--bit-shadow-hover-high': '0px 11px 29px 0px rgba(0, 0, 0, 0.23)',

    // # font sizes:
    // -------------
    // regular text size
    '--bit-p-xxs': '12px',
    '--bit-p-xs': '14px',
    '--bit-p-sm': '15px',
    '--bit-p-md': '16px',
    '--bit-p-lg': '18px',
    '--bit-p-xl': '20px',
    '--bit-p-xxl': '24px',

    // headings size
    '--bit-h-xxs': '16px',
    '--bit-h-xs': '18px',
    '--bit-h-sm': '24px',
    '--bit-h-md': '26px',
    '--bit-h-lg': '36px',
    '--bit-h-xl': '40px',
    '--bit-h-xxl': '50px',

    // accents:

    '--bit-accent-primary-color': theme.primaryColor,
    '--bit-accent-primary-bg': theme.primarySurfaceColor,
    '--bit-accent-hunger-color': theme.warningColor,
    '--bit-accent-hunger-bg': theme.warningSurfaceColor,
    '--bit-accent-impulsive-color': theme.negativeColor,
    '--bit-accent-impulsive-bg': theme.negativeSurfaceColor,
    '--bit-accent-process-color': theme.processColor,
    '--bit-accent-success-color': theme.positiveColor,
    '--bit-accent-success-bg': theme.positiveSurfaceColor,
  } as React.CSSProperties;
}
