import { Text } from '@kubelt/design-system/src/atoms/text/Text'

import SectionTitle from '../typography/SectionTitle'

import opensea from '~/assets/partners/opensea.svg'
import rarible from '~/assets/partners/rarible.svg'
import superrare from '~/assets/partners/superrare.svg'
import polygon from '~/assets/partners/polygon.svg'
import book from '~/assets/book.svg'

import noNfts from '~/assets/No_NFT_Found.svg'

import { ButtonAnchor } from '@kubelt/design-system/src/atoms/buttons/ButtonAnchor'

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

const ShowPartners = ({ isGallery = false }) => {
  return (
    <div className="mb-2">
      <div className="my-9 flex flex-row justify-center items-center">
        <img
          src={noNfts}
          className="w-[119px] h-[127px]"
          alt="Something went wrong..."
        />

        <div>
          <Text size="3xl" weight="bold" className="text-gray-400">
            Oh no!
          </Text>
          <Text size="2xl" weight="medium" className="text-gray-400">
            {isGallery
              ? "Looks like you don't have NFTs in your gallery"
              : "Looks like you don't own any NFTs"}
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
    </div>
  )
}

export default ShowPartners
