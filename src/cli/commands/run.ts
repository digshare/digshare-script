import {Flags} from '@oclif/core';
import prompts from 'prompts';

import {Command} from '../@command.js';
import {ensureAccessToken, invoke} from '../@core/index.js';

export class Run extends Command {
  async run(): Promise<void> {
    const {entrances} = this;

    const {
      flags: {params: paramsJSON, debug, 'dry-run': dryRun, force},
    } = await this.parse(Run);

    const params =
      typeof paramsJSON === 'string' ? JSON.parse(paramsJSON) : undefined;

    await ensureAccessToken(entrances);

    if (!force) {
      if (debug && !dryRun) {
        this.log('在未指定 --dry-run 的情况下，调试环境同样会发出消息。');

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

    await invoke(entrances, {params, debug, dryRun});

    this.exit();
  }

  static override description = '执行线上脚本。';

  static override flags = {
    params: Flags.string({
      description: '脚本执行参数，请使用 JSON 格式编写。',
    }),
    debug: Flags.boolean({
      description: '触发部署到调试环境的脚本',
    }),
    'dry-run': Flags.boolean(),
    force: Flags.boolean(),
  };
}
