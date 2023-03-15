import {Command} from '../@command';
import {connectScript} from '../@core';

export class Connect extends Command {
  async run(): Promise<void> {
    await connectScript(this.entrances);

    this.exit();
  }

  static override description =
    '获取盯梢频道脚本配置及密钥，用于后续部署、调试。';
}
