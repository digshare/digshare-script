import * as Path from 'path';

import {Flags} from '@oclif/core';

import {Command} from '../@command';
import {pack} from '../@core';

export class Pack extends Command {
  async run(): Promise<void> {
    const {
      entrances: {projectDir},
    } = this;

    const {
      flags: {out},
    } = await this.parse(Pack);

    console.info('正在打包…');

    await pack(projectDir, Path.join(projectDir, out));

    console.info('打包成功！');

    this.exit();
  }

  static override description = '模拟实际部署打包脚本。';

  static override flags = {
    out: Flags.string({
      description: '打包后的文件路径',
      default: 'out/script.mjs',
    }),
  };
}
