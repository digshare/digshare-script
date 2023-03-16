import {API} from './api';

export interface ScriptMessage {
  title?: string;
  content: string;
}

export interface ScriptUpdate<TState> {
  message?: ScriptMessage | string;
  state?: TState;
}

export type ScriptProgram<TState> = (
  state: TState | undefined,
) =>
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

    if (updates instanceof Promise) {
      const update = await updates;

      if (update) {
        await this.update(update);
      }
    } else if ((updates as any)[Symbol.toStringTag] === 'AsyncGenerator') {
      for await (const update of updates) {
        await this.update(update);
      }
    } else {
      throw new Error('无效的脚本返回值');
    }
  }

  private async update({message, state}: ScriptUpdate<TState>): Promise<void> {
    const {api, dryRun} = this;

    if (!api) {
      throw new Error('API 未配置');
    }

    if (message) {
      if (typeof message === 'string') {
        message = {content: message};
      }

      console.info('发布消息', message);
    }

    if (state !== undefined) {
      console.info('更新状态', state);
    }

    if (dryRun) {
      return;
    }

    if (message || state !== undefined) {
      await api.call('/v2/channel/script-update', {message, state});
    }
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
