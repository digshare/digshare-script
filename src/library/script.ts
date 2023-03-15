import {API} from './api';

export interface ScriptMessage<TState> {
  title?: string;
  content: string;
  state?: TState;
}

export type ScriptProgram<TState> = (
  state: TState | undefined,
) =>
  | Promise<ScriptMessage<TState> | void>
  | AsyncGenerator<ScriptMessage<TState>, void>;

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

  async run({state}: ScriptRunOptions<TState>): Promise<void> {
    const {program} = this;

    const messages = program(state);

    if (!messages) {
      return;
    }

    if (messages instanceof Promise) {
      const message = await messages;

      if (message) {
        await this.publishMessage(message);
      }
    } else if ((messages as any)[Symbol.toStringTag] === 'AsyncGenerator') {
      for await (const message of messages) {
        await this.publishMessage(message);
      }
    } else {
      throw new Error('无效的脚本返回值');
    }
  }

  private async publishMessage(message: ScriptMessage<TState>): Promise<void> {
    const {api, dryRun} = this;

    if (!api) {
      throw new Error('API 未配置');
    }

    console.info('发布消息', message);

    if (dryRun) {
      return;
    }

    await api.call('/v2/channel/publish-message', message);
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
