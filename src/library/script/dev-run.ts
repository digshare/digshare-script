import {devLog} from './@utils';
import {FC} from './script';

export function devRun<TStore extends object>(
  expression: any,
  devStore: TStore,
  fn: FC<TStore>,
  {
    payload = {},
    dryRun = false,
  }: {
    payload?: any;
    dryRun?: boolean;
  } = {},
): void {
  if (!expression) {
    return;
  }

  fn(
    JSON.stringify({
      payload: JSON.stringify({
        payload,
        dryRun,
        token: 'dev',
        baseURL: undefined,
      }),
    }),
    {
      requestId: 'dev',
    },
    devLog,
    devStore,
  ).catch(console.error);
}
