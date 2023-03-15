import {Flags} from '@oclif/core';
import ms from 'ms';

import {Command} from '../@command';
import {ensureAccessToken, pollLogs, printLogEvent} from '../@core';

export class Logs extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {last},
    } = await this.parse(Logs);

    const startTime = last ? new Date(Date.now() - ms(last)) : undefined;

    await ensureAccessToken(entrances);

    for await (const event of pollLogs(entrances, {startTime})) {
      printLogEvent(event);
    }
  }

  static override description = '查看脚本日志。';

  static override flags = {
    last: Flags.string({
      description: '最近一段时间，例如 "1d"',
    }),
  };
}