import {
  datadogRum,
  RumInitConfiguration,
  DefaultPrivacyLevel,
} from "@datadog/browser-rum";

import Constants from "expo-constants";

const configuration: RumInitConfiguration = {
  // @ts-ignore
  applicationId: window.ENV.DATADOG_APPLICATION_ID,
  // @ts-ignore
  clientToken: window.ENV.DATADOG_CLIENT_TOKEN,
  site: "datadoghq.com",
  // @ts-ignore
  service: window.ENV.DATADOG_SERVICE_NAME,
  // @ts-ignore
  env: window.ENV.DATADOG_ENV,
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
  }
};

export const stopSession = () => {
  if (sessionStarted) {
    datadogRum.stopSessionReplayRecording();
    sessionStarted = false;
  }
};

export default datadogRum;
