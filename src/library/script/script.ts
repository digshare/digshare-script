import {PublishMessageOptions} from './api';
import {ScriptContext} from './context';

export type Script<TStorage extends object, TPayload> = (
  payload: TPayload,
  context: ScriptContext<TStorage>,
) =>
  | Promise<PublishMessageOptions | void>
  | AsyncGenerator<PublishMessageOptions, void>;
