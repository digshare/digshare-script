import * as Path from 'path';

import {Flags} from '@oclif/core';
import prompts from 'prompts';

import {Command} from '../@command';
import {ScriptOptions, ensureAccessToken, invoke, pack} from '../@core';
import {sleep} from '../@utils';

const DEPLOY_INVOKE_INTERVAL = 3000;

export class Deploy extends Command {
  async run(): Promise<void> {
    const {
      entrances,
      entrances: {api, workingDir},
    } = this;

    const {
      flags: {
        minify,
        debug,
        run,
        'dry-run': dryRun,
        'reset-state': resetState,
        force,
      },
    } = await this.parse(Deploy);

    await ensureAccessToken(entrances);

    if (!force) {
      if (!debug) {
        this.log('部署后将覆盖线上脚本，使用 --debug 选项可部署到调试环境。');

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

    const {dss = {}, homepage} = require(Path.join(workingDir, 'package.json'));

    const {schedule} = ScriptOptions.exact().satisfies(dss);

    this.log('正在打包…');

    const code = await pack(workingDir, {minify});

    this.log('正在部署…');

    await api.call<{revision: string}>('/v2/script/deploy', {
      debug,
      script: code,
      homepage,
      schedule,
      resetState,
    });

    this.log('部署成功！');

    if (run || dryRun) {
      await sleep(DEPLOY_INVOKE_INTERVAL);
      await invoke(entrances, {debug, dryRun});
    }

    this.exit();
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';

  static override flags = {
    minify: Flags.boolean(),
    debug: Flags.boolean({
      description: '部署到调试环境',
    }),
    run: Flags.boolean(),
    'dry-run': Flags.boolean(),
    'reset-state': Flags.boolean(),
    force: Flags.boolean(),
  };
}
