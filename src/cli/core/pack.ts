import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import resolve from 'enhanced-resolve';
import {rollup} from 'rollup';

export async function pack(projectDir: string): Promise<string> {
  const {name} = require(Path.resolve(projectDir, 'package.json'));

  const input = resolve.sync(projectDir, name) as string;

  const build = await rollup({
    input,
    plugins: [nodeResolve(), commonjs()],
  });

  const {
    output: [{code}],
  } = await build.write({
    inlineDynamicImports: true,
    file: Path.resolve(projectDir, 'bundled-script.js'),
  });

  return code;
}
