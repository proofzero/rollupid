import { retrieve, store } from "../storage";
import { FunnelState } from "./types";

export const tickFunnelStep = async (sdk: any, step: keyof FunnelState) => {
  let funnelState: FunnelState = {
    mint: false,
    invite: false,
    naming: false,
  };

  const storedFunnelState = await retrieve(sdk, "3id.profile", "funnel-state");
  if (storedFunnelState) {
    funnelState = storedFunnelState;
  }

  funnelState[step] = true;

  await store(sdk, "3id.profile", "funnel-state", funnelState);
};

export const getFunnelState = async (sdk: any): Promise<FunnelState> => {
  const storedFunnelState = await retrieve(sdk, "3id.profile", "funnel-state");
  let funnelRes: FunnelState = {
    invite: false,
    mint: false,
    naming: false,
  };

  if (storedFunnelState) {
    funnelRes = storedFunnelState;
  }

  return funnelRes;
};
