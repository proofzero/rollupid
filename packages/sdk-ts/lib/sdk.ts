import sdk from "@kubelt/sdk-js";

type InitRes = unknown;

export const init = async (): Promise<InitRes> => sdk.v1.init();
