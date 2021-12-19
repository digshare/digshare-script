import {DevScriptAPI, PublishMessageOptions, ScriptAPI} from './api';
import {ScriptContext} from './context';
import {ScriptStorage} from './storage';

export type FC<TStore> = (
  event: Buffer | string,
  ctx: {
    requestId: string;
  },
  callback: (error: null, result: any) => void,
  dev?: TStore,
) => Promise<any>;

export function script<TData extends object, TPayload = any>(
  handler: (
    payload: TPayload,
    context: ScriptContext<TData>,
  ) => Promise<PublishMessageOptions | void>,
  defaultBaseURL?: string,
): FC<TData> {
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
      ? new DevScriptAPI<TData>(dev)
      : new ScriptAPI<TData>(baseURL, token);

    let storage = new ScriptStorage(await api.getStorage());

    let context: ScriptContext<TData> = {
      dryRun,
      requestId,
      token,
      apiBaseURL: baseURL,
      api,
      storage,
    };

    try {
      let succeed = 0;
      let failed = 0;

      let promises = [];
      let dryRunResult = [];

      let creation = await handler(payload, context);

      if (typeof creation === 'object') {
        if (dryRun) {
          dryRunResult.push(creation);
        } else {
          promises.push(
            api.publishMessage(creation).then(
              () => (succeed += 1),
              error => {
                console.error(
                  'Message publish failed:',
                  JSON.stringify(creation, undefined, 2),
                  error,
                );

                failed += 1;
              },
            ),
          );
        }
      }

      if (dryRun) {
        return callback(null, {
          creations: dryRunResult,
          storage: storage.raw,
        });
      } else {
        await Promise.all(promises);

        if (storage.changed) {
          await api.updateStorage(storage.raw);
        }

        // eslint-disable-next-line no-console
        console.log({succeed, failed});

        return callback(null, {
          succeed,
          failed,
        });
      }
    } catch (error: any) {
      console.error(error);

      return callback(null, {
        error: error.message,
      });
    }
  };
}
