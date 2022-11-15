import { createGlobalStyle } from 'styled-components'
import InterLight from './fonts/Inter-Light.ttf'
import InterRegular from './fonts/Inter-Regular.ttf'
import InterMedium from './fonts/Inter-Medium.ttf'
import InterSemiBold from './fonts/Inter-SemiBold.ttf'
import InterBold from './fonts/Inter-Bold.ttf'

// TODO: turn into story / theme?
export const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Inter', 'Gill Sans', 'Gill Sans MT', 'Helvetica Neue', Helvetica,
      Arial, sans-serif;
  }

  @font-face {
    font-family: "Inter";
    src: local(${InterLight}),
      url(${InterLight}) format("truetype");
    font-weight: 300;
  }
  @font-face {
    font-family: "Inter";
    src: local(${InterRegular}),
      url(${InterRegular}) format("truetype");
    font-weight: normal;
  }
  @font-face {
    font-family: "Inter";
    src: local(${InterMedium}),
      url(${InterMedium}) format("truetype");
    font-weight: 500;
  }
  @font-face {
    font-family: "Inter";
    src: local(${InterSemiBold}),
      url(${InterSemiBold}) format("truetype");
    font-weight: 600;
  }
  @font-face {
    font-family: "Inter";
    src: local(${InterBold}),
      url(${InterBold}) format("truetype");
    font-weight: bold;
  }
  @font-face {
    font-family: "Inter";
    src: local(${InterBold}),
      url(${InterBold}) format("truetype");
    font-weight: 700;
  }
 `
