import {Command} from '@oclif/core';

export class Deploy extends Command {
  async run(): Promise<void> {
    console.log('deploy');
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';
}
