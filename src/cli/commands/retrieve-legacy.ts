import * as Path from 'path';

import {Flags} from '@oclif/core';

import {ensureAccessToken, retrieveLegacy} from '../@core';
import {ProjectIndependentCommand} from '../@project-independent-command';

export class RetrieveLegacy extends ProjectIndependentCommand {
  async run(): Promise<void> {
    const {
      entrances,
      entrances: {workingDir},
    } = this;

    const {
      flags: {out},
    } = await this.parse(RetrieveLegacy);

    await ensureAccessToken(entrances);

    this.log('正在下载旧版脚本…');

    const path = Path.join(workingDir, out);

    const saved = await retrieveLegacy(entrances, {out: path});

    if (saved) {
      for (const path of saved) {
        this.log('已保存文件', Path.relative(workingDir, path));
      }
    } else {
      this.log('当前项目没有旧版线上编辑器编写的脚本。');
    }

    this.exit();
  }

  static override description = '获取旧版脚本。';

  static override flags = {
    out: Flags.string({
      description: '保存文件夹路径',
      default: 'legacy',
    }),
  };
}
