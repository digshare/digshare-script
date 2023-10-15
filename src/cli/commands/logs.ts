import {Flags} from '@oclif/core';
import ms from 'ms';

import {Command} from '../@command.js';
import {ensureAccessToken, pollLogs, printLogEvent} from '../@core/index.js';

export class Logs extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {debug, last, level},
    } = await this.parse(Logs);

    await ensureAccessToken(entrances);

    const startTime = last ? new Date(Date.now() - ms(last)) : undefined;

    const levels = ['debug', 'info', 'warn', 'error'];

    const levelIndex = levels.indexOf(level.toLowerCase());

    if (levelIndex < 0) {
      throw new Error(`无效的 level: ${level}。`);
    }

    levels.splice(0, levelIndex);

    const levelSet = new Set([...levels, 'runtime']);

    for await (const event of pollLogs(entrances, {debug, startTime})) {
      if (levelSet.has(event.level)) {
        printLogEvent(event);
      }
    }
  }

  static override description = '查看脚本日志。';

  static override flags = {
    debug: Flags.boolean({
      description: '获取调试环境日志',
    }),
    last: Flags.string({
      description: '最近一段时间，例如 "1d"',
    }),
    level: Flags.string({
      default: 'info',
      description: '只显示指定 level 及以上的日志（debug、info、warn、error）',
    }),
  };
}
