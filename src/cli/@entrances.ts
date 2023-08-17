import * as Path from 'path';

import {entrance} from 'entrance-decorator';

import {API, Config} from './@core';

export class Entrances {
  constructor(
    readonly configDir: string,
    private projectDir: string | undefined,
  ) {}

  /* eslint-disable @mufan/explicit-return-type */

  @entrance
  get workingDir() {
    return this.projectDir ?? process.cwd();
  }

  @entrance
  get config() {
    return new Config(
      Path.join(this.configDir, 'config.json'),
      this.projectDir === undefined
        ? undefined
        : Path.join(this.projectDir, '.dssrc'),
    );
  }

  @entrance
  get api() {
    return new API(this.config);
  }

  /* eslint-enable @mufan/explicit-return-type */
}
