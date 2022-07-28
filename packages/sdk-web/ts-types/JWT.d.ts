export interface JWT {
  header: {
    alg: "ES256";
  };
  claims: {
    aud: string;
    iss: string;
    sub: string;
    "json-rpc-url": string;
    iat: number;
    exp: number;
  };
  token: string;
  signature: string;
}
