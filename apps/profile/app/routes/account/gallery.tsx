// React

import { useState, forwardRef, useEffect, useLayoutEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'

// Remix

import { Form, useActionData, useTransition } from '@remix-run/react'
import type { ActionFunction } from '@remix-run/cloudflare'

// Styles

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
import { Text } from '@kubelt/design-system/src/atoms/text/Text'
import SaveButton from '~/components/accounts/SaveButton'
import PfpNftModal from '~/components/accounts/PfpNftModal'
import { LoadingGridSquaresGallery } from '~/components/nft-collection/NftGrid'

// Other helpers

import * as jose from 'jose'
import { AddressURNSpace } from '@kubelt/urns/address'
import { useRouteData } from '~/hooks'
import { requireJWT } from '~/utils/session.server'
import { getGalaxyClient, getIndexerClient } from '~/helpers/clients'

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

  /**
   * This part mutates D1 table for gallery
   */
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

  const indexerClient = getIndexerClient()
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
    /**
     * It re-renders this small component quite often
     * every time user changes screen size
     */

    const inlineStyles = {
      opacity: faded ? '0.2' : isDragging ? '0' : '1',
      transformOrigin: '0 0',
      /**
       * It's the height of nft when it's dragged
       * Don't know how to write it better so keep it for now
       */
      height: '100%',
      ...style,
    }
    return (
      <img
        src={`${url}`}
        alt="NFT visual"
        ref={ref}
        style={inlineStyles}
        className="w-full h-full
        min-h-[12rem] md:min-h-[16rem] lg:min-h-[14rem]
    flex justify-center items-center
    object-contain
    transition-transform transition-colors
    duration-150 hover:duration-150 hover:scale-[1.02]
    hover:bg-gray-100
    bg-gray-50 rounded-lg"
        {...props}
      />
    )
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
  // STATE
  const actionData = useActionData()
  const { targetAddress, pfp } = useRouteData<GalleryData>('routes/account')

  const [initialState, setInitialState] = useState([])
  const [loading, setLoading] = useState(true)

  const [curatedNfts, setCuratedNfts] = useState([])
  const [curatedNftsSet, setCuratedNftsSet] = useState(new Set([]))
  const [isFormChanged, setFormChanged] = useState(false)

  const transition = useTransition()

  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const curatedNftsLinks = curatedNfts.map((nft: any[]) => nft.url)

  // REACT HOOKS
  useEffect(() => {
    if (JSON.stringify(curatedNfts) !== JSON.stringify(initialState)) {
      setFormChanged(true)
    }
  }, [curatedNfts])

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notify(!actionData?.errors)
    }
  }, [transition])

  useEffect(() => {
    ;(async () => {
      const request = `/nfts/gallery?owner=${targetAddress}`

      const nftReq: any = await fetch(request)
      const nftRes: any = await nftReq.json()

      // Do not need to sort them alphabetically here
      setInitialState(nftRes.gallery)
      setCuratedNfts(nftRes.gallery)
      setCuratedNftsSet(
        new Set(
          nftRes.gallery.map((nft: any) => nft.contract.address + nft.tokenId)
        )
      )
      setLoading(false)
    })()
  }, [])

  // HANDLERS
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

  return (
    <Form
      method="post"
      onReset={() => {
        setFormChanged(false)
      }}
      className="relative min-h-[60vh]"
    >
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        NFT Gallery
      </Text>
      <Toaster position="top-right" reverseOrder={false} />
      <Text className="border-none pb-6 text-gray-500">
        Here you can curate your profile gallery to show off your most precious
        NFTs
      </Text>

      <PfpNftModal
        account={targetAddress}
        text="Pick curated NFTs"
        isOpen={isOpen}
        pfp={pfp.image}
        handleClose={() => {
          setIsOpen(false)
        }}
        handleSelectedNft={(nft: any) => {
          const ID = nft.contract.address + nft.tokenId
          if (!curatedNftsSet.has(ID)) {
            setCuratedNftsSet(new Set([...curatedNftsSet, ID]))
            setCuratedNfts([...curatedNfts, nft])
            setIsOpen(false)
          } else {
            toast('This NFT is already in your list', {
              icon: '🤔',
            })
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
              gridGap: 10,
              padding: 10,
            }}
            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            flex flex-col justify-center items-center"
          >
            <button
              type="button"
              className="w-full h-full
              bg-gray-50 hover:bg-gray-100 transition-colors
              rounded-lg"
              onClick={() => setIsOpen(true)}
            >
              <div
                className="flex flex-col justify-center items-center h-full
                min-h-[12rem] md:min-h-[16rem] lg:min-h-[14rem]
                text-gray-400"
              >
                <HiOutlinePlusCircle
                  size={60}
                  fontWeight={100}
                  className="mb-2 font-extralight"
                />
                <Text>Add NFT</Text>
              </div>
            </button>
            {loading && <LoadingGridSquaresGallery numberOfCells={30} />}
            {curatedNfts.map((nft: any, i: number) => {
              return (
                <SortableNft
                  key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                  url={nft.url}
                  index={i}
                  nft={nft}
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

      <input type="hidden" name="gallery" value={JSON.stringify(curatedNfts)} />

      <SaveButton
        isFormChanged={isFormChanged}
        discardFn={() => {
          setCuratedNfts(initialState)
          setCuratedNftsSet(
            new Set(
              initialState.map((nft: any) => nft.contract.address + nft.tokenId)
            )
          )
        }}
      />
    </Form>
  )
}

export default Gallery
