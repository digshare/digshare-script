import {randomUUID} from 'crypto';
import {isGeneratorObject} from 'util/types';

import type {ScriptUpdateMessage} from '@digshare/script/x';

import {API} from './api';

export interface ScriptResponse {
  headers?: Record<string, string>;
  body?: string;
}

export interface ScriptUpdate<TState> {
  message?: ScriptUpdateMessage | string;
  state?: TState;
  response?: ScriptResponse | string;
}

export type ScriptProgram<TState> = (
  state: TState | undefined,
) =>
  | ScriptUpdate<TState>
  | void
  | Promise<ScriptUpdate<TState> | void>
  | Generator<ScriptUpdate<TState>, ScriptUpdate<TState> | void, void>
  | AsyncGenerator<ScriptUpdate<TState>, ScriptUpdate<TState> | void, void>;

export class Script<TState> {
  private api: API | undefined;

  private dryRun = false;

  private response: ScriptResponse | undefined;

  constructor(readonly program: ScriptProgram<TState>) {}

  async configure({
    endpoint,
    accessToken,
    dryRun,
  }: ScriptConfigureOptions): Promise<void> {
    this.api = new API(endpoint, accessToken);
    this.dryRun = dryRun;
  }

  async run({state}: ScriptRunOptions<TState>): Promise<ScriptResponse | void> {
    const {program} = this;

    const updates = program(state);

    if (!updates) {
      return;
    }

    if (typeof updates === 'object') {
      if (updates instanceof Promise) {
        const update = await updates;

        if (update) {
          await this.update(update);
        }
      } else if (
        (
          isGeneratorObject as (
            object: unknown,
          ) => object is Generator | AsyncGenerator
        )(updates)
      ) {
        let result: IteratorResult<
          ScriptUpdate<TState>,
          ScriptUpdate<TState> | void
        >;

        // eslint-disable-next-line no-cond-assign
        while ((result = await updates.next())) {
          const {value: update, done} = result;

          if (update) {
            await this.update(update);
          }

          if (done) {
            break;
          }
        }
      } else {
        await this.update(updates);
      }
    } else {
      throw new Error('无效的脚本返回值');
    }

    return this.response;
  }

  private async update({
    message: updateMessage,
    state,
    response,
  }: ScriptUpdate<TState>): Promise<void> {
    const {api, dryRun} = this;

    if (!api) {
      throw new Error('API 未配置');
    }

    if (typeof updateMessage === 'string') {
      updateMessage = {content: updateMessage};
    }

    if (typeof response === 'string') {
      response = {body: response};
    }

    if (updateMessage) {
      console.info('发布消息', updateMessage);
    }

    if (state !== undefined) {
      console.info('更新状态', state);
    }

    if (response) {
      console.info('设置响应', response);
      this.response = response;
    }

    if (dryRun) {
      return;
    }

    if (!updateMessage && state === undefined) {
      return;
    }

    let message: ScriptMessage | undefined;

    if (updateMessage) {
      const {tags, title, content, images} = updateMessage;

      let imageURLs: string[] | undefined;

      if (images) {
        imageURLs = [];

        for (let image of images) {
          if (typeof image === 'string') {
            console.info('请求图片', image);

            const response = await fetch(image);

            if (!response.ok) {
              throw new Error('图片请求失败');
            }

            const type = response.headers.get('content-type');

            if (!type || !type.startsWith('image/')) {
              throw new Error('无效的图片类型');
            }

            image = response.body!;
          }

          const {url} = await api.call<{url: string}>(
            '/v2/channel/upload-content-image',
            {},
            image,
          );

          imageURLs.push(url);
        }
      }

      message = {
        tags,
        title,
        content,
        images: imageURLs,
        clientId: randomUUID(),
      };
    }

    await api.call('/v2/channel/script-update', {
      message,
      state,
    });
  }
}

export interface ScriptConfigureOptions {
  endpoint: string;
  accessToken: string;
  dryRun: boolean;
}

export interface ScriptRunOptions<TState> {
  state: TState | undefined;
}

export function script<TState>(program: ScriptProgram<TState>): Script<TState> {
  return new Script(program);
}

export interface ScriptMessage {
  tags: string[] | undefined;
  title: string | undefined;
  content: string;
  images: string[] | undefined;
  clientId: string;
}
