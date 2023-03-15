import type {Entrances} from '../@entrances';

import {pollLogs, printLogEvent} from './log';

export interface InvokeOptions {
  dryRun: boolean;
}

export async function invoke(
  entrances: Entrances,
  {dryRun}: InvokeOptions,
): Promise<void> {
  const {api} = entrances;

  const {id} = await api.call<{id: string}>('/v2/script/invoke', {
    dryRun,
  });

  console.info('调用成功，正在等待日志…');

  for await (const event of pollLogs(entrances)) {
    if (event.invoke !== id) {
      continue;
    }

    printLogEvent(event);

    if (event.level === 'runtime' && event.message === 'end') {
      break;
    }
  }
}
