import { retrieve, store } from "../storage";
import { Profile } from "./types";

export const fetchProfile = async (sdk: any): Promise<Profile> =>
  retrieve(sdk, "3id.profile", "profile");
export const setProfile = async (
  sdk: any,
  updatedProfile: Profile
): Promise<Profile> => store(sdk, "3id.profile", "profile", updatedProfile);

export const fetchPublicProfile = async (account: string): Promise<Profile> => {
  throw new Error("Not implemented");
};
