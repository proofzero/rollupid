import {SanityDocument} from '@sanity/client'
import {Card, Stack, Container, Grid, Flex, Code} from '@sanity/ui'
import React, {useState} from 'react'

import AuthStep from '../../components/AuthStep'
import ExpandStep from '../../components/ExpandStep'
import MetadataStep from '../../components/MetadataStep'
import PublishStep from '../../components/PublishStep'
import sanityService, {IDocumentStructureCounter} from '../../services/sanityService'
import SemanticService from '../../services/semanticService'

function KubeltPublishModal({
  published,
  draft,
  devMode,
  handleExpansion,
}: {
  published: SanityDocument
  draft: SanityDocument
  devMode: boolean
  handleExpansion: any
}) {
  const [expandedDocument, setExpandedDocument] = useState(null)
  const [metadata, setMetadata] = useState(null)

  const [counter, setCounter] = useState(null)

  const handleExpandedDocument = async (
    expandedDocument: any,
    counter: IDocumentStructureCounter
  ) => {
    setExpandedDocument(expandedDocument)
    setCounter(counter)

    const semanticService = new SemanticService(sanityService)
    const semanticDoc = semanticService.semantify(expandedDocument)

    setMetadata(semanticDoc)

    handleExpansion()
  }

  return (
    <Container>
      {devMode && (
        <Stack overflow="hidden" space={4}>
          <Card>
            <h2>Expanded document</h2>
            <Code>{JSON.stringify(expandedDocument, null, 2)}</Code>
          </Card>

          <Card>
            <h2>Metadata</h2>
            <Code>{JSON.stringify(metadata, null, 2)}</Code>
          </Card>
        </Stack>
      )}

      <Grid
        columns={2}
        rows={2}
        style={{
          visibility: devMode ? 'hidden' : 'initial',
        }}
      >
        <Card>
          <AuthStep />
        </Card>

        <Card>
          <PublishStep doc={expandedDocument} counter={counter} />
        </Card>

        <Card>
          <ExpandStep doc={{...published, ...draft}} docExpHandler={handleExpandedDocument} />
        </Card>

        <Card>
          <MetadataStep metadata={metadata} />
        </Card>
      </Grid>
    </Container>
  )
}

export default KubeltPublishModal
