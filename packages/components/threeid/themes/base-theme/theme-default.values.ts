import { BaseThemeSchema } from './base-theme-schema';

/**
 * maintained by design tokens go here!
 * the designer.
 */
export const baseThemeDefaults: BaseThemeSchema = {
  backgroundColor: '#FFFFFF',
  onBackgroundColor: '#2B2B2B',
  onBackgroundLowColor: '#9598A1',
  onBackgroundMediumColor: '#707279',
  onBackgroundHighColor: '#2B2B2B',

  primaryColor: '#6C5CE7',
  onPrimaryColor: '#FFFFFF',

  borderMediumColor: '#EDEDED',
  borderMediumHoverColor: '#CECECE',
  borderMediumFocusColor: '#C6C6C6',
  borderMediumActiveColor: '#AFAFAF',

  borderHighColor: '#BABEC9',
  borderHighHoverColor: '#A3A6B0',
  borderHighFocusColor: '#9DA1A9',
  borderHighActiveColor: '#8C8F96',

  borderPrimaryColor: '#6C5CE7',
  borderPrimaryHoverColor: '#8376EB',
  borderPrimaryFocusColor: '#897DEC',
  borderPrimaryActiveColor: '#8F83ED',

  // "light purple surface"
  surfaceColor: '#FFFFFF',
  surfaceHoverColor: '#EDEBFC',
  surfaceActiveColor: '#DCD8F9',
  surfaceFocusColor: '#E2DEFA',

  onSurfaceColor: '#2B2B2B',
  onSurfaceMediumColor: '#707279',
  onSurfaceLowColor: '#9598A1',

  // surface layers
  surface01Color: '#FFFBFF',
  surface02Color: '#F7F2FD',
  // surface03Color: '#F2EDFC',
  // surface04Color: '#EDE7FA',
  // surface05Color: '#EBE5FA',
  // surface06Color: '#E8E2F9',

  // "purple surface"
  surfacePrimaryColor: '#140068',
  surfacePrimaryHoverColor: '#3A2980',
  surfacePrimaryActiveColor: '#433386',
  surfacePrimaryFocusColor: '#4C3D8C',
  onSurfacePrimaryColor: '#FFFFFF',

  // "gray" surface
  surfaceNeutralColor: '#FFFFFF',
  surfaceNeutralHoverColor: '#F4F5F6',
  surfaceNeutralFocusColor: '#F1F2F4',
  surfaceNeutralActiveColor: '#EEEFF2',

  onSurfaceNeutralHighColor: '#2B2B2B',
  onSurfaceNeutralMediumColor: '#707279',
  onSurfaceNeutralLowColor: '#9598A1',

  // surface01Neutral: '#F6F6F6F',
  // surface01NeutralHover: '#ECEDEF',
  // surface01NeutralFocus: '#EAEBED',
  // surface01NeutralActive: '#E8E9EB',

  // surface02Neutral: '#EDEDED',
  // surface02NeutralHover: '#E5E5E7',
  // surface02NeutralFocus: '#E3E3E6',
  // surface02NeutralActive: '#E1E2E4',

  // primaryColor: string;
  positiveColor: '#37B26C',
  negativeColor: '#E62E5C',
  warningColor: '#FFC640',
  processColor: '#0984E3',
  primarySurfaceColor: '#F6F5FE', // WIP TODO
  positiveSurfaceColor: '#F3FAF6',
  negativeSurfaceColor: '#FDF2F5',
  warningSurfaceColor: '#FFFCF4',
  processSurfaceColor: '#F0F8FD',
};
