import {ReadableStream} from 'stream/web';

import type {Response} from 'undici';

export class API {
  constructor(
    readonly endpoint: string,
    readonly accessToken: string,
  ) {}

  async call<TReturn extends object>(
    path: string,
    params: object,
    file?: ArrayBuffer | Blob | ReadableStream,
  ): Promise<TReturn> {
    const {endpoint, accessToken} = this;

    const url = `${endpoint}${path}`;

    const accessTokenHeaderField = accessToken && {
      'x-access-token': accessToken,
    };

    let response: Response;

    if (file) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
          'x-body': JSON.stringify(params),
          ...accessTokenHeaderField,
        },
        body: file,
        duplex: file instanceof ReadableStream ? 'half' : undefined,
      });
    } else {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...accessTokenHeaderField,
        },
        body: JSON.stringify(params),
      });
    }

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
