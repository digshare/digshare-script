import type {ScriptUpdateMessage} from '@digshare/script/x';

import {API} from './api';

export interface ScriptUpdate<TState> {
  message?: ScriptUpdateMessage | string;
  state?: TState;
}

export type ScriptProgram<TState> = (
  state: TState | undefined,
) =>
  | ScriptUpdate<TState>
  | void
  | Promise<ScriptUpdate<TState> | void>
  | AsyncGenerator<ScriptUpdate<TState>, void>;

export class Script<TState> {
  private api: API | undefined;

  private dryRun = false;

  constructor(readonly program: ScriptProgram<TState>) {}

  async configure({
    endpoint,
    accessToken,
    dryRun,
  }: ScriptConfigureOptions): Promise<void> {
    this.api = new API(endpoint, accessToken);
    this.dryRun = dryRun;
  }

  async run({state}: ScriptRunOptions<TState>): Promise<TState | void> {
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
      } else if (isObjectAsyncGenerator(updates)) {
        for await (const update of updates as AsyncGenerator<
          ScriptUpdate<TState>,
          void
        >) {
          await this.update(update);
        }
      } else {
        await this.update(updates);
      }
    } else {
      throw new Error('无效的脚本返回值');
    }
  }

  private async update({
    message: updateMessage,
    state,
  }: ScriptUpdate<TState>): Promise<void> {
    const {api, dryRun} = this;

    if (!api) {
      throw new Error('API 未配置');
    }

    if (typeof updateMessage === 'string') {
      updateMessage = {content: updateMessage};
    }

    if (updateMessage) {
      console.info('发布消息', updateMessage);
    }

    if (state !== undefined) {
      console.info('更新状态', state);
    }

    if (dryRun) {
      return;
    }

    if (!updateMessage && state === undefined) {
      return;
    }

    let message: ScriptMessage | undefined;

    if (updateMessage) {
      const {title, content, images} = updateMessage;

      let imageURLs: string[] | undefined;

      if (images) {
        imageURLs = [];

        for (let image of images) {
          if (typeof image === 'string') {
            console.info('下载图片', image);

            const response = await fetch(image);

            if (!response.ok) {
              throw new Error('图片下载失败');
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
        title,
        content,
        images: imageURLs,
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
  title: string | undefined;
  content: string;
  images: string[] | undefined;
}

function isObjectAsyncGenerator(object: object): object is AsyncGenerator {
  return (object as any)[Symbol.toStringTag] === 'AsyncGenerator';
}
