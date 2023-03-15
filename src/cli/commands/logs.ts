import {Command} from '../@command';
import {ensureAccessToken, pollLogs, printLogEvent} from '../@core';

export class Log extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    await ensureAccessToken(entrances);

    for await (const event of pollLogs(entrances)) {
      printLogEvent(event);
    }
  }

  static override description = '查看脚本日志。';
}
