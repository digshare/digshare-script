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
      flags: {out, minify},
    } = await this.parse(Pack);

    this.log('正在打包…');

    const path = Path.join(projectDir, out);

    await pack(projectDir, {out: path, minify});

    this.log('打包成功！');
    this.log('文件路径', Path.relative(projectDir, path));

    this.exit();
  }

  static override description = '模拟实际部署打包脚本。';

  static override flags = {
    out: Flags.string({
      description: '打包后的文件路径',
      default: 'out/script.mjs',
    }),
    minify: Flags.boolean(),
  };
}
