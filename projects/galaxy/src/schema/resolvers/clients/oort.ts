type HeadersObject = {
  "Content-Type": string;
  "KBT-Access-JWT-Assertion"?: string;
  "KBT-Core-Address"?: string;
};

type OortOptions = {
  route?: {
    address: string;
  };
};

type OortBinding = {
  fetch: (
    url: string,
    options: { method: string; headers: HeadersObject; body?: string }
  ) => Promise<Response>;
};

export type OortJwt = {
  aud: string[];
  iss: string;
  sub: string;
  exp: number;
  iat: number;
  capabilities: object;
};

export default class OortClient {
  oort: OortBinding;
  jwt: string | null;

  constructor(oort: OortBinding, jwt: string | null = null) {
    this.oort = oort;
    this.jwt = jwt;
  }

  async send(
    method: string,
    params: any[] | null = null,
    options: OortOptions | null = null
  ): Promise<Response> {
    const id = method
      .replace(/^.+_/, "")
      .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

    const headers: HeadersObject = {
      // "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json;charset=UTF-8",
    };
    if (this.jwt) {
      headers["KBT-Access-JWT-Assertion"] = this.jwt;
    }
    if (options?.route?.address) {
      headers["KBT-Core-Address"] = options.route.address;
    }

    const request = new Request(
      //@ts-ignore
      `https://127.0.0.1/jsonrpc`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          id,
          jsonrpc: "2.0",
          method,
          params,
        }),
      }
    );

    //@ts-ignore
    const response = await this.oort.fetch(request);

    return response;
  }

  async getProfile(): Promise<Response> {
    const params = ["3id.profile", ""];
    return this.send("kb_getObject", params);
  }

  async getProfileFromAddress(address: string): Promise<Response> {
    const params = ["3id.profile", ""];
    const options = {
      route: { address },
    };
    return this.send("kb_getObject", params, options);
  }

  async updateProfile(profile: any, visibility: string): Promise<Response> {
    const params = ["3id.profile", "", profile, { visibility }];
    return this.send("kb_putObject", params);
  }
}
