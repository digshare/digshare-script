import {serialize} from 'bson';
import fetch from 'node-fetch';

import {devLog} from '../@utils';

import {PublishMessageOptions} from './api.doc';

export interface IScriptAPI<TData extends object = object> {
  getStorage(): Promise<Partial<TData>>;
  updateStorage(data: Partial<TData>): Promise<void>;
  publishMessage(options: PublishMessageOptions): Promise<void>;
}

export class ScriptAPI<TData extends object> implements IScriptAPI<TData> {
  constructor(private baseURL: string, private token: string) {}

  async getStorage(): Promise<Partial<TData>> {
    let {storage} = Object(await this.call('/channel-script/get-storage', {}));

    return storage;
  }

  async updateStorage(storage: Partial<TData>): Promise<void> {
    await this.call('/channel-script/set-storage', {
      storage,
    });
  }

  async publishMessage(params: PublishMessageOptions): Promise<void> {
    await this.call('/channel/publish-message', serialize(params), {
      'content-type': 'application/bson',
    });
  }

  private call<T>(path: string, data: any, headers?: any): Promise<T> {
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
      // magic number
      timeout: 6000,
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
