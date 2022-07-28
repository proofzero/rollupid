export interface OptionalSdkConfig {
  "log/level"?: ("log" | "trace" | "debug" | "info" | "warn" | "error" | "fatal") & string;
  "app/name"?: string;
  /**
   * A wrapper around platform storage for storing
   *    some SDK configuration state. Note that we use an & suffix to denote
   *    a function that returns a delayed computation (future, promise).
   */
  "config/storage"?: {
    "com.kubelt/type": "kubelt.type/storage";
    /**
     * A storage function that takes a map of SDK state
     * and writes it to platform storage. Returns an error map on error.
     */
    "storage/store-fn": (sdk: any) => any;
    /**
     * A storage function that returns an SDK instance
     * using state loaded from platform storage, or an error map if an error
     * occurs.
     */
    "storage/restore-fn": (sdk: any) => any;
  };
  "credential/jwt"?: {
    [k: string]: string;
  };
  "crypto/wallet"?: {
    "com.kubelt/type": "kubelt.type/wallet";
    "wallet/address": string;
    /**
     * A signing function that takes some data and
     * returns a signature generated using the private key associated with the
     * wallet.
     */
    "wallet/sign-fn"?: (data: any) => string;
  };
  "ipfs.read/scheme"?: "http" | "https";
  "ipfs.read/host"?: string;
  "ipfs.read/port"?: number;
  "ipfs.write/scheme"?: "http" | "https";
  "ipfs.write/host"?: string;
  "ipfs.write/port"?: number;
  "oort/scheme"?: "http" | "https";
  "oort/host"?: string;
  "oort/port"?: number;
}
