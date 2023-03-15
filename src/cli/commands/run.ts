import {Flags} from '@oclif/core';
import prompts from 'prompts';

import {Command} from '../@command';
import {ensureAccessToken, invoke} from '../@core';

export class Run extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {debug, 'dry-run': dryRun, force},
    } = await this.parse(Run);

    if (!force) {
      if (debug && !dryRun) {
        console.info('在未指定 --dry-run 的情况下，调试环境同样会发出消息。');

        const {confirmed} = await prompts({
          type: 'confirm',
          name: 'confirmed',
          message: '确认继续？',
          initial: false,
        });

        if (!confirmed) {
          this.exit();
        }
      }
    }

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
    force: Flags.boolean(),
  };
}
