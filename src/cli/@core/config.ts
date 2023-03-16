import * as FS from 'fs';

export interface GlobalConfigRaw {
  endpoints?: {
    api?: string;
    auth?: string;
  };
}

export interface LocalConfigRaw extends GlobalConfigRaw {
  accessToken?: string;
}

export class Config {
  private globalRaw: GlobalConfigRaw;
  private localRaw: LocalConfigRaw;

  accessToken: string | undefined;

  readonly endpoints: {
    api: string;
    auth: string;
  };

  constructor(
    readonly globalConfigPath: string,
    readonly localConfigPath: string,
  ) {
    try {
      this.globalRaw = JSON.parse(FS.readFileSync(globalConfigPath, 'utf8'));
    } catch {
      this.globalRaw = {};
    }

    try {
      this.localRaw = JSON.parse(FS.readFileSync(localConfigPath, 'utf8'));
    } catch (error) {
      this.localRaw = {};
    }

    const {
      accessToken,
      endpoints: {
        api = 'https://api.dingshao.com',
        auth = 'https://www.dingshao.com',
      } = {},
    } = {
      ...this.globalRaw,
      ...this.localRaw,
    };

    this.accessToken = accessToken;

    this.endpoints = {
      api,
      auth,
    };
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    this.localRaw.accessToken = accessToken;

    FS.writeFileSync(
      this.localConfigPath,
      `${JSON.stringify(this.localRaw, undefined, 2)}\n`,
    );
  }
}
