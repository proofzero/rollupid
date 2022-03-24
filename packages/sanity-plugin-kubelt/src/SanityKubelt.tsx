import { Stack, studioTheme, ThemeProvider } from "@sanity/ui";
import React from "react";
import KubeltAuth from "./components/KubeltAuth";

// Used in Sanity project
function SanityKubelt() {
  return (
    <ThemeProvider theme={studioTheme}>
      <Stack>
        <KubeltAuth />
      </Stack>
    </ThemeProvider>
  );
}

export default SanityKubelt;
