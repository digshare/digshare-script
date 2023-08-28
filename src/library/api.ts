import {ReadableStream} from 'stream/web';
import {setTimeout} from 'timers/promises';

import type {Response} from 'undici';

const MAX_ATTEMPTS = 3;
const ATTEMPT_INTERVAL = 1000;

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
    return this.attemptToCall(path, params, file);
  }

  private async attemptToCall<TReturn extends object>(
    path: string,
    params: object,
    file: ArrayBuffer | Blob | ReadableStream | undefined,
    attempt = 1,
  ): Promise<TReturn> {
    try {
      return await this.sendCall(path, params, file);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || error instanceof APIError) {
        throw error;
      }

      console.error(error);
      console.error('请求失败，即将重试。');

      await setTimeout(ATTEMPT_INTERVAL);

      return this.attemptToCall(path, params, file, attempt + 1);
    }
  }

  private async sendCall<TReturn extends object>(
    path: string,
    params: object,
    file: ArrayBuffer | Blob | ReadableStream | undefined,
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
      throw new StatusError(status, `状态码错误: ${status}`);
    }

    const ret = (await response.json()) as
      | {error: {code: string; message: string}}
      | {value: TReturn};

    if ('error' in ret) {
      const {
        error: {code, message},
      } = ret;
      throw new APIError(code, `${code}: ${message}`);
    } else {
      const {value} = ret;

      return value;
    }
  }
}

export class StatusError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class APIError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
