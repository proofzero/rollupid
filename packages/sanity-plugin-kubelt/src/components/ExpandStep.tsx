import { SanityDocument } from "@sanity/client";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Inline,
  Label,
  Stack,
  Text,
  Tooltip,
} from "@sanity/ui";
import React, { useCallback, useEffect, useState } from "react";

import sanityService, {
  IDocumentStructureCounter,
  SanityService,
} from "../services/sanityService";
import SemanticService from "../services/semanticService";

function ExpandStep({
  doc,
  docExpHandler,
}: {
  doc: SanityDocument;
  docExpHandler: any;
}) {
  const [expDoc, setExpDoc] = useState(null);

  const [expandedShallow, setExpandedShallow] = useState(false);
  const [expandedDeep, setExpandedDeep] = useState(false);

  const [deepPromptOpen, setDeepPromptOpen] = useState(false);
  const [deepPromptAccepted, setDeepPromptAccepted] = useState(false);

  const onClose = useCallback(() => {
    setDeepPromptOpen(false);
    expand(true);
  }, []);

  const onOpen = useCallback(() => setDeepPromptOpen(true), []);

  const expand = async (deep: boolean) => {
    const counter: IDocumentStructureCounter = {
      arrays: 0,
      files: 0,
      objects: 0,
      primitives: 0,
      references: 0,
    };

    const expandedDoc = await sanityService.expandObjectAsync(
      doc,
      counter,
      deep
    );

    setExpDoc(expandedDoc);
    docExpHandler(expandedDoc, counter);

    if (deep) {
      setExpandedShallow(false);
      setExpandedDeep(true);
    } else {
      setExpandedShallow(true);
      setExpandedDeep(false);
    }
  };

  const tryExpand = async (deep: boolean) => {
    if (deep) {
      if (!deepPromptAccepted) {
        onOpen();
      } else {
        expand(deep);
      }
    } else {
      expand(deep);
    }
  };

  return (
    <Box padding={2}>
      <Stack space={4}>
        <Text>Document expander</Text>

        <Stack space={2}>
          <Label>Expanding document</Label>
          <Text>{doc._id}</Text>
        </Stack>

        <Stack space={2}>
          <Label>Expansion type</Label>
          <Inline space={2}>
            <Button
              type="button"
              padding={2}
              text="Shallow"
              tone="positive"
              disabled={expandedShallow}
              onClick={() => tryExpand(false)}
            />

            <Button
              type="button"
              padding={2}
              text="Deep"
              tone="positive"
              disabled={expandedDeep}
              onClick={() => tryExpand(true)}
            />

            {deepPromptOpen && (
              <Dialog
                header="Warning: Deep expansion"
                id="dialog-deep-expansion-warning"
                // onClose={onClose}
                zOffset={1000}
              >
                <Card padding={4} style={{ textAlign: "center" }}>
                  <Stack space={4}>
                    <Text>
                      Phasellus varius cursus nisi. Integer a laoreet nunc.
                      Donec nec neque vitae metus imperdiet sodales quis ac
                      elit. Aenean malesuada turpis a blandit aliquet.{" "}
                    </Text>

                    <Inline space={2}>
                      <Button
                        text="Shallow"
                        onClick={() => {
                          setDeepPromptOpen(false);
                        }}
                      />
                      <Button
                        text="Deep"
                        tone="primary"
                        onClick={() => {
                          setDeepPromptAccepted(true);
                          setDeepPromptOpen(false);
                          expand(true);
                        }}
                      />
                    </Inline>
                  </Stack>
                </Card>
              </Dialog>
            )}
          </Inline>
        </Stack>
      </Stack>
    </Box>
  );
}

export default ExpandStep;
