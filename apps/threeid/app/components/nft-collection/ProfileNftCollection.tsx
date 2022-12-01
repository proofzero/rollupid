import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import SectionTitle from '../typography/SectionTitle'

import opensea from '~/assets/partners/opensea.svg'
import rarible from '~/assets/partners/rarible.svg'
import superrare from '~/assets/partners/superrare.svg'
import polygon from '~/assets/partners/polygon.svg'
import book from '~/assets/book.svg'

import noNfts from '~/assets/No_NFT_Found.svg'

import { ButtonAnchor } from '../buttons'

import Masonry from 'react-masonry-css'

import ProfileNftCollectionStyles from './ProfileNftCollection.css'
import { LinksFunction } from '@remix-run/cloudflare'

import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useState } from 'react'
import { Spinner } from '@kubelt/design-system/src/atoms/spinner/Spinner'
import InputText from '../inputs/InputText'

import { FaSearch } from 'react-icons/fa'

import ModaledNft from './ModaledNft'
import SelectableNft from './SelectableNft'

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
          />
        )}

        <div className="flex-1 flex flex-col">
          <Text size="sm" weight="medium">
            {title}
          </Text>
          {description && (
            <Text size="sm" weight="medium" className="text-gray-500">
              {description}
            </Text>
          )}
        </div>
      </div>

      <span className="mx-5 my-4">
        <ButtonAnchor href={url}>Visit website</ButtonAnchor>
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
  nftRenderer = (nft) => <ModaledNft nft={nft} />,
}: ProfileNftCollectionProps) => {
  const [loadedNfts, setLoadedNfts] = useState(nfts)

  const [pageKey, setPageLink] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)

  const [textFilter, setTextFilter] = useState('')
  const [colFilter, setColFilter] = useState('All Collections')

  const [selectedNft, setSelectedNft] = useState('')

  const getMoreNfts = async () => {
    const nftReq = await fetch(
      `/nfts?owner=${account}${pageKey ? `&pageKey=${pageKey}` : ''}`
    )
    const nftRes = await nftReq.json()

    setLoadedNfts([...loadedNfts, ...nftRes.ownedNfts])
    setPageLink(nftRes.pageKey ?? null)
  }

  useEffect(() => {
    if (pageKey) {
      setLoading(true)
      getMoreNfts()
    } else if (pageKey === null) {
      setLoading(false)
    }
  }, [pageKey])

  useEffect(() => {
    getMoreNfts()
  }, [])

  return (
    <>
      {!loading && !isOwner && loadedNfts.length === 0 && (
        <Text className="text-center text-gray-300" size="2xl" weight="medium">
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && isOwner && loadedNfts.length === 0 && (
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
              url="#"
            />
            <PartnerUrl
              imgSrc={rarible}
              title="Rarible"
              description="Rarible is a community-owned NFT marketplace, it awards the RARI token to active users on the platform, who buy or sell on the NFT marketplace. "
              url="#"
            />
            <PartnerUrl
              imgSrc={superrare}
              title="SuperRare"
              description="SuperRare has a strong focus on being a marketplace for people to buy and sell unique, single-edition digital artworks."
              url="#"
            />
          </div>

          <div className="flex flex-col space-y-5 lg:space-y-0 lg:flex-row lg:space-x-5">
            <div className="flex-1">
              <SectionTitle title="Mint your own NFT on Polygon" />

              <PartnerUrl imgSrc={polygon} title="Mintnft.Today" url="#" />
            </div>

            <div className="flex-1">
              <SectionTitle title="What's an NFT?" />

              <PartnerUrl imgSrc={book} title="Learn About NFTs" url="#" />
            </div>
          </div>
        </>
      )}

      {!loading && !pageKey && loadedNfts.length > 0 && filters && (
        <div className="flex flex-col lg:flex-row justify-between items-center my-5">
          <select
            id="collection"
            name="collection"
            className="w-full lg:w-auto mt-1 block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            defaultValue="All Collections"
            onChange={(evt) => {
              setColFilter(evt.target.value)
            }}
          >
            <option>All Collections</option>
            {loadedNfts
              .map((n) => n.collectionTitle)
              .filter((val, ind, arr) => arr.indexOf(val) === ind)
              .map((colName, i) => (
                <option key={`${colName}_${i}`}>{colName}</option>
              ))}
          </select>

          <InputText
            heading=""
            Icon={FaSearch}
            onChange={(val) => {
              setTextFilter(val)
            }}
          />
        </div>
      )}

      {loadedNfts.length > 0 && (
        <InfiniteScroll
          dataLength={loadedNfts.length} //This is important field to render the next data
          next={preload ? () => {} : getMoreNfts}
          hasMore={preload ? false : pageKey != null}
          loader={<Spinner />}
        >
          <Masonry
            breakpointCols={{
              default: 5,
              1024: 3,
              768: 2,
              640: 1,
            }}
            className="my-masonry-grid space-x-10"
            columnClassName="my-masonry-grid_column"
          >
            {loadedNfts
              .filter(
                (nft) =>
                  colFilter === 'All Collections' ||
                  nft.collectionTitle === colFilter
              )
              .filter(
                (nft) =>
                  nft.title?.toLowerCase().includes(textFilter.toLowerCase()) ||
                  nft.collectionTitle
                    ?.toLowerCase()
                    .includes(textFilter.toLowerCase())
              )
              .map((nft, i) => (
                // Filtering collection by
                // unique values
                // breaks the infinite scroll
                // plugin I resorted to this
                <div
                  key={`${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`}
                >
                  {nftRenderer(
                    nft,
                    selectedNft ===
                      `${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`,
                    (selectedNft: any) => {
                      setSelectedNft(
                        `${nft.collectionTitle}_${nft.title}_${nft.url}_${i}`
                      )

                      if (handleSelectedNft) {
                        handleSelectedNft(selectedNft)
                      }
                    }
                  )}
                </div>
              ))}
          </Masonry>
        </InfiniteScroll>
      )}

      {loading && (
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
