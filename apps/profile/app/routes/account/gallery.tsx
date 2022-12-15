import { useState, forwardRef } from 'react'
import { Toaster, toast } from 'react-hot-toast'

import ProfileNftCollections from '~/components/nft-collection/ProfileNftCollections'
import SelectableNft from '~/components/nft-collection/SelectableNft'
import SaveButton from '~/components/accounts/SaveButton'

import { Modal } from '@kubelt/design-system/src/molecules/modal/Modal'
import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import { AddressURNSpace } from '@kubelt/urns/address'
import {
  useLoaderData,
  useSubmit,
  Form,
  useActionData,
  useTransition,
} from '@remix-run/react'
import { useRouteData } from '~/hooks'

import { parseURN } from 'urns'
import { requireJWT } from '~/utils/session.server'

import { HiOutlinePlusCircle } from 'react-icons/hi'

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { IndexerRouter } from '../../../../../services/indexer/src/jsonrpc/router'

import { getGalaxyClient } from '~/helpers/clients'
import { getUserSession } from '~/utils/session.server'
import { gatewayFromIpfs } from '~/helpers'

import type { LoaderFunction, ActionFunction } from '@remix-run/cloudflare'
import { json } from '@remix-run/cloudflare'

import * as jose from 'jose'
import { useEffect } from 'react'
import PfpNftModal from '~/components/accounts/PfpNftModal'

export const loader: LoaderFunction = async (args) => {
  const { request } = args

  const session = await getUserSession(request)
  const jwt = session.get('jwt')
  const profile: any = jose.decodeJwt(jwt).client_id

  const galaxyClient = await getGalaxyClient()
  const indexerClient = createTRPCProxyClient<IndexerRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: Indexer.fetch,
      }),
    ],
  })

  const urn = AddressURNSpace.urn(profile)
  const { gallery } = await indexerClient.getGallery.query([urn])

  const { getNFTMetadataBatch: metadata } = await galaxyClient.getNFTMetadata({
    input: gallery.map((nft) => ({
      contractAddress: nft.contract,
      tokenId: nft.tokenId,
    })),
  })

  const GalleryOrders: any = {}
  gallery?.forEach(
    (nft: {
      contract: string
      tokenId: string
      addressURN: string
      gallery_order: number
    }) => {
      GalleryOrders[`${nft.contract}${nft.tokenId}`] = nft.gallery_order
    }
  )

  const ownedNfts = metadata?.ownedNfts.map((nft) => {
    const media = Array.isArray(nft.media) ? nft.media[0] : nft.media
    let error = false
    if (nft.error) {
      error = true
    }

    const details = [
      {
        name: 'NFT Contract',
        value: nft.contract?.address,
        isCopyable: true,
      },
      {
        name: 'NFT Standard',
        value: nft.contractMetadata?.tokenType,
        isCopyable: false,
      },
    ]
    if (nft.id && nft.id.tokenId) {
      details.push({
        name: 'Token ID',
        value: BigInt(nft.id?.tokenId).toString(10),
        isCopyable: true,
      })
    }
    return {
      url: gatewayFromIpfs(media?.raw),
      thumbnailUrl: gatewayFromIpfs(media?.thumbnail ?? media?.raw),
      error: error,
      title: nft.title,
      tokenId: nft.id?.tokenId,
      contract: nft.contract,
      collectionTitle: nft.contractMetadata?.name,
      details,
      gallery_order:
        GalleryOrders[`${nft.contract?.address}${nft.id?.tokenId}`],
    }
  })

  /** Trick to perform permutation according to gallery_order param  */
  const result = Array.from(Array(ownedNfts.length))
  ownedNfts?.forEach((nft) => (result[nft.gallery_order] = nft))

  // Setup og tag data
  // check generate and return og image

  return json({
    gallery: result,
  })
}

export const action: ActionFunction = async ({ request }) => {
  const jwt = await requireJWT(request)

  const galaxyClient = await getGalaxyClient()

  const profile: any = jose.decodeJwt(jwt).client_id

  const { ensAddress: targetAddress } = await galaxyClient.getEnsAddress({
    addressOrEns: profile,
  })

  const urn = AddressURNSpace.urn(targetAddress)

  const formData = await request.formData()

  let errors: any = {}

  const nfts = JSON.parse(formData.get('gallery'))

  nfts.forEach((nft: any) => {
    if (!nft.tokenId) {
      errors[`tokenID`] = ['Nft should have token ID']
    }
    if (!nft.contract.address) {
      errors[`contractAddress-${nft.tokenID}`] = [
        'Nft should have contract address',
      ]
    }
    if (!urn || urn.length === 0) {
      errors[`${nft.contract.address}-${nft.tokenID}`] = [
        'URN should not be empty',
      ]
    }

    if (nft.error) {
      errors[`${nft.contract.address}-${nft.tokenId}`] = nft.error
    }
  })

  if (Object.keys(errors).length) {
    return {
      errors,
    }
  }

  const gallery = nfts.map((nft: any, i: number) => ({
    tokenId: nft.tokenId,
    contract: nft.contract.address,
    addressURN: urn,
    gallery_order: i,
  }))

  const indexerClient = createTRPCProxyClient<IndexerRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost/trpc',
        fetch: Indexer.fetch,
      }),
    ],
  })

  await indexerClient.setGallery.mutate(gallery)

  return null
}

export type GalleryData = {
  targetAddress: string
  pfp: {
    image: string
    isToken: string
  }
}

/**
 * Two components below are needed to create sortable grid of NFTs
 * you may take a quick look here:
 * https://codesandbox.io/s/dndkit-sortable-image-grid-py6ve?file=/src/App.jsx*/

const Nft = forwardRef(
  ({ nft, url, index, faded, isDragging, style, ...props }: any, ref) => {
    const inlineStyles = {
      opacity: faded ? '0.2' : isDragging ? '0' : '1',
      transformOrigin: '0 0',
      height: 200,
      gridRowStart: null,
      gridColumnStart: null,
      backgroundImage: `url("${url}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'grey',
      borderRadius: '0.5rem',
      ...style,
    }

    return <div ref={ref} style={inlineStyles} {...props} />
  }
)

const SortableNft = (props: any) => {
  const sortable = useSortable({ id: props.url })
  const {
    attributes,
    listeners,
    isDragging,
    setNodeRef,
    transform,
    transition,
  } = sortable

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Nft
      nft={props.nft}
      ref={setNodeRef}
      style={style}
      isDragging={isDragging}
      {...props}
      {...attributes}
      {...listeners}
    />
  )
}

const Gallery = () => {
  const { gallery } = useLoaderData()
  const actionData = useActionData()
  const { targetAddress, pfp } = useRouteData<GalleryData>('routes/account')

  const initialState = JSON.stringify(gallery)

  const [curatedNfts, setCuratedNfts] = useState(gallery)
  const [curatedNftsSet, setCuratedNftsSet] = useState(
    new Set(gallery.map((nft: any) => nft.contract.address + nft.tokenId))
  )
  const [isFormChanged, setFormChanged] = useState(false)

  const transition = useTransition()

  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))
  const submit = useSubmit()

  const curatedNftsLinks = curatedNfts.map((nft: any[]) => nft.url)

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setCuratedNfts((curatedNfts: any[]) => {
        const oldIndex = curatedNftsLinks.indexOf(active.id)
        const newIndex = curatedNftsLinks.indexOf(over.id)

        return arrayMove(curatedNfts, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  // REACT HOOKS
  useEffect(() => {
    if (JSON.stringify(curatedNfts) !== initialState) {
      setFormChanged(true)
    }
  }, [curatedNfts])

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notify(!actionData?.errors)
    }
  }, [transition])

  const notify = (success: boolean = true) => {
    if (success) {
      toast.success('Saved')
    } else {
      toast.error('Save Failed -- Please try again')
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const handleSubmit = (event: any) => {
    submit(curatedNfts, { replace: true })
  }

  return (
    <div className="min-h-[60vh]">
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        NFT Gallery
      </Text>
      <Toaster position="top-right" reverseOrder={false} />
      <Text className="border-none pb-6">
        Here you can curate your profile gallery to show off your most precious
        NFTs
      </Text>

      <PfpNftModal
        account={targetAddress}
        isOpen={isOpen}
        pfp={pfp}
        handleClose={() => {
          setIsOpen(false)
        }}
        handleSelectedNft={(nft: any) => {
          const ID = nft.contract.address + nft.tokenId
          if (!curatedNftsSet.has(ID)) {
            setCuratedNftsSet(new Set([...curatedNftsSet, ID]))
            setCuratedNfts([...curatedNfts, nft])
            setIsOpen(false)
          }
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={curatedNfts} strategy={rectSortingStrategy}>
          <div
            style={{
              display: 'grid',
              // repeat(4, 1fr) here - means 4 columns
              // gridTemplateColumns: `repeat(${4}, 1fr)`,
              gridGap: 10,
              padding: 10,
            }}
            className="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <div className="w-full bg-[#F9FAFB] rounded-lg">
              <div className="flex flex-col justify-center items-center h-full text-gray-400">
                <HiOutlinePlusCircle
                  size={60}
                  fontWeight={100}
                  className="mb-2 font-extralight"
                  onClick={() => setIsOpen(true)}
                />
                <Text>Add NFT</Text>
              </div>
            </div>
            {curatedNfts.map((nft: any, i: number) => {
              return (
                <SortableNft
                  key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                  url={nft.url}
                  index={i}
                  nft={nft}
                  className="flex justify-center items-center
                w-full h-[60rem] sm:h-80 md:h-72 lg:h-60 bg-[#F9FAFB] rounded-lg"
                />
              )
            })}
          </div>
        </SortableContext>
        <DragOverlay
          adjustScale={true}
          dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeId ? (
            <Nft url={activeId} index={curatedNftsLinks.indexOf(activeId)} />
          ) : null}
        </DragOverlay>
      </DndContext>
      <Form
        method="post"
        onReset={() => {
          setFormChanged(false)
        }}
        onSubmit={handleSubmit}
      >
        <input
          type="hidden"
          name="gallery"
          value={JSON.stringify(curatedNfts)}
        />
        <SaveButton
          isFormChanged={isFormChanged}
          discardFn={() => {
            setCuratedNfts(gallery)
            setCuratedNftsSet(
              new Set(
                gallery.map((nft: any) => nft.contract.address + nft.tokenId)
              )
            )
          }}
        />
      </Form>
    </div>
  )
}

export default Gallery
