import {
  datadogRum,
  RumInitConfiguration,
  DefaultPrivacyLevel,
} from "@datadog/browser-rum";

import Constants from "expo-constants";

const configuration: RumInitConfiguration = {
  applicationId: Constants.manifest?.extra?.datadogApplicationId,
  clientToken: Constants.manifest?.extra?.datadogClientToken,
  site: "datadoghq.com",
  service: Constants.manifest?.extra?.datadogServiceName,
  env: Constants.manifest?.extra?.datadogEnv,
  sampleRate: 100,
  premiumSampleRate: 100,
  trackInteractions: true,
  defaultPrivacyLevel: DefaultPrivacyLevel.MASK_USER_INPUT,
};

let initialized: boolean = false;
const init = async () => {
  if (!initialized) {
    datadogRum.init(configuration);
    initialized = true;
  }
};

export const startView = async (viewKey: string): Promise<void> => {
  await init();

  datadogRum.startView(viewKey);
};

export default init;
