import * as Path from 'path';

import {Flags} from '@oclif/core';
import prompts from 'prompts';

import {Command} from '../@command';
import {ScriptOptions, ensureAccessToken, invoke, pack} from '../@core';
import {sleep} from '../@utils';

const DEPLOY_INVOKE_INTERVAL = 1000;

export class Deploy extends Command {
  async run(): Promise<void> {
    const {
      entrances,
      entrances: {api},
    } = this;

    const {
      flags: {debug, run, 'dry-run': dryRun, force},
    } = await this.parse(Deploy);

    if (!force) {
      if (!debug) {
        console.info(
          '部署后将覆盖线上脚本，使用 --debug 选项可部署到调试环境。',
        );

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

      if (debug && run && !dryRun) {
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

    const {dss = {}} = require(Path.resolve('package.json'));

    const {schedule} = ScriptOptions.exact().satisfies(dss);

    await ensureAccessToken(entrances);

    const code = await pack(process.cwd());

    await api.call<{revision: string}>('/v2/script/deploy', {
      debug,
      script: code,
      schedule,
    });

    console.info('部署成功！');

    if (run || dryRun) {
      await sleep(DEPLOY_INVOKE_INTERVAL);
      await invoke(entrances, {debug, dryRun});
    }

    this.exit();
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';

  static override flags = {
    debug: Flags.boolean({
      description: '部署到调试环境',
    }),
    run: Flags.boolean(),
    'dry-run': Flags.boolean(),
    force: Flags.boolean(),
  };
}
