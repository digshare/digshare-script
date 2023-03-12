import {Command} from '@oclif/core';

import {pack} from '../@core';

export class Deploy extends Command {
  async run(): Promise<void> {
    const code = await pack(process.cwd());
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';
}
