import {serialize} from 'bson';
import fetch from 'node-fetch';

import {devLog} from '../@utils';
import {ScriptStorage} from '../storage';

import {PublishMessageParams, Subscriber} from './api.doc';

export type IStore = Record<string, any>;

export interface IScriptAPI<TStore extends IStore = IStore> {
  getStorage(): Promise<ScriptStorage<TStore>>;
  saveStorage(storage: ScriptStorage<TStore>): Promise<void>;
  publishMessage(params: PublishMessageParams): Promise<void>;

  getSubscribers(params: {
    after: string | undefined;
    limit: number;
  }): Promise<Subscriber[]>;

  getSubscribersIterator(pageSize?: number): AsyncGenerator<Subscriber>;
}

export class ScriptAPI<TStore extends IStore> implements IScriptAPI<TStore> {
  constructor(private baseURL: string, private token: string) {}

  async getStorage(): Promise<ScriptStorage<TStore>> {
    let {storage} = Object(await this.call('/channel-script/get-storage', {}));

    return new ScriptStorage(storage);
  }

  async saveStorage(storage: ScriptStorage<TStore>): Promise<void> {
    if (!storage.changed) {
      return;
    }

    await this.call('/channel-script/set-storage', {
      storage: storage.raw,
    });
  }

  async publishMessage(params: PublishMessageParams): Promise<void> {
    await this.call('/channel/publish-message', serialize(params), {
      'content-type': 'application/bson',
    });
  }

  async getSubscribers({
    after,
    limit,
  }: {
    after: string | undefined;
    limit: number;
  }): Promise<Subscriber[]> {
    return this.call('/channel/get-subscribers', {
      after,
      limit,
    });
  }

  async *getSubscribersIterator(pageSize = 200): AsyncGenerator<Subscriber> {
    let items: Subscriber[] = [];
    let afterUser: string | undefined;
    // 'none' | 'requesting' | 'done';
    let status = 'none';
    let requestPromise = Promise.resolve(fetchList());

    while (items.length || status !== 'done') {
      if (!items.length) {
        await requestPromise;
        continue;
      }

      if (items.length <= pageSize / 2 && status === 'none') {
        requestPromise = fetchList();
      }

      yield items.shift()!;
    }

    let api = this;

    async function fetchList(): Promise<void> {
      status = 'requesting';

      return api
        .getSubscribers({
          after: afterUser,
          limit: pageSize,
        })
        .then(nextItems => {
          if (!nextItems.length) {
            status = 'done';
          } else {
            items.push(...nextItems);
            status = 'none';
            afterUser = nextItems[nextItems.length - 1].id;
          }
        });
    }
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

export class DevScriptAPI<TStore extends IStore> implements IScriptAPI<TStore> {
  constructor(private storage: TStore) {}

  async getStorage(): Promise<ScriptStorage<TStore>> {
    return new ScriptStorage(this.storage);
  }

  async saveStorage<TStore>(storage: ScriptStorage<TStore>): Promise<void> {
    devLog('saveStorage', storage);
  }

  async publishMessage(params: PublishMessageParams): Promise<void> {
    devLog('publishMessage', params);
  }

  async getSubscribers({
    after,
    limit,
  }: {
    after: string | undefined;
    limit: number;
  }): Promise<Subscriber[]> {
    devLog('getSubscribers', {
      after,
      limit,
    });
    return [];
  }

  async *getSubscribersIterator(pageSize = 200): AsyncGenerator<Subscriber> {
    devLog('getSubscribers', {
      pageSize,
    });
  }
}
