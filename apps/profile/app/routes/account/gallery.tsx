// React

import { useState, forwardRef, useEffect, useMemo } from 'react'
import { Toaster, toast } from 'react-hot-toast'

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
import { LoadingGridSquaresGallery } from '~/components/nfts/grid/loading'
import NoCryptoAddresses from '~/components/accounts/NoCryptoAddresses'

// Other helpers
import { getProfileSession } from '~/utils/session.server'
import { getGalaxyClient } from '~/helpers/clients'
import type { Profile, Node } from '@kubelt/galaxy-client'
import { getMoreNftsModal } from '~/helpers/nfts'
import type { decoratedNft } from '~/helpers/nfts'
import { getAuthzHeaderConditionallyFromToken } from '@kubelt/utils'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const session = await getProfileSession(request)
  const user = session.get('user')

  const jwt = user.accessToken

  let errors = new Map()

  const updatedGallery = formData.get('gallery') as string
  if (!updatedGallery) {
    throw new Error('Gallery should not be empty')
  }
  const nfts: decoratedNft[] = JSON.parse(updatedGallery)

  // TODO: replace with zod?
  nfts.forEach((nft) => {
    if (!nft.tokenId) {
      errors.set('tokenId', ['Nft should have token ID'])
    }
    if (!nft.contract?.address) {
      errors.set(`contractAddress-${nft.tokenId}`, [
        'Nft should have contract address',
      ])
    }
    if (!nft.chain?.network) {
      errors.set(`network-${nft.tokenId}`, ['Nft should have network'])
    }

    if (nft.error) {
      errors.set(`${nft.contract?.address}-${nft.tokenId}`, nft.error)
    }
  })

  if (errors.size) {
    return {
      errors: Object.fromEntries(errors),
    }
  }

  const gallery = nfts.map((nft: decoratedNft, i: number) => ({
    contract: nft.contract?.address,
    tokenId: nft.tokenId,
    chain: nft.chain?.chain,
  }))

  const galaxyClient = await getGalaxyClient()
  await galaxyClient.updateGallery(
    {
      gallery,
    },
    getAuthzHeaderConditionallyFromToken(jwt)
  )

  // TODO: update gallery on account

  return true
}

/**
 * Two components below are needed to create sortable grid of NFTs
 * you may take a quick look here:
 * https://codesandbox.io/s/dndkit-sortable-image-grid-py6ve?file=/src/App.jsx*/

const NFT = forwardRef(
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
    <NFT
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
  const actionData = useActionData()
  const { profile, cryptoAddresses, accountURN } = useOutletContext<{
    profile: Profile
    accountURN: string
    cryptoAddresses: Node[]
  }>()

  const { displayName } = profile

  // ------------------- START OF GALLERY PART -------------------- //
  // STATE

  const [initialState, setInitialState] = useState([])

  const [curatedNfts, setCuratedNfts] = useState([] as decoratedNft[])
  const [curatedNftsSet, setCuratedNftsSet] = useState(new Set([] as string[]))
  const [isFormChanged, setFormChanged] = useState(false)

  const transition = useTransition()
  const galleryFetcher = useFetcher()
  const navigate = useNavigate()

  const [activeId, setActiveId] = useState(null)
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const curatedNftsLinks = curatedNfts.map((nft) => nft.url)

  // REACT HOOKS FOR DISPLAYING AND SORTING GALLERY
  useEffect(() => {
    if (JSON.stringify(curatedNfts) !== JSON.stringify(initialState)) {
      setFormChanged(true)
    }
  }, [curatedNfts, initialState])

  useEffect(() => {
    if (transition.type === 'actionReload') {
      setFormChanged(false)
      notify(!actionData?.errors)
    }
  }, [transition])

  useEffect(() => {
    ;(async () => {
      const addressQueryParams = new URLSearchParams({
        addressURN: cryptoAddresses[0].baseUrn,
      })
      const request = `/nfts/gallery?${addressQueryParams.toString()}`

      galleryFetcher.load(request)
    })()
  }, [])

  useEffect(() => {
    if (galleryFetcher.data) {
      // Do not need to sort them alphabetically here
      setInitialState(galleryFetcher.data.gallery)
      setCuratedNfts(galleryFetcher.data.gallery)
      setCuratedNftsSet(
        new Set(
          galleryFetcher.data.gallery.map(
            (nft: any) => nft.contract.address + nft.tokenId
          )
        )
      )
    }
  }, [galleryFetcher.data])

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

  // ------------------- END OF GALLERY PART ---------------------- //
  // ------------------- START OF MODAL PART ---------------------- //
  // STATE
  const [refresh, setRefresh] = useState(true)
  const [loadedNfts, setLoadedNfts] = useState([] as any[])
  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [collection, setCollection] = useState('')

  const modalFetcher = useFetcher()

  // HOOKS
  useEffect(() => {
    if (modalFetcher.data) {
      /* We already have only 1 NFT per collection
       ** No need to put it in additional set
       */

      setLoadedNfts(modalFetcher.data.ownedNfts)
      setPageLink(modalFetcher.data.pageKey ?? null)

      if (refresh) {
        setRefresh(false)
      }
    }
  }, [modalFetcher.data])

  useEffect(() => {
    getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
  }, [collection])

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useMemo(() => {
    setRefresh(true)
    setLoadedNfts([])
    setPageLink(undefined)
  }, [])

  useEffect(() => {
    const asyncFn = async () => {
      getMoreNftsModal(modalFetcher, accountURN, collection, pageKey)
    }
    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  // --------------------- END OF MODAL PART ---------------------- //

  return (
    <div className="relative">
      <Text size="xl" weight="bold" className="my-4 text-gray-900">
        NFT Gallery
      </Text>
      <Toaster position="top-right" reverseOrder={false} />
      <Text className="border-none pb-6 text-gray-500">
        Here you can curate your profile gallery to show off your most precious
        NFTs
      </Text>
      {cryptoAddresses?.length ? (
        <Form
          method="post"
          onReset={() => {
            setFormChanged(false)
          }}
        >
          <PfpNftModal
            nfts={loadedNfts}
            collection={collection}
            setCollection={setCollection}
            displayName={displayName as string}
            loadingConditions={
              refresh || loading || modalFetcher.state !== 'idle'
            }
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
                toast('This NFT is already in your gallery', {
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
            <SortableContext
              items={Array.from(curatedNftsSet)}
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
                {galleryFetcher.state === 'loading' && !curatedNfts.length && (
                  <LoadingGridSquaresGallery numberOfCells={30} />
                )}
                {curatedNfts.map((nft: any, i: number) => {
                  return (
                    <div
                      className="relative group"
                      key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                    >
                      <SortableNft url={nft.url} index={i} nft={nft} />
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
                <NFT
                  url={activeId}
                  index={curatedNftsLinks.indexOf(activeId)}
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
              isFormChanged={isFormChanged}
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
