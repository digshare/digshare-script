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

  @option({
    flag: 'r',
    description: 'Registry value',
    default: '',
  })
  registry!: string;

  @option({
    flag: 'e',
    description: 'Registry environment variable name',
    default: '',
  })
  env!: string;
}

@command({
  description: 'Build digShare script program',
})
export default class extends Command {
  @metadata
  async execute({input, output, registry, env}: BuildOptions): Promise<void> {
    registry ||= env && process.env[env]!;

    if (!registry) {
      throw Error('Registry is required');
    }

    await build({
      input,
      registry,
      output,
    });
  }
}
