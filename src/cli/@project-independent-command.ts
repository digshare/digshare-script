import type {Config} from '@oclif/core';
import {Command as OclifCommand} from '@oclif/core';

import {Entrances} from './@entrances';

export abstract class ProjectIndependentCommand extends OclifCommand {
  protected entrances: Entrances;

  constructor(argv: string[], config: Config) {
    super(argv, config);

    this.entrances = new Entrances(this.config.configDir, undefined);
  }
}
