// React

import { useState, forwardRef, useEffect } from 'react'

// Remix

import {
  Form,
  useActionData,
  useOutletContext,
  useTransition,
  useFetcher,
  useNavigate,
} from '@remix-run/react'
import type { ActionFunction } from '@remix-run/cloudflare'

// Styles

import { HiOutlinePlusCircle } from 'react-icons/hi'
import { TbTrash } from 'react-icons/tb'
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
import NoCryptoAddresses from '~/components/accounts/NoCryptoAddresses'

// Other helpers
import { getProfileSession, parseJwt } from '~/utils/session.server'
import type { Node } from '@kubelt/galaxy-client'
import { getMoreNftsModal } from '~/helpers/nfts'
import {
  toast,
  Toaster,
  ToastType,
} from '@kubelt/design-system/src/atoms/toast'
import type { FullProfile } from '~/types'
import type { Maybe } from 'graphql/jsutils/Maybe'
import type { NFT } from '~/types'

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.formData()
  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken
  const { sub: accountURN } = parseJwt(jwt)

  let errors = new Map()

  const updatedGallery = formData.get('gallery') as string
  if (!updatedGallery) {
    throw new Error('Gallery should not be empty')
  }
  const nfts: NFT[] = JSON.parse(updatedGallery)

  // TODO: replace with zod?
  nfts.forEach((nft) => {
    if (!nft.tokenId) {
      errors.set('tokenId', ['Nft should have token ID'])
    }
    if (!nft.contract?.address && nft.contract.address?.length === 0) {
      errors.set(`contractAddress-${nft.tokenId}`, [
        'Nft should have contract address',
      ])
    }
    if (!nft.chain?.network) {
      errors.set(`network-${nft.tokenId}`, ['Nft should have network'])
    }
    if (!nft.details) {
      errors.set(`${nft.contract?.address}-${nft.tokenId}`, [
        'Nft should have attached details',
      ])
    }
  })

  if (errors.size) {
    return {
      errors: Object.fromEntries(errors),
    }
  }

  const currentProfile = await ProfileKV.get<FullProfile>(accountURN!, 'json')
  const updatedProfile = Object.assign(currentProfile || {}, {
    gallery: nfts,
  })
  await ProfileKV.put(accountURN!, JSON.stringify(updatedProfile))

  return true
}

/**
 * Two components below are needed to create sortable grid of NFTs
 * you may take a quick look here:
 * https://codesandbox.io/s/dndkit-sortable-image-grid-py6ve?file=/src/App.jsx*/

const NFTComponent = forwardRef(
  ({ url, faded, isDragging, style, ...props }: any, ref) => {
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

const SortableNft = (props: { url?: Maybe<string>; id: string }) => {
  const sortable = useSortable({ id: props.id })
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
    <NFTComponent
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
  const actionData = useActionData()
  const { profile, cryptoAddresses, accountURN } = useOutletContext<{
    profile: FullProfile
    accountURN: string
    cryptoAddresses: Node[]
  }>()

  const { displayName } = profile

  // ------------------- STATE -------------------------------------------------
  // ------------------- GALLERY PART ---------------------------------

  const initialState = profile.gallery

  const [curatedNfts, setCuratedNfts] = useState(profile.gallery)
  const [curatedNftsSet, setCuratedNftsSet] = useState(
    new Set(
      profile.gallery.map((nft) => {
        return nft.contract.address + nft.tokenId
      })
    )
  )
  const [activeId, setActiveId] = useState(null)

  const transition = useTransition()
  const navigate = useNavigate()
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  // Needed for sortable component to work properly
  const curatedNftsIDs = curatedNfts.map(
    (nft) => nft.chain.chain + nft.contract.address + nft.tokenId
  )

  // ------------------- COLLECTED NFTS MODAL PART -----------------------------

  const [isOpen, setIsOpen] = useState(false)
  const [collection, setCollection] = useState('')

  const modalFetcher = useFetcher()

  // ------------------- NOTIFICATIONS HANDLER ---------------------------------
  const notify = (success: boolean = true) => {
    if (success) {
      toast(ToastType.Success, { message: 'Saved' })
    } else {
      toast(ToastType.Error, { message: 'Save Failed -- Please try again' })
    }
  }

  // ------------------- DND HANDLERS ------------------------------------------
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
        const oldIndex = curatedNftsIDs.indexOf(active.id)
        const newIndex = curatedNftsIDs.indexOf(over.id)

        return arrayMove(curatedNfts, oldIndex, newIndex)
      })
    }

    setActiveId(null)
  }

  // ------------------- HOOKS -------------------------------------------------

  useEffect(() => {
    if (transition.type === 'actionReload') {
      notify(!actionData?.errors)
    }
  }, [transition, actionData?.errors])

  useEffect(() => {
    const chain =
      collection !== ''
        ? modalFetcher.data?.ownedNfts.filter(
            (nft: NFT) => nft.contract.address === collection
          )[0].chain.chain
        : null

    getMoreNftsModal(modalFetcher, accountURN, collection, chain)
  }, [collection])

  return (
    <div className="relative min-h-[70vh]">
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        NFT Gallery
      </Text>
      <Toaster position="top-right" reverseOrder={false} />
      <Text className="border-none pb-6 text-gray-500">
        Here you can curate your profile gallery to show off your most precious
        NFTs
      </Text>
      {cryptoAddresses?.length ? (
        <Form method="post">
          <fieldset disabled={transition.state === 'loading'}>
            <PfpNftModal
              nfts={modalFetcher.data?.ownedNfts}
              collection={collection}
              setCollection={setCollection}
              displayName={displayName as string}
              loadingConditions={modalFetcher.state !== 'idle'}
              text={'Pick curated NFTs'}
              isOpen={isOpen}
              pfp={profile?.pfp?.image as string}
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
                  toast(
                    ToastType.Warning,
                    { message: 'This NFT is already in your gallery' },
                    {
                      icon: '🤔',
                    }
                  )
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
              <SortableContext
                items={curatedNftsIDs}
                strategy={rectSortingStrategy}
              >
                <div
                  style={{
                    display: 'grid',
                    gridGap: 10,
                    padding: 10,
                  }}
                  className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            flex flex-col justify-center items-center"
                >
                  {curatedNfts.map((nft: NFT, i: number) => {
                    return (
                      <div
                        className="relative group"
                        key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                      >
                        <SortableNft
                          id={
                            nft.chain.chain + nft.contract.address + nft.tokenId
                          }
                          url={nft.url}
                        />
                        <button
                          className="absolute right-3 bottom-3 opacity-50 rounded-full
                        h-[47px] w-[47px] items-center justify-center bg-black
                        hidden group-hover:flex hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setCuratedNfts(
                              curatedNfts.filter((nft, j: number) => j !== i)
                            )
                          }}
                        >
                          <TbTrash size={25} className="text-white" />
                        </button>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    className={`w-full h-full
              bg-gray-50 hover:bg-gray-100 transition-colors
              rounded-lg transition-opacity ${
                activeId ? 'opacity-0' : 'opacity-100'
              }`}
                    disabled={!cryptoAddresses?.length}
                    onClick={() => setIsOpen(!!cryptoAddresses?.length)}
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
                  <NFTComponent
                    url={curatedNfts[curatedNftsIDs.indexOf(activeId)].url}
                    index={curatedNftsIDs.indexOf(activeId)}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>

            <input
              type="hidden"
              name="gallery"
              value={JSON.stringify(curatedNfts)}
            />

            {/* Form where this button is used should have 
          an absolute relative position
          div below has relative - this way this button sticks to 
          bottom right
          This div with h-[4rem] prevents everything from overlapping with
          div with absolute position below  */}
            <div className="h-[4rem]" />
            <div className="absolute bottom-0 right-0">
              <SaveButton
                isFormChanged={
                  JSON.stringify(curatedNfts) !== JSON.stringify(initialState)
                }
                discardFn={() => {
                  setCuratedNfts(initialState)
                  setCuratedNftsSet(
                    new Set(
                      initialState.map(
                        (nft: any) => nft.contract.address + nft.tokenId
                      )
                    )
                  )
                }}
              />
            </div>
          </fieldset>
        </Form>
      ) : (
        <NoCryptoAddresses
          redirectHandler={() => {
            navigate('/account/connections')
          }}
        />
      )}
    </div>
  )
}

export default Gallery
