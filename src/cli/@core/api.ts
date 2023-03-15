import {fetch} from 'undici';

import type {Config} from './config';

export class API {
  constructor(readonly config: Config) {}

  async call<TReturn extends object>(
    path: string,
    params: object,
  ): Promise<TReturn> {
    const {
      config: {
        accessToken,
        endpoints: {api: endpoint},
      },
    } = this;

    const url = `${endpoint}${path}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(accessToken && {'x-access-token': accessToken}),
      },
      body: JSON.stringify(params),
    });

    const {status} = response;

    if (status !== 200) {
      throw new Error(`状态码错误: ${status}`);
    }

    const ret = (await response.json()) as
      | {error: {code: string; message: string}}
      | {value: TReturn};

    if ('error' in ret) {
      const {
        error: {code, message},
      } = ret;
      throw new Error(`${code}: ${message}`);
    } else {
      const {value} = ret;
      return value;
    }
  }
}
