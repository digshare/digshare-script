import * as ChildProcess from 'child_process';
import * as Path from 'path';

import {Flags} from '@oclif/core';

import {Command} from '../@command';
import {packLocal} from '../@core';

export class Local extends Command {
  async run(): Promise<void> {
    const {
      flags: {out},
    } = await this.parse(Local);

    const outScript = await packLocal(process.cwd(), Path.resolve(out));

    ChildProcess.spawn(process.argv[0], [outScript], {
      stdio: 'inherit',
    }).on('exit', code => {
      process.exit(code ?? 0);
    });

    await new Promise(() => {});
  }

  static override description = '在开发环境中执行脚本（不会实际发送消息）。';

  static override flags = {
    out: Flags.string({
      description: '指定本地脚本生成文件夹',
      default: '.local',
    }),
  };
}
