import type {Entrances} from '../@entrances.js';
import {sleep} from '../@utils.js';

import {pollLogs, printLogEvent} from './log.js';

const INVOKE_POLL_LOGS_INTERVAL = 3000;

export type InvokeOptions = {
  params: object | undefined;
  debug: boolean;
  dryRun: boolean;
};

export async function invoke(
  entrances: Entrances,
  {params, debug, dryRun}: InvokeOptions,
): Promise<void> {
  const {api} = entrances;

  const {id} = await api.call<{id: string}>('/v2/script/invoke', {
    params,
    debug,
    dryRun,
  });

  console.info('执行成功，正在等待日志…');

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
