import * as Path from 'path';

import {entrance} from 'entrance-decorator';

import {API, Config} from './@core';

export class Entrances {
  constructor(
    readonly configDir: string,
    readonly projectDir: string,
  ) {}

  /* eslint-disable @mufan/explicit-return-type */

  @entrance
  get config() {
    return new Config(
      Path.join(this.configDir, 'config.json'),
      Path.join(this.projectDir, '.dssrc'),
    );
  }

  @entrance
  get api() {
    return new API(this.config);
  }

  /* eslint-enable @mufan/explicit-return-type */
}
