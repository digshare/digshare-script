import {ScriptContext} from './context';

export interface ScriptMessage {
  /**
   * 消息内容。
   */
  content: string;
  /**
   * 是否为公开消息？当前仅对收费频道有效。
   */
  open?: boolean;
  /**
   * 消息图片数组。
   */
  images?: Buffer[];
  /**
   * 消息链接，可以是 URL 或对象的数组。
   */
  links?: (
    | string
    | {
        url: string;
        description?: string;
      }
  )[];
  tags?: string[] | undefined;
}

export type Script<TStorage extends object, TPayload> = (
  payload: TPayload,
  context: ScriptContext<TStorage>,
) => Promise<ScriptMessage | void> | AsyncGenerator<ScriptMessage, void>;
