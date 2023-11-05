import Chalk from 'chalk';

import type {Entrances} from '../@entrances.js';
import {sleep} from '../@utils.js';

export const POLL_INTERVAL = 2000;

export type ScriptLogEvent = {
  invoke: string;
  level: 'runtime' | 'debug' | 'info' | 'warn' | 'error';
  timestamp: number;
  message: string;
};

export type PollLogsOptions = {
  debug: boolean;
  startTime?: Date;
};

export async function* pollLogs(
  {api}: Entrances,
  {debug, startTime}: PollLogsOptions,
): AsyncGenerator<ScriptLogEvent, void, undefined> {
  let lastNextToken: string | undefined;

  while (true) {
    const {events, nextToken} = await api.call<{
      events: ScriptLogEvent[];
      nextToken: string;
    }>('/v2/script/get-logs', {
      debug,
      startTime,
      nextToken: lastNextToken,
    });

    if (events.length === 0) {
      await sleep(POLL_INTERVAL);
      continue;
    }

    yield* events;

    lastNextToken = nextToken;
  }
}

export function printLogEvent({
  level,
  invoke,
  timestamp,
  message,
}: ScriptLogEvent): void {
  let color: (text: string) => string;

  switch (level) {
    case 'runtime':
      color = Chalk.green;

      switch (message) {
        case 'start':
          message = `执行开始 (${invoke})`;
          break;
        case 'end':
          message = `执行结束 (${invoke})`;
          break;
      }

      break;
    case 'debug':
      color = Chalk.gray;
      break;
    case 'info':
      color = Chalk.blue;
      break;
    case 'warn':
      color = Chalk.yellow;
      break;
    case 'error':
      color = Chalk.red;
      break;
  }

  // eslint-disable-next-line no-console
  console[level === 'runtime' ? 'info' : level](
    // https://stackoverflow.com/a/58633651/783653
    color(`[${new Date(timestamp).toLocaleString('sv')}]`),
    message,
  );
}
