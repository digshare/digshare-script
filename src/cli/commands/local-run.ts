import * as ChildProcess from 'child_process';
import * as Path from 'path';

import {Flags} from '@oclif/core';

import {Command} from '../@command.js';
import {packLocal} from '../@core/index.js';
import {Params} from '../@flags.js';

export class LocalRun extends Command {
  async run(): Promise<void> {
    const {
      entrances: {workingDir},
    } = this;

    const {
      flags: {params, 'reset-state': resetState, out},
    } = await this.parse(LocalRun);

    const outScript = await packLocal(workingDir, Path.join(workingDir, out));

    ChildProcess.spawn(
      process.argv[0],
      [outScript, JSON.stringify({params, resetState})],
      {stdio: 'inherit'},
    ).on('exit', code => process.exit(code ?? 0));

    await new Promise(() => {});
  }

  static override description = '在开发环境中执行脚本（不会实际发送消息）。';

  static override flags = {
    params: Params(),
    'reset-state': Flags.boolean(),
    out: Flags.string({
      description: '指定本地脚本生成文件夹',
      default: '.local',
    }),
  };
}
