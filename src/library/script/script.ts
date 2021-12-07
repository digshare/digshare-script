import {DevScriptAPI, IStore, ScriptAPI} from './api';
import {ScriptContext} from './context';

export type FC<TStore> = (
  event: Buffer | string,
  ctx: {
    requestId: string;
  },
  callback: (error: null, result: any) => void,
  dev?: TStore,
) => Promise<any>;

export function script<TStore extends IStore, TPayload = any>(
  handler: (payload: TPayload, context: ScriptContext<TStore>) => Promise<any>,
  defaultBaseURL?: string,
): FC<TStore> {
  return async (event, {requestId}, callback, dev) => {
    let {payload: payloadJSONString} = JSON.parse(event.toString('utf-8'));

    let {payload, token, dryRun, baseURL} = JSON.parse(payloadJSONString);

    baseURL = baseURL || defaultBaseURL || process.env.DIGSHARE_API;

    if (!baseURL && !dev) {
      return callback(null, {
        error: 'BaseURL is required',
      });
    }

    let api = dev
      ? new DevScriptAPI<TStore>(dev)
      : new ScriptAPI<TStore>(baseURL, token);

    let context: ScriptContext<TStore> = {
      dryRun,
      requestId,
      token,
      baseURL,
      api,
    };

    try {
      let result = await handler(payload, context);
      callback(null, result);
    } catch (error: any) {
      console.error(error);

      return callback(null, {
        error: error.message,
      });
    }
  };
}
