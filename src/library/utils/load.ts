import type {ReadableStream} from 'stream/web';
import {setTimeout} from 'timers/promises';

const ATTEMPTS_DEFAULT = 3;
const ATTEMPT_INTERVAL_DEFAULT = 1000;

export type LoadOptions = {
  /**
   * 尝试次数，默认为 3。
   */
  attempts?: number;
  /**
   * 尝试间隔（毫秒），默认为 1000。
   */
  attemptInterval?: number;
} & RequestInit;

export type LoadType = 'text' | 'json' | 'blob' | 'arrayBuffer';

/**
 * 加载资源，默认失败时重试。
 */
export async function load(
  input: NodeJS.fetch.RequestInfo,
  options?: LoadOptions,
): Promise<ReadableStream>;
export async function load<TType extends LoadType>(
  input: NodeJS.fetch.RequestInfo,
  type: TType,
  options?: LoadOptions,
): Promise<Awaited<ReturnType<Response[TType]>>>;
export async function load(
  input: NodeJS.fetch.RequestInfo,
  ...args: [options?: LoadOptions] | [type: LoadType, options?: LoadOptions]
): Promise<unknown> {
  const [type, options] =
    typeof args[0] === 'string' ? args : [undefined, ...args];

  const {
    attempts = ATTEMPTS_DEFAULT,
    attemptInterval = ATTEMPT_INTERVAL_DEFAULT,
    ...init
  } = options ?? {};

  return load_(0);

  async function load_(attempt: number): Promise<unknown> {
    try {
      const response = await fetch(input, init);

      if (response.status >= 500) {
        throw new Error(`${response.statusText} (${response.status})`);
      }

      if (type) {
        return await response[type]();
      } else {
        return response.body;
      }
    } catch (error) {
      const nextAttempt = attempt + 1;

      if (nextAttempt >= attempts) {
        throw error;
      }

      console.error(`加载失败，将在 ${attemptInterval} 毫秒后重试。`);
      console.error(String(error));

      await setTimeout(attemptInterval);

      return load_(nextAttempt);
    }
  }
}
