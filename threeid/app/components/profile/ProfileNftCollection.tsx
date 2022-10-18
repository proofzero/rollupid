import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";
import SectionTitle from "../typography/SectionTitle";

import opensea from "~/assets/partners/opensea.svg";
import rarible from "~/assets/partners/rarible.svg";
import superrare from "~/assets/partners/superrare.svg";
import polygon from "~/assets/partners/polygon.svg";
import book from "~/assets/book.svg";

import noNfts from "~/assets/No_NFT_Found.svg";

import { ButtonAnchor } from "../buttons";

import Masonry from "react-masonry-css";

import ProfileNftCollectionStyles from "./ProfileNftCollection.css";
import { LinksFunction } from "@remix-run/cloudflare";

import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import Spinner from "../spinner";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: ProfileNftCollectionStyles },
];

export type ProfileNftCollectionProps = {
  account: string;
  displayname?: string;
  nfts?: {
    url: string;
    title: string;
    collectionTitle: string;
  }[];
  isOwner?: boolean;
};

type PartnerUrlProps = {
  title: string;
  description?: string;
  imgSrc?: string;
  assetSrc?: string;
  url: string;
};

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
          <Text size={TextSize.SM} weight={TextWeight.Medium500}>
            {title}
          </Text>
          {description && (
            <Text
              size={TextSize.SM}
              weight={TextWeight.Medium500}
              color={TextColor.Gray500}
            >
              {description}
            </Text>
          )}
        </div>
      </div>

      <span className="mx-5 my-4">
        <ButtonAnchor href={url}>Visit website</ButtonAnchor>
      </span>
    </div>
  );
};

const ProfileNftCollection = ({
  nfts = [],
  isOwner = true,
  account,
  displayname,
}: ProfileNftCollectionProps) => {
  const [loadedNfts, setLoadedNfts] = useState(nfts);
  const [pageKey, setPageLink] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const getMoreNfts = async () => {
    const nftReq = await fetch(
      `/nfts?owner=${account}${pageKey ? `&pageKey=${pageKey}` : ""}`
    );
    const nftRes = await nftReq.json();

    setPageLink(nftRes.pageKey);
    setLoadedNfts([...loadedNfts, ...nftRes.ownedNfts]);

    if (loading) setLoading(false);
  };

  useEffect(() => {
    getMoreNfts();
  }, []);

  return (
    <>
      <Text
        className="mb-12"
        size={TextSize.SM}
        weight={TextWeight.SemiBold600}
      >
        NFT Collection
      </Text>

      {loading && <Spinner />}

      {!loading && !isOwner && loadedNfts.length === 0 && (
        <Text
          className="text-center"
          size={TextSize.XL2}
          weight={TextWeight.Medium500}
          color={TextColor.Gray300}
        >
          Looks like {displayname ?? account} doesn't own any NFTs
        </Text>
      )}
      {!loading && isOwner && loadedNfts.length === 0 && (
        <>
          <div className="my-9 flex flex-row justify-center items-center">
            <img src={noNfts} className="w-[119px] h-[127px]" />

            <div>
              <Text
                size={TextSize.XL3}
                weight={TextWeight.Bold700}
                color={TextColor.Gray400}
              >
                Oh no!
              </Text>
              <Text
                size={TextSize.XL2}
                weight={TextWeight.Medium500}
                color={TextColor.Gray400}
              >
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

      {loadedNfts.length > 0 && (
        <InfiniteScroll
          dataLength={loadedNfts.length} //This is important field to render the next data
          next={getMoreNfts}
          hasMore={pageKey != null}
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
            {loadedNfts.map((nft, i) => (
              // Filtering collection by
              // unique values
              // breaks the infinite scroll
              // plugin I resorted to this
              <div
                key={`${nft.url}_${i}`}
                className="relative overlay-img-wrapper"
              >
                <div className="absolute left-0 right-0 top-0 bottom-0 p-4 flex flex-col justify-end">
                  <Text
                    size={TextSize.SM}
                    weight={TextWeight.SemiBold600}
                    color={TextColor.White}
                  >
                    {nft.collectionTitle}
                  </Text>
                  <Text
                    size={TextSize.SM}
                    weight={TextWeight.SemiBold600}
                    color={TextColor.White}
                  >
                    {nft.title}
                  </Text>
                </div>

                <img className="w-full" src={nft.url} />
              </div>
            ))}
          </Masonry>
        </InfiniteScroll>
      )}
    </>
  );
};

export default ProfileNftCollection;
