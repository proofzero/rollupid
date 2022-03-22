import {AddIcon, EditIcon} from '@sanity/icons'
import {useDocumentOperation} from '@sanity/react-hooks'
import {Button, Flex, Heading, Inline} from '@sanity/ui'

//@ts-ignore
import sanityClient from 'part:@sanity/base/client'

import React, {useEffect, useState} from 'react'
import slugify from 'slugify'
import {VscCode} from 'react-icons/vsc'
import KubeltPublishModal from '../containers/PublishModal/KubeltPublishModal'
import { useAccount } from '../hooks/useAccount'
import sanityService from '../services/sanityService'

function PatchButton({
  doc,
  enabled,
}: {
  doc: {
    _id: string
    _type: string
    name: string
  }
  enabled: boolean
}) {
  const {patch} = useDocumentOperation(doc._id, doc._type) as {patch; publish}

  const patchKubeltName = () => {
    let kuSlug = ''

    const docId = doc._id
    if (docId.startsWith('drafts.')) {
      docId.replace('drafts.', '')
    }

    kuSlug = `${doc._type}:${doc._type}_${doc._id}`

    if (doc.name) {
      kuSlug = `${kuSlug}-${slugify(doc.name, {
        lower: true,
      })}`
    }

    patch.execute([{set: {kItem: {name: `${kuSlug}`}}}])
  }

  return (
    <Button
      icon={EditIcon}
      text="Patch"
      disabled={!enabled}
      onClick={() => patchKubeltName()}
      tone="primary"
      style={{
        marginRight: '0.4em',
      }}
    />
  )
}

function KubeltPublishAction({published, draft, onComplete}) {
  if (!sanityService.IsInit) {
    // Sanity Client configuration is injected by the part:s system at runtime
    // Sanity Client API expects the current date as best practices
    const nowDate = new Date().toISOString().split('T')[0]
    sanityService.init(sanityClient.withConfig({apiVersion: nowDate}))
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [canPublish, setCanPublish] = useState(false)

  const [devMode, setDevMode] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const account = useAccount()

  useEffect(() => {
    if (account) {
      if (devMode || !expanded) {
        setCanPublish(false)
      } else {
        setCanPublish(true)
      }
    } else {
      setCanPublish(false)
    }
  }, [published, draft, devMode, expanded])

  const publish = async () => {
    onComplete()
  }

  const handleExpansion = async () => {
    setExpanded(true)
  }

  return {
    label: 'Publish to Kubelt',
    icon: AddIcon,
    dialog: dialogOpen && {
      type: 'modal',
      header: <Heading>Kubelt Publisher</Heading>,
      footer: (
        <Flex justify="space-between" align="center">
          <Inline space={2}>
            <Button
              icon={VscCode}
              text="Dev mode"
              onClick={() => setDevMode(!devMode)}
              tone="default"
              mode="ghost"
              padding={2}
            />

            <Button
              icon={AddIcon}
              text="Publish"
              disabled={!canPublish}
              onClick={() => publish()}
              tone="primary"
            />
          </Inline>
        </Flex>
      ),
      content: (
        <KubeltPublishModal
          published={published}
          draft={draft}
          devMode={devMode}
          handleExpansion={handleExpansion}
        />
      ),
      onClose: () => {
        setDialogOpen(false)
        setDevMode(false)
        setExpanded(false)
      },
    },
    onHandle: () => {
      setDialogOpen(true)
    },
  }
}

export default KubeltPublishAction
