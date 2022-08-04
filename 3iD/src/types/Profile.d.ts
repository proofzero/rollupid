export interface Profile {
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
}
