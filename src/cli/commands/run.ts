import {Flags} from '@oclif/core';

import {Command} from '../@command';
import {ensureAccessToken, invoke} from '../@core';

export class Run extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {'dry-run': dryRun},
    } = await this.parse(Run);

    await ensureAccessToken(entrances);

    await invoke(entrances, {dryRun});

    this.exit();
  }

  static override description = '手动触发脚本。';

  static override flags = {
    'dry-run': Flags.boolean(),
  };
}
