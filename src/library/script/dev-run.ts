import {devLog} from './@utils';
import {Script} from './script';

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
  // await script(
  //   JSON.stringify({
  //     payload: JSON.stringify({
  //       payload,
  //       dryRun,
  //       token: 'dev',
  //       baseURL: undefined,
  //     }),
  //   }),
  //   {
  //     requestId: 'dev',
  //   },
  //   devLog,
  // );
}
