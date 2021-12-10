import {DevScriptAPI, IStore, PublishMessageParams, ScriptAPI} from './api';
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
  handler: (
    payload: TPayload,
    context: ScriptContext<TStore>,
  ) => Promise<PublishMessageParams | void>,
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

    let storage = await api.getStorage();

    let context: ScriptContext<TStore> = {
      dryRun,
      requestId,
      token,
      baseURL,
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
            api
              .publishMessage({
                ...creation,
                requestId,
              })
              .then(
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

      // TODO (boen): 暂不开放, 只支持所有接收者
      // for await (let creation of isGeneratorFunction(fn)
      //   ? fn(payload, context)
      //   : [fn(payload, context)]) {
      //   if (typeof creation === 'object') {
      //     if (dryRun) {
      //       dryRunResult.push(creation);
      //     } else {
      //       promises.push(
      //         request('/channel/publish-message', creation).then(
      //           () => (succeed += 1),
      //           error => {
      //             console.error(
      //               'Message publish failed:',
      //               JSON.stringify(creation, undefined, 2),
      //               error,
      //             );
      //             failed += 1;
      //           },
      //         ),
      //       );
      //     }
      //   }
      // }

      if (dryRun) {
        return callback(null, {
          creations: dryRunResult,
          storage: storage.raw,
        });
      } else {
        await Promise.all(promises);

        await api.saveStorage(storage);

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

// function isGeneratorFunction(fn) {
//   let fnConstructor = Object.getPrototypeOf(fn).constructor;

//   return (
//     fnConstructor === Object.getPrototypeOf(function* () {}).constructor ||
//     fnConstructor === Object.getPrototypeOf(async function* () {}).constructor
//   );
// }
