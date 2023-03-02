import {Command} from '@oclif/core';

export class Connect extends Command {
  async run(): Promise<void> {
    console.log('connect');
  }

  static override description =
    '获取盯梢频道脚本配置及密钥，用于后续部署、调试。';
}
