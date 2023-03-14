import * as Path from 'path';

import {Command} from '../@command';
import {ScriptOptions, pack} from '../@core';

export class Deploy extends Command {
  async run(): Promise<void> {
    const {
      entrances: {api},
    } = this;

    const {dss = {}} = require(Path.resolve('package.json'));

    const {schedule} = ScriptOptions.exact().satisfies(dss);

    const code = await pack(process.cwd());

    await api.call('/v2/script/deploy', {
      script: code,
      schedule,
    });

    console.info('部署成功！');
  }

  static override description = '将脚本打包部署到盯梢提供的托管环境。';
}
