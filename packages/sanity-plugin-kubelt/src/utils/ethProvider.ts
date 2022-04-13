import detectEthereumProvider from "@metamask/detect-provider";

const getEthProvider = async () => {
  const ethProvider = (await detectEthereumProvider({
    mustBeMetaMask: true,
  })) as any;
  if (!ethProvider) {
    throw new Error(
      "MetaMask not found. Connection to Kubelt network impossible."
    );
  }

  return ethProvider;
};

export default getEthProvider;
