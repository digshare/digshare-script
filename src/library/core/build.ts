import * as FS from 'fs/promises';
import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {rollup} from 'rollup';

export async function build(input: string, out?: string): Promise<void> {
  if (!out) {
    let packageJSON = Path.resolve('package.json');
    out = JSON.parse((await FS.readFile(packageJSON)).toString('utf8')).main;
  }

  if (!out) {
    throw Error('Out path is required');
  }

  let bundle = await rollup({
    input,

    plugins: [
      commonjs(),
      nodeResolve({
        preferBuiltins: true,
      }),
      json(),
      replace({
        'process.env.DIGSHARE_API': `'${process.env['DIGSHARE_API']}'`,
        preventAssignment: true,
      }),
    ],
  });

  await bundle.write({
    file: out,
    format: 'cjs',
    exports: 'named',
  });
}
