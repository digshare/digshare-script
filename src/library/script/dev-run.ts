import {devLog} from './@utils';
import {DevScriptAPI} from './api';
import {Script} from './script';
import {ScriptStorage} from './storage';

export type DevRunOptions<TStorage extends object, TPayload> = {
  dryRun?: boolean;
} & (object extends TStorage ? {storage?: TStorage} : {storage: TStorage}) &
  (undefined extends TPayload ? {payload?: TPayload} : {payload: TPayload});

export async function devRun<TStorage extends object, TPayload>(
  script: Script<TStorage, TPayload>,
  ...args: DevRunOptions<TStorage, TPayload> extends infer TOptions
    ? object extends TOptions
      ? [options?: TOptions]
      : [options: TOptions]
    : never
): Promise<void>;
export async function devRun(
  script: Script<object, unknown>,
  {storage = {}, payload, dryRun = false}: DevRunOptions<object, unknown> = {},
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

    let creation = await script(payload, context);

    if (dryRun) {
      return done({
        creation,
        storage: storageObject.raw,
      });
    }

    if (creation) {
      await api.publishMessage(creation);
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
