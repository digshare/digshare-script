import {Command} from '../@command';
import {pack} from '../@core';

export class Deploy extends Command {
  async run(): Promise<void> {
    const {
      entrances: {api},
    } = this;

    const code = await pack(process.cwd());

    await api.call('/v2/script/deploy', {script: code});

    console.info('部署成功！');
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';
}
