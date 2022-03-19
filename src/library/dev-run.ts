import {devLog} from './@utils';
import {DevScriptAPI} from './api';
import {Script} from './script';
import {ScriptStorage} from './storage';

export type DevRunOptions<TPayload, TStorage extends object> = {
  dryRun?: boolean;
  storage?: Partial<TStorage>;
  /**
   * 是否在执行完成后退出进程，默认 `true`。
   */
  exit?: boolean;
} & (undefined extends TPayload ? {payload?: TPayload} : {payload: TPayload});

export async function devRun<TPayload, TStorage extends object>(
  script: Script<TPayload, TStorage>,
  ...args: undefined extends TPayload
    ? [options?: DevRunOptions<TPayload, TStorage>]
    : [options: DevRunOptions<TPayload, TStorage>]
): Promise<void>;
export async function devRun(
  script: Script<unknown, object>,
  {
    storage = {},
    payload,
    dryRun = false,
    exit = true,
  }: DevRunOptions<unknown, object> = {},
): Promise<void> {
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
      devLog({
        creations,
        storage: storageObject.raw,
      });
    } else {
      if (storageObject.changed) {
        await api.updateStorage(storageObject.raw);
      }

      devLog({});
    }

    if (exit) {
      process.exit(0);
    }
  } catch (error: any) {
    console.error(error);

    devLog({
      error: error.message,
    });

    if (exit) {
      process.exit(1);
    }
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
