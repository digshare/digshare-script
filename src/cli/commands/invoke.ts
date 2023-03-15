import {Command} from '../@command';
import {ensureAccessToken, pollLogs, printLogEvent} from '../@core';

export class Invoke extends Command {
  async run(): Promise<void> {
    const {
      entrances,
      entrances: {api},
    } = this;

    await ensureAccessToken(entrances);

    const {id} = await api.call<{id: string}>('/v2/script/invoke', {});

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

    this.exit();
  }

  static override description = '手动触发脚本。';
}
