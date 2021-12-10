import {Command, Options, command, metadata, option} from 'clime';

import {build} from '../core';

export class BuildOptions extends Options {
  @option({
    flag: 'i',
    description: 'Input file path',
  })
  input!: string;

  @option({
    flag: 'o',
    description: 'Output file path',
    default: '',
  })
  output!: string;
}

@command({
  description: 'Build digShare script program',
})
export default class extends Command {
  @metadata
  async execute({input, output}: BuildOptions): Promise<void> {
    await build({
      input,
      output,
    });
  }
}
