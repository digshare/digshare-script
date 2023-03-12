export interface ConfigRaw {
  accessToken?: string;
  endpoint?: string;
}

export class Config {
  readonly accessToken: string | undefined;
  readonly endpoint: string;

  constructor(readonly path: string) {
    let raw: ConfigRaw | undefined;

    try {
      raw = require(path) as ConfigRaw;
    } catch {
      raw = {};
    }

    const {accessToken, endpoint} = raw;

    this.accessToken = accessToken;
    this.endpoint = endpoint ?? 'https://api.dingshao.com';
  }
}
