import fetch from 'node-fetch';

import {ScriptStorage} from '../storage';

import {ImageExcerpt, PublishMessageParams, Subscriber} from './api.doc';

export class ScriptAPI {
  constructor(private baseURL: string, private token: string) {}

  async getStorage<TStore>(): Promise<ScriptStorage<TStore>> {
    let {storage} = Object(await this.call('/channel-script/get-storage', {}));

    return new ScriptStorage(storage);
  }

  async saveStorage<TStore>(storage: ScriptStorage<TStore>): Promise<void> {
    await this.call('/channel-script/set-storage', {
      storage: storage.raw,
    });
  }

  async publishMessage(params: PublishMessageParams): Promise<void> {
    await this.call('/channel/publish-message', params);
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

  async uploadImage(
    image: string | Buffer | ArrayBuffer,
  ): Promise<ImageExcerpt> {
    if (typeof image === 'string') {
      image = await fetch(image).then(res => res.arrayBuffer());
    }

    return this.upload('/channel/upload-content-image', image as ArrayBuffer);
  }

  private call<T>(path: string, data: unknown): Promise<T> {
    return fetch(`${this.baseURL}${path}`, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json',
        authorization: this.token,
      },
      // magic number
      timeout: 4000,
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          throw Error(JSON.stringify(json.error, undefined, 2));
        }

        return json.value;
      });
  }

  private upload<T>(path: string, file: Buffer | ArrayBuffer): Promise<T> {
    return fetch(`${this.baseURL}${path}`, {
      method: 'post',
      body: file,
      headers: {
        authorization: this.token,
      },
      // magic number
      timeout: 8000,
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
