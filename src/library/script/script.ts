import {ScriptAPI} from './api';
import {ScriptContext} from './context';

export function Script<TPayload>(
  handler: (payload: TPayload, context: ScriptContext) => Promise<any>,
  baseURL = process.env.DIGSHARE_API,
): (...args: any) => any {
  if (!baseURL) {
    throw Error('BaseURL is required');
  }

  return async (event, {requestId}, callback) => {
    let {payload: payloadJSONString} = JSON.parse(event.toString('utf-8'));

    let {payload, token, dryRun} = JSON.parse(payloadJSONString);

    let api = new ScriptAPI(baseURL, token);

    let context: ScriptContext = {
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
      return callback(null, {error: error.message});
    }
  };
}
