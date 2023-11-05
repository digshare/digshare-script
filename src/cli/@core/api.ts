import type {Config} from './config.js';

function POLL_INTERVAL(attempts: number): number {
  if (attempts < 60) {
    return 2000;
  } else if (attempts < 120) {
    return 5000;
  } else {
    return 10000;
  }
}

export class API {
  constructor(readonly config: Config) {}

  async call<TReturn extends object>(
    path: string | URL,
    params: object,
  ): Promise<TReturn> {
    const {
      config: {
        accessToken,
        endpoints: {api: endpoint},
      },
    } = this;

    const url = typeof path === 'string' ? new URL(path, endpoint) : path;

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

  async *poll<TReturn extends object>(
    path: string | URL,
    params: object,
  ): AsyncIterableIterator<TReturn> {
    let lastResponse: object | undefined;
    let attemptsWithoutChange = 0;

    while (true) {
      await new Promise(resolve =>
        setTimeout(resolve, POLL_INTERVAL(attemptsWithoutChange++)),
      );

      const response = await this.call<TReturn>(path, params);

      if (
        lastResponse &&
        JSON.stringify(response) === JSON.stringify(lastResponse)
      ) {
        continue;
      }

      attemptsWithoutChange = 0;
      lastResponse = response;

      yield response;
    }
  }
}
