export const getENSEntries = async (): Promise<string[]> => {
  let ens: string[] = [];

  try {
    // const res = await sdkWeb.node_v1.oort.callRpc(sdk, {
    //   method: ["3id", "get-ens"],
    //   params: [],
    // });

    // if (!res || res?.error || res?.body.error) {
    //   throw new Error();
    // }

    // ens = res.body.result;

    await new Promise((resolve) => setTimeout(resolve, 1216));
  } catch (e) {
    console.warn("Failed to get ens");
  }

  return ens;
};
