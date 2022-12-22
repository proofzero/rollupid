import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import SectionTitle from '../typography/SectionTitle'

import opensea from '~/assets/partners/opensea.svg'
import rarible from '~/assets/partners/rarible.svg'
import superrare from '~/assets/partners/superrare.svg'
import polygon from '~/assets/partners/polygon.svg'
import book from '~/assets/book.svg'

import noNfts from '~/assets/No_NFT_Found.svg'
import noFilter from '~/assets/no-filter.svg'

import { Button } from '@kubelt/design-system'
import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'

import Masonry from 'react-masonry-css'

import { HiChevronUp, HiOutlineCheck } from 'react-icons/hi'

import ProfileNftCollectionStyles from './ProfileNftCollection.css'
import { LinksFunction } from '@remix-run/cloudflare'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import InputText from '../inputs/InputText'

import { FaSearch } from 'react-icons/fa'

import ModaledNft from './ModaledNft'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: ProfileNftCollectionStyles },
]

export type ProfileNftCollectionProps = {
  account: string
  displayname?: string
  nfts?: {
    url: string
    title: string
    collectionTitle: string
  }[]
  pfp: string
  isOwner?: boolean
  preload?: boolean
  detailsModal?: boolean
  filters?: boolean

  handleSelectedNft?: (nft: any) => void

  nftRenderer?: (
    nft: any,
    selected: boolean,
    handleSelectedNft?: any
  ) => JSX.Element
}

type PartnerUrlProps = {
  title: string
  description?: string
  imgSrc?: string
  assetSrc?: string
  url: string
}

const PartnerUrl = ({ title, description, imgSrc, url }: PartnerUrlProps) => {
  return (
    <div className="flex flex-col text-center lg:text-left lg:flex-row items-center border border-gray-200">
      <div className="flex-1 flex flex-col lg:flex-row items-center">
        {imgSrc && (
          <img
            className="w-[4.5rem] h-[4.5rem] mb-5 lg:mb-0 lg:mr-5 bg-gray-50 mt-4 lg:mt-0"
            src={imgSrc}
            alt="here you was supposed to see something"
          />
        )}

        <div className="flex-1 flex flex-col">
          <Text size="sm" weight="medium" className="text-gray-900">
            {title}
          </Text>
          {description && (
            <Text size="sm" weight="normal" className="text-gray-500">
              {description}
            </Text>
          )}
        </div>
      </div>

      <span className="mx-5 my-4">
        <ButtonAnchor href={url} className="bg-gray-100 border-none">
          Visit website
        </ButtonAnchor>
      </span>
    </div>
  )
}

const ProfileNftCollection = ({
  nfts = [],
  isOwner = true,
  account,
  displayname,
  preload = false,
  filters = false,
  handleSelectedNft,
  pfp,
  nftRenderer = (nft) => <ModaledNft nft={nft} isModal={false} />,
}: ProfileNftCollectionProps) => {
  const [refresh, setRefresh] = useState(true)

  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [openedFilters, setOpenedFilters] = useState(false)

  const [textFilter, setTextFilter] = useState('')
  const [curFilter, setCurFilter] = useState('All Collections')

  const [colFilters, setColFilters] = useState([
    { title: 'All Collections', img: undefined },
    { title: 'Untitled Collections', img: undefined },
  ])

  // array used to sort NFTs alphabetically
  const sorted: any[] = []

  const [selectedNft, setSelectedNft] = useState('')

  const getMoreNfts = async () => {
    const nftReq = await fetch(
      `/nfts?owner=${account}${pageKey ? `&pageKey=${pageKey}` : ''}`
    )
    const nftRes: any = await nftReq.json()

    /* We already have only 1 NFT per collection
     ** No need to put it in additional Set data structure
     */
    setColFilters([
      ...colFilters,
      ...nftRes.ownedNfts.reduce((acc: any, nft: any) => {
        if (
          nft.collectionTitle &&
          nft.collectionTitle !== 'All Collections' &&
          nft.collectionTitle !== 'Untitled Collections'
        ) {
          return [
            ...acc,
            {
              title: nft.collectionTitle,
              img: nft.thumbnailUrl ? nft.thumbnailUrl : undefined,
            },
          ]
        } else {
          return acc
        }
      }, []),
    ])

    setLoadedNfts([...loadedNfts, ...nftRes.ownedNfts])
    setPageLink(nftRes.pageKey ?? null)

    if (refresh) {
      setRefresh(false)
    }
  }

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNfts()
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useMemo(() => {
    setRefresh(true)

    setLoadedNfts([])
    setPageLink(undefined)
  }, [account])

  useEffect(() => {
    const asyncFn = async () => {
      await getMoreNfts()
    }

    if (refresh) {
      asyncFn()
    }
  }, [refresh])

  const filteredLoadedNfts = loadedNfts.filter(
    (nft) =>
      curFilter === 'All Collections' ||
      curFilter === nft.collectionTitle ||
      (!nft.collectionTitle && curFilter === 'Untitled Collections')
  )

  return (
    <>
      {!loading && !refresh && !isOwner && loadedNfts.length === 0 && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && !refresh && isOwner && loadedNfts.length === 0 && (
        <>
          <div className="my-9 flex flex-row justify-center items-center">
            <img src={noNfts} className="w-[119px] h-[127px]" />

            <div>
              <Text size="3xl" weight="bold" className="text-gray-400">
                Oh no!
              </Text>
              <Text size="2xl" weight="medium" className="text-gray-400">
                Looks like you don't own any NFTs
              </Text>
            </div>
          </div>

          <SectionTitle
            title="Not sure where to start?"
            subtitle="Here is a list of popular marketplaces"
          />

          <div className="flex flex-col space-y-4 mb-11">
            <PartnerUrl
              imgSrc={opensea}
              title="OpenSea"
              description="The world’s largest digital marketplace for crypto collectibles and non-fungible tokens (NFTs), including ERC721 and ERC1155 assets."
              url="https://opensea.io"
            />
            <PartnerUrl
              imgSrc={rarible}
              title="Rarible"
              description="Rarible is a community-owned NFT marketplace, it awards the RARI token to active users on the platform, who buy or sell on the NFT marketplace. "
              url="https://rarible.com"
            />
            <PartnerUrl
              imgSrc={superrare}
              title="SuperRare"
              description="SuperRare has a strong focus on being a marketplace for people to buy and sell unique, single-edition digital artworks."
              url="https://superrare.com"
            />
          </div>

          <div className="flex flex-col space-y-5 lg:space-y-0 lg:flex-row lg:space-x-5">
            <div className="flex-1">
              <SectionTitle title="Mint your own NFT on Polygon" />

              <PartnerUrl
                imgSrc={polygon}
                title="Mintnft.Today"
                url="https://mintnft.today"
              />
            </div>

            <div className="flex-1">
              <SectionTitle title="What's an NFT?" />

              <PartnerUrl
                imgSrc={book}
                title="Learn About NFTs"
                url="https://opensea.io/learn/what-are-nfts"
              />
            </div>
          </div>
        </>
      )}
      {filters && loadedNfts.length > 0 && (
        <>
          <div
            className="w-full flex items-center justify-start 
        sm:justify-end lg:justify-end my-5"
          >
            <div className="w-full sm:w-auto mt-1 block rounded-md border-gray-300 py-2 text-base">
              <div>
                <div className="dropdown relative">
                  <button
                    className="
          dropdown-toggle
          ease-in-out
          flex
          flex-row
          justify-between
          items-center
          bg-white
          text-[#1f2937]
          shadow-sm
          border
          border-solid
          border-[#d1d5db]
          hover:bg-[#d1d5db]
          sm:min-w-[17.2rem]
          min-w-full
          py-[10px]
          px-[12px]
          font-medium
          text-base
          rounded-md
          "
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={() => {
                      setOpenedFilters(!openedFilters)
                    }}
                  >
                    {curFilter}
                    <HiChevronUp
                      size={20}
                      className={
                        openedFilters ? 'rotate-180 transition' : 'transition'
                      }
                    />
                  </button>
                  <ul
                    className="
          dropdown-menu
          list-none
          w-full
          absolute
          hidden
          bg-white
          text-base
          z-50
          float-left
          sm:max-h-[20rem]
          min-[480px]:max-h-[20rem]
          max-h-[23rem]
          py-2
          rounded-lg
          shadow-xl
          mt-1
          overflow-auto
          hidden
          m-0
          bg-clip-padding
          border-none
          px-1
          items-center
        "
                    aria-labelledby="dropdownMenuButton1"
                  >
                    <li>
                      <InputText
                        heading=""
                        placeholder={'Search'}
                        Icon={FaSearch}
                        onChange={(val) => {
                          setTextFilter(val)
                        }}
                      />
                    </li>
                    {colFilters
                      .filter((filter) =>
                        filter.title
                          .toLowerCase()
                          .includes(textFilter.toLowerCase())
                      )
                      .map((colName, i) => (
                        <li key={`${colName.title}_${i}`}>
                          <div
                            className="
                      dropdown-item
                      flex 
                      select-none
                      flex-row
                      sm:max-w-[17rem]
                      overflow-auto
                      bg-transparent
                      w-full
                      hover:bg-gray-100
                      py-2
                      pl-1
                      block"
                            onClick={(event: any) => {
                              setCurFilter(
                                colName.title || 'Untitled Collection'
                              )
                            }}
                          >
                            {colName.title === 'All Collections' ||
                            colName.img ? (
                              <img
                                className="w-[1.5em] h-[1.5em] rounded-full"
                                src={
                                  colName.title === 'All Collections'
                                    ? pfp
                                    : colName.img
                                }
                                onError={({ currentTarget }) => {
                                  currentTarget.onerror = null
                                  currentTarget.src = noFilter
                                }}
                                alt="+"
                              />
                            ) : (
                              <div className="w-[1.5em] h-[1.5em] bg-[#E8E8E8] rounded-full"></div>
                            )}

                            {curFilter === colName.title ||
                            curFilter === 'Untitled Collection' ? (
                              <Text className="focus:outline-none w-full px-3 flex flex-row items-center justify-between">
                                <div>{colName.title}</div>
                                <HiOutlineCheck size={20} />
                              </Text>
                            ) : (
                              <Text className="focus:outline-none pl-3">
                                {colName.title}
                              </Text>
                            )}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <InfiniteScroll
            dataLength={loadedNfts.length} //This is important field to render the next data
            next={preload ? () => {} : getMoreNfts}
            hasMore={preload ? false : pageKey != null}
            loader={<Spinner />}
            className={`${
              filteredLoadedNfts.length > 4
                ? 'flex items-center justify-center'
                : ''
            }`}
          >
            <Masonry
              breakpointCols={{
                default: 5,
                1280: 4,
                1024: 3,
                768: 2,
                640: 1,
              }}
              className="my-masonry-grid space-x-10"
              columnClassName="my-masonry-grid_column"
            >
              {filteredLoadedNfts
                .sort((a, b) => {
                  if (b.collectionTitle === null) {
                    return -1
                  } else {
                    return (
                      a.collectionTitle?.localeCompare(b.collectionTitle) || 1
                    )
                  }
                })
                .map((nft, index) => {
                  return (
                    <div
                      key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`}
                      className="flex justify-center"
                    >
                      {nftRenderer(
                        nft,
                        selectedNft ===
                          `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`,
                        (selectedNft: any) => {
                          setSelectedNft(
                            `${nft.collectionTitle}_${nft.title}_${nft.url}_${index}`
                          )

                          if (handleSelectedNft) {
                            handleSelectedNft(selectedNft)
                          }
                        }
                      )}
                    </div>
                  )
                })}
            </Masonry>
          </InfiniteScroll>
        </>
      )}

      {(refresh || loading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      )}
    </>
  )
}

export default ProfileNftCollection
