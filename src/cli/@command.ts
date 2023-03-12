import {Command as OclifCommand} from '@oclif/core';

import {Entrances} from './@entrances';

export abstract class Command extends OclifCommand {
  protected entrances = new Entrances(this.config.configDir);
}
