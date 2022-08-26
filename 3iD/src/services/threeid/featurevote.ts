import { retrieve, store } from "../storage";
import { FeatureVoteCount } from "./types";

export const getFeatureVoteCount = async (sdk: any): Promise<FeatureVoteCount> =>
  retrieve(sdk, "3id.feature_vote_count", "feature_vote_count");

export const setFeatureVoteCount = async (
  sdk: any,
  featureVoteCount: FeatureVoteCount
): Promise<FeatureVoteCount> => store(sdk, "3id.profile", "feature_vote_count", featureVoteCount);

export const fetchFeatureVoteCount = async (account: string): Promise<FeatureVoteCount> => {
  throw new Error("Not implemented");
};
