import { Box, Label, Stack, Text } from "@sanity/ui";
import React from "react";

import {
  VscReferences,
  VscSymbolArray,
  VscSymbolNamespace,
  VscFile,
  VscPrimitiveSquare,
} from "react-icons/vsc";
import { IDocumentStructureCounter } from "../services/sanityService";

function PublishStep({
  doc,
  counter,
}: {
  doc: any;
  counter: IDocumentStructureCounter;
}) {
  return (
    <Box padding={2}>
      <Stack space={4}>
        <Text>Expansion results</Text>
        {!doc && <Label>No expansion</Label>}

        {counter && (
          <Stack space={2}>
            <Label>
              Primitives: {counter.primitives} <VscPrimitiveSquare />
            </Label>
            <Label>
              References: {counter.references} <VscReferences />
            </Label>

            <Label>
              Objects: {counter.objects} <VscSymbolNamespace />
            </Label>
            <Label>
              Arrays: {counter.arrays} <VscSymbolArray />
            </Label>

            <Label>
              Files: {counter.files} <VscFile />
            </Label>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

export default PublishStep;
