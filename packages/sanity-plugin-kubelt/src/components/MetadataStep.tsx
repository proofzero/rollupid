import {Box, Card, Label, Stack, Text} from '@sanity/ui'
import React from 'react'

function MetadataStep({metadata}: {metadata: any}) {
  return (
    <Box padding={2}>
      <Stack space={4}>
        <Text>Metadata</Text>
        {!metadata && <Label>No metadata</Label>}

        {metadata && (
          <Stack space={4}>
            <Stack space={2}>
              <Label>Context</Label>
              <Text>{metadata['@context']}</Text>
            </Stack>

            <Stack space={2}>
              <Label>Type</Label>
              <Text>{metadata['@type']}</Text>
            </Stack>

            {(metadata.itemListElement as any[]).length > 0 && (
              <Stack space={1}>
                <Label>Items</Label>
                <Text>{(metadata.itemListElement as any[]).length}</Text>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default MetadataStep
