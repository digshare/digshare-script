import * as FS from 'fs/promises';
import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {rollup} from 'rollup';

export async function build({
  input,
  registry,
  output,
}: {
  input: string;
  registry: string;
  output?: string;
}): Promise<void> {
  if (!output) {
    let packageJSON = Path.resolve('package.json');
    output = JSON.parse((await FS.readFile(packageJSON)).toString('utf8')).main;
  }

  if (!output) {
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
        ...(process.env['DIGSHARE_API']
          ? {
              'process.env.DIGSHARE_API': `'${process.env['DIGSHARE_API']}'`,
            }
          : {}),
        preventAssignment: true,
      }),
    ],
  });

  await bundle.write({
    file: output,
    format: 'cjs',
    exports: 'named',
  });

  await FS.writeFile(Path.join(Path.dirname(output), 'registry'), registry);
}
