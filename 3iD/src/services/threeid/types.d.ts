export type Profile = {
  nickname?: string;
  profilePicture?: {
    collectionTokenId: string;
    collectionId?: string;
    name: string;
    imageUrl: string;
  };
  email?: string;
  location?: string;
  job?: string;
  website?: string;
  bio?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
};

export type FunnelState = {
  mint: boolean;
  invite: boolean;
  naming: boolean;
};

export type GenPfPReq = {
  account: string;
  blockchain: {
    name: string;
    chainId: number;
  };
};

export type GenPfPResTraits = {
  [key: string]: {
    type: string;
    value: {
      name: string;
      rgb: {
        r: number;
        g: number;
        b: number;
      };
      rnd: number[];
    };
  };
};

export type GenPfPRes =
  | {
      metadata: {
        name: string;
        description: string;
        properties: {
          account: string;
          blockchain: {
            name: string;
            chainId: number;
          };
          traits: GenPfPResTraits;
        };

        /** ipfs:// URI */
        image: string;
      };

      voucher: {
        account: string;

        /** ipfs:// URI */
        tokenURI: string;
      };

      signature: {
        /**
         * JSON representation
         */
        message: string;
        messageHash: string;

        v: string;
        r: string;
        s: string;

        signature: string;
      };
    }
  | undefined;

export interface Invitation {
  contractAddress: string;
  tokenId: string;
  title: string;

  /**
   * URL of the image
   */
  image: string;
}
