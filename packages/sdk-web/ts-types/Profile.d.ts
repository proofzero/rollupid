export interface Profile {
  nickname?: string;
  bio?: string;
  job?: string;
  location?: string;
  website?: string;
  email?: string;
  "profile/profilePicture"?: ProfilePicture;
  "profile/socials"?: Socials;
}
export interface ProfilePicture {
  collectionTokenId: string;
  collectionId?: string;
  name: string;
  imageUrl: string;
}
export interface Socials {
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}
