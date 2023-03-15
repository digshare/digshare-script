import type {Entrances} from '../@entrances';
import {sleep} from '../@utils';

import {pollLogs, printLogEvent} from './log';

const INVOKE_POLL_LOGS_INTERVAL = 3000;

export interface InvokeOptions {
  debug: boolean;
  dryRun: boolean;
}

export async function invoke(
  entrances: Entrances,
  {debug, dryRun}: InvokeOptions,
): Promise<void> {
  const {api} = entrances;

  const {id} = await api.call<{id: string}>('/v2/script/invoke', {
    debug,
    dryRun,
  });

  console.info('调用成功，正在等待日志…');

  await sleep(INVOKE_POLL_LOGS_INTERVAL);

  for await (const event of pollLogs(entrances, {debug})) {
    if (event.invoke !== id) {
      continue;
    }

    printLogEvent(event);

    if (event.level === 'runtime' && event.message === 'end') {
      break;
    }
  }
}
