import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import resolve from 'enhanced-resolve';
import {rollup} from 'rollup';

const VIRTUAL_ENTRY_NAME = './__entry.js';

export async function pack(projectDir: string): Promise<string> {
  const {name: scriptPackageName} = require(Path.resolve(
    projectDir,
    'package.json',
  ));

  const scriptSource = resolve.sync(projectDir, scriptPackageName) as string;

  const build = await rollup({
    input: VIRTUAL_ENTRY_NAME,
    plugins: [
      virtual({
        [VIRTUAL_ENTRY_NAME]: `\
export {default} from ${JSON.stringify(scriptSource)};
`,
      }),
      nodeResolve(),
      commonjs(),
    ],
  });

  const {
    output: [{code}],
  } = await build.write({
    file: Path.resolve(projectDir, 'bundled-script.mjs'),
    inlineDynamicImports: true,
  });

  return code;
}
