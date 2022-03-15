import {devLog} from './@utils';
import {DevScriptAPI} from './api';
import {Script} from './script';
import {ScriptStorage} from './storage';

export type DevRunOptions<TPayload, TStorage extends object> = {
  dryRun?: boolean;
} & (object extends TStorage ? {storage?: TStorage} : {storage: TStorage}) &
  (undefined extends TPayload ? {payload?: TPayload} : {payload: TPayload});

export async function devRun<TPayload, TStorage extends object>(
  script: Script<TPayload, TStorage>,
  ...args: DevRunOptions<TPayload, TStorage> extends infer TOptions
    ? object extends TOptions
      ? [options?: TOptions]
      : [options: TOptions]
    : never
): Promise<void>;
export async function devRun(
  script: Script<unknown, object>,
  {storage = {}, payload, dryRun = false}: DevRunOptions<unknown, object> = {},
): Promise<void> {
  let done = devLog;

  try {
    let api = new DevScriptAPI(storage);
    let storageObject = new ScriptStorage(await api.getStorage());

    let context = {
      dryRun,
      requestId: 'dev',
      token: 'dev',
      api,
      storage: storageObject,
    };

    let creations = [];

    for await (let creation of (isGeneratorFunction(script)
      ? script(payload, context)
      : // 类型太难写了
        [script(payload, context)]) as any) {
      if (typeof creation === 'object') {
        if (dryRun) {
          creations.push(creation);
        } else {
          await api.publishMessage(creation);
        }
      }
    }

    if (dryRun) {
      return done({
        creations,
        storage: storageObject.raw,
      });
    }

    if (storageObject.changed) {
      await api.updateStorage(storageObject.raw);
    }

    return done({});
  } catch (error: any) {
    console.error(error);

    return done({
      error: error.message,
    });
  }
}

// eslint-disable-next-line @mufan/explicit-return-type
function isGeneratorFunction(fn: Script<unknown, object>) {
  let fnConstructor = Object.getPrototypeOf(fn).constructor;

  return (
    fnConstructor === Object.getPrototypeOf(function* () {}).constructor ||
    fnConstructor === Object.getPrototypeOf(async function* () {}).constructor
  );
}