/**
 * a point for agreement between designers and developers.
 */
export interface BaseThemeSchema {
  // application colors:

  /**
   * general purpose background color.
   */
  backgroundColor: string;
  /**
   * color of content on top of `onBackgroundColor`
   * (e.g. text, icons)
   */
  onBackgroundColor: string;
  /**
   * color of low-emphesis content on top of `onBackgroundColor`
   * (e.g. text, icons)
   */
  onBackgroundLowColor: string;
  /**
   * color of medium-emphesis content on top of `onBackgroundColor`
   * (e.g. text, icons)
   */
  onBackgroundMediumColor: string;
  /**
   * color of high-emphesis content on top of `onBackgroundColor`
   * (e.g. text, icons)
   */
  onBackgroundHighColor: string;

  // accents colors:

  /**
   * primary color.
   */
  primaryColor: string;
  /**
   * color of content on top of `primaryColor`
   */
  onPrimaryColor: string;

  // borders:

  /**
   * color of the border (neutral)
   */
  borderMediumColor: string;
  /**
   * color of the border (neutral), when in :hover
   */
  borderMediumHoverColor: string;
  /**
   * color of the border (neutral), when in :focus
   */
  borderMediumFocusColor: string;
  /**
   * color of the border (neutral), when in :active
   */
  borderMediumActiveColor: string;
  /**
   * color of high-emphesis border (neutral)
   */
  borderHighColor: string;
  /**
   * color of high-emphesis border (neutral), when in :hover
   */
  borderHighHoverColor: string;
  /**
   * color of high-emphesis border (neutral), when in :focus
   */
  borderHighFocusColor: string;
  /**
   * color of high-emphesis border (neutral), when in :active
   */
  borderHighActiveColor: string;
  /**
   * primary color of the border
   */
  borderPrimaryColor: string;
  /**
   * primary color of the border when in :hover
   */
  borderPrimaryHoverColor: string;
  /**
   * primary color of the border when in :focus
   */
  borderPrimaryFocusColor: string;
  /**
   * primary color of the border when in :active
   */
  borderPrimaryActiveColor: string;

  // surfaces (backgrounds):

  /**
   * background color of the default flat layer
   */
  surfaceColor: string;
  /**
   * background color of the default flat layer, when in :hover
   */
  surfaceHoverColor: string;
  /**
   * background color of the default flat layer, when in :active
   */
  surfaceActiveColor: string;
  /**
   * background color of the default flat layer, when in :focus
   */
  surfaceFocusColor: string;

  /**
   * color to be used on top of the surfaceColor (for texts, icons, etc)
   */
  onSurfaceColor: string;
  /**
   * medium emphesis color to be used on top of the surfaceColor (for texts, icons, etc)
   */
  onSurfaceMediumColor: string;
  /**
   * low emphesis color to be used on top of the surfaceColor (for texts, icons, etc)
   */
  onSurfaceLowColor: string;

  /**
   * background color of a level 01 layer
   */
  surface01Color: string;
  /**
   * background color of a level 02 layer
   */
  surface02Color: string;

  /**
   * primary background color for surfaces
   */
  surfacePrimaryColor: string;
  /**
   * primary background color for surfaces, while in :hover
   */
  surfacePrimaryHoverColor: string;
  /**
   * primary background color for surfaces while in :active
   */
  surfacePrimaryActiveColor: string;
  /**
   * primary background color for surfaces while in :focus
   */
  surfacePrimaryFocusColor: string;
  /**
   * color to be used on top of the surfacePrimary (for texts, icons, etc)
   */
  onSurfacePrimaryColor: string;

  /**
   * background color of a neutral flat layer
   */
  surfaceNeutralColor: string;
  /**
   * background color of a neutral flat layer when in :hover
   */
  surfaceNeutralHoverColor: string;
  /**
   * background color of a neutral flat layer when in :focus
   */
  surfaceNeutralFocusColor: string;
  /**
   * background color of a neutral flat layer when in :active
   */
  surfaceNeutralActiveColor: string;
  /**
   * high emphesis color to be used on top of the surfacePrimary (for texts, icons, etc)
   */
  onSurfaceNeutralHighColor: string;
  /**
   * medium emphesis color to be used on top of the surfacePrimary (for texts, icons, etc)
   */
  onSurfaceNeutralMediumColor: string;
  /**
   * low emphesis color to be used on top of the surfacePrimary (for texts, icons, etc)
   */
  onSurfaceNeutralLowColor: string;

  // // intents: //
  // primaryColor: string;
  positiveColor: string;
  negativeColor: string;
  warningColor: string;
  processColor: string;
  primarySurfaceColor: string; // WIP
  positiveSurfaceColor: string;
  negativeSurfaceColor: string;
  warningSurfaceColor: string;
  processSurfaceColor: string;
}
