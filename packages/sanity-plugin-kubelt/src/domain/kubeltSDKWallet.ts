export default interface IKubeltSdkWallet {
  address: string;

  signFn: (signable: string) => Promise<string>;
}
