import {Command} from '../@command.js';
import {connectScript} from '../@core/index.js';

export class Connect extends Command {
  async run(): Promise<void> {
    await connectScript(this.entrances);

    this.exit();
  }

  static override description = '获取盯梢频道脚本密钥，用于后续部署、调试。';
}
