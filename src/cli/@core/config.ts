import * as FS from 'fs';

export type GlobalConfigRaw = {
  endpoints?: {
    api?: string;
    auth?: string;
  };
};

export type LocalConfigRaw = {
  accessToken?: string;
} & GlobalConfigRaw;

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
    readonly localConfigPath: string | undefined,
  ) {
    try {
      this.globalRaw = JSON.parse(FS.readFileSync(globalConfigPath, 'utf8'));
    } catch {
      this.globalRaw = {};
    }

    try {
      this.localRaw =
        localConfigPath === undefined
          ? {}
          : JSON.parse(FS.readFileSync(localConfigPath, 'utf8'));
    } catch (error) {
      this.localRaw = {};
    }

    const {
      accessToken,
      endpoints: {
        api = 'https://api.dingshao.cn',
        auth = 'https://www.dingshao.cn',
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

  setAccessToken(accessToken: string | undefined): void {
    this.accessToken = accessToken;
    this.localRaw.accessToken = accessToken;

    if (this.localConfigPath !== undefined) {
      FS.writeFileSync(
        this.localConfigPath,
        `${JSON.stringify(this.localRaw, undefined, 2)}\n`,
      );
    }
  }
}
