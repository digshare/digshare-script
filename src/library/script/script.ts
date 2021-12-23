import {DevScriptAPI, PublishMessageOptions, ScriptAPI} from './api';
import {ScriptContext} from './context';
import {ScriptStorage} from './storage';

export type Script<TStorage extends object, TPayload> = (
  payload: TPayload,
  context: ScriptContext<TStorage>,
) => any;

// export function script<TStorage extends object, TPayload = any>(
//   handler: (
//     payload: TPayload,
//     context: ScriptContext<TStorage>,
//   ) => Promise<PublishMessageOptions | void>,
// ): Script<TStorage, TPayload>;
// export function script<TStorage extends object, TPayload = any>(
//   handler: (
//     payload: TPayload,
//     context: ScriptContext<TStorage>,
//   ) => Promise<PublishMessageOptions | void>,
// ): AliyunFunction<TStorage> {
//   return async (event, {requestId}, callback, devData) => {
//     let {payload: eventPayloadJSON} = JSON.parse(event.toString('utf8'));

//     let {payload, token, dryRun, baseURL} = JSON.parse(eventPayloadJSON);

//     if (!baseURL && !devData) {
//       return callback(null, {
//         error: 'BaseURL is required',
//       });
//     }

//     let api = devData
//       ? new DevScriptAPI<TStorage>(devData)
//       : new ScriptAPI<TStorage>(baseURL, token);

//     let storage = new ScriptStorage(await api.getStorage());

//     let context: ScriptContext<TStorage> = {
//       dryRun,
//       requestId,
//       token,
//       apiBaseURL: baseURL,
//       api,
//       storage,
//     };

//     try {
//       let succeed = 0;
//       let failed = 0;

//       let promises = [];
//       let dryRunResult = [];

//       let creation = await handler(payload, context);

//       if (typeof creation === 'object') {
//         if (dryRun) {
//           dryRunResult.push(creation);
//         } else {
//           promises.push(
//             api.publishMessage(creation).then(
//               () => (succeed += 1),
//               error => {
//                 console.error(
//                   'Message publish failed:',
//                   JSON.stringify(creation, undefined, 2),
//                   error,
//                 );

//                 failed += 1;
//               },
//             ),
//           );
//         }
//       }

//       if (dryRun) {
//         return callback(null, {
//           creations: dryRunResult,
//           storage: storage.raw,
//         });
//       } else {
//         await Promise.all(promises);

//         if (storage.changed) {
//           await api.updateStorage(storage.raw);
//         }

//         // eslint-disable-next-line no-console
//         console.log({succeed, failed});

//         return callback(null, {
//           succeed,
//           failed,
//         });
//       }
//     } catch (error: any) {
//       console.error(error);

//       return callback(null, {
//         error: error.message,
//       });
//     }
//   };
// }
