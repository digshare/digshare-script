import {serialize} from 'bson';
import fetch from 'node-fetch';

import {devLog} from './@utils';

export interface PublishMessageOptions {
  content: string;
  open?: boolean;
  images?: Buffer[];
  links?: string[];
  clientId?: string;
}

export interface IScriptAPI<TData extends object = object> {
  baseURL: string;
  getStorage(): Promise<Partial<TData>>;
  updateStorage(data: Partial<TData>): Promise<void>;
  publishMessage(options: PublishMessageOptions): Promise<void>;
}

export interface ScriptAPIOptions {
  baseURL?: string;
  timeout?: number;
}

export class ScriptAPI<TData extends object> implements IScriptAPI<TData> {
  get baseURL(): string {
    return this.options.baseURL ?? 'https://api.dingshao.cn/v1';
  }

  constructor(private token: string, private options: ScriptAPIOptions = {}) {}

  async getStorage(): Promise<Partial<TData>> {
    let {storage} = Object(await this.call('/channel-script/get-storage', {}));

    return storage ?? {};
  }

  async updateStorage(storage: Partial<TData>): Promise<void> {
    await this.call('/channel-script/update-storage', {
      storage,
    });
  }

  async publishMessage(params: PublishMessageOptions): Promise<void> {
    await this.call('/channel/publish-message', serialize(params), {
      'content-type': 'application/bson',
    });
  }

  private call<T>(path: string, data: any, headers?: any): Promise<T> {
    let {timeout} = this.options;

    headers = {
      'content-type': 'application/json',
      authorization: this.token,
      ...headers,
    };

    return fetch(`${this.baseURL}${path}`, {
      method: 'post',
      body:
        headers?.['content-type'] === 'application/json'
          ? JSON.stringify(data)
          : data,
      headers,
      timeout,
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          throw Error(JSON.stringify(json.error, undefined, 2));
        }

        return json.value;
      });
  }
}

export class DevScriptAPI<TData extends object> implements IScriptAPI<TData> {
  baseURL = 'http://dingshare.dev';

  constructor(private storage: TData) {}

  async getStorage(): Promise<TData> {
    return this.storage;
  }

  async updateStorage<TStore>(storage: TStore): Promise<void> {
    devLog('updateStorage', storage);
  }

  async publishMessage(params: PublishMessageOptions): Promise<void> {
    devLog('publishMessage', params);
  }
}
