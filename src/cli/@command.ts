import type {Config} from '@oclif/core';
import {Command as OclifCommand} from '@oclif/core';
import pkgDir from 'pkg-dir';

import {Entrances} from './@entrances';

export abstract class Command extends OclifCommand {
  protected entrances: Entrances;

  constructor(argv: string[], config: Config) {
    super(argv, config);

    const projectDir = pkgDir.sync();

    if (!projectDir) {
      console.error('未找到项目根目录。');
      this.exit(1);
    }

    this.entrances = new Entrances(this.config.configDir, projectDir!);
  }
}
