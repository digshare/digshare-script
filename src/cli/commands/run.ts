import {Flags} from '@oclif/core';

import {Command} from '../@command';
import {ensureAccessToken, invoke} from '../@core';

export class Run extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {debug, 'dry-run': dryRun},
    } = await this.parse(Run);

    await ensureAccessToken(entrances);

    await invoke(entrances, {debug, dryRun});

    this.exit();
  }

  static override description = '手动触发脚本。';

  static override flags = {
    debug: Flags.boolean({
      description: '触发部署到调试环境的脚本',
    }),
    'dry-run': Flags.boolean(),
  };
}
