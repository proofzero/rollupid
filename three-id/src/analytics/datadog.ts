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
let sessionStarted: boolean = false;

const init = async () => {
  if (!initialized) {
    datadogRum.init(configuration);

    initialized = true;
  }
};

export const startSession = async () => {
  await init();

  if (!sessionStarted) {
    datadogRum.startSessionReplayRecording();
    sessionStarted = true;
  } else console.info("Session already started");
};

export const stopSession = () => {
  if (sessionStarted) {
    datadogRum.stopSessionReplayRecording();
    sessionStarted = false;
  } else console.info("No session started");
};
