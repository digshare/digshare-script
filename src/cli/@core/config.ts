import * as FS from 'fs';

export interface ConfigRaw {
  accessToken?: string;
  endpoints?: {
    api?: string;
    auth?: string;
  };
}

export class Config {
  private raw: ConfigRaw;

  accessToken: string | undefined;

  readonly endpoints: {
    api: string;
    auth: string;
  };

  constructor(readonly path: string) {
    let raw: ConfigRaw | undefined;

    try {
      raw = require(path) as ConfigRaw;
    } catch {
      raw = {};
    }

    this.raw = raw;

    const {
      accessToken,
      endpoints: {
        api = 'https://api.dingshao.com',
        auth = 'https://www.dingshao.com',
      } = {},
    } = raw;

    this.accessToken = accessToken;
    this.endpoints = {
      api,
      auth,
    };
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    this.raw.accessToken = accessToken;

    FS.writeFileSync(this.path, `${JSON.stringify(this.raw, undefined, 2)}\n`);
  }
}
