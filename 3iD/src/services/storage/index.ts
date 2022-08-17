// @ts-ignore
import sdkWeb from "../../../../packages/sdk-web/lib/com.kubelt.sdk.js";

export const store = async (sdk: any, ns: string, path: string, data: any) => {
  let storedObject: any;

  try {
    const res = await sdkWeb.node_v1.oort.callRpc(sdk, {
      method: ["kb", "set-data"],
      params: [ns, path, JSON.stringify(data)],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = JSON.parse(res.body.result.value);
  } catch (e) {
    console.warn("Failed to store data");
  }

  return storedObject;
};

export const retrieve = async (
  sdk: any,
  ns: string,
  path: string
): Promise<any> => {
  let storedObject: any;

  try {
    const res = await sdkWeb.node_v1.oort.callRpc(sdk, {
      method: ["kb", "get-data"],
      params: [ns, path],
    });

    if (!res || res?.error || res?.body.error) {
      throw new Error();
    }

    storedObject = JSON.parse(res.body.result.value);
  } catch (e) {
    console.warn("Failed to retrieve data");
  }

  return storedObject;
};
