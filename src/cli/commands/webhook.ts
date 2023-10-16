import {Flags} from '@oclif/core';

import {Command} from '../@command.js';
import {ensureAccessToken, getWebhook} from '../@core/index.js';

export class Webhook extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {debug, reset},
    } = await this.parse(Webhook);

    await ensureAccessToken(entrances);

    await getWebhook(entrances, {debug, reset});

    this.exit();
  }

  static override description = '获取 webhook。';

  static override flags = {
    debug: Flags.boolean({
      description: '获取调试环境的 webhook',
    }),
    reset: Flags.boolean({
      description: '重置 webhook',
    }),
  };
}
