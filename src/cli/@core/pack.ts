import * as FS from 'fs';
import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import resolve from 'enhanced-resolve';
import {rollup} from 'rollup';

const VIRTUAL_ENTRY_NAME = './__entry.js';

const LOCAL_MAIN_FILE_PATH = Path.join(
  __dirname,
  '../../../res/local-main.mjs',
);

const PLUGINS = [nodeResolve(), commonjs()];

const BUILD_OPTIONS = {
  inlineDynamicImports: true,
};

export async function pack(projectDir: string): Promise<string> {
  const scriptModuleSpecifier = getScriptModuleSpecifier(projectDir);

  const build = await rollup({
    input: VIRTUAL_ENTRY_NAME,
    plugins: [
      virtual({
        [VIRTUAL_ENTRY_NAME]: `\
export {default} from ${JSON.stringify(scriptModuleSpecifier)};
`,
      }),
      ...PLUGINS,
    ],
  });

  const {
    output: [{code}],
  } = await build.generate(BUILD_OPTIONS);

  return code;
}

export async function packLocal(
  projectDir: string,
  outDir: string,
): Promise<string> {
  const scriptModuleSpecifier = getScriptModuleSpecifier(projectDir);

  const build = await rollup({
    input: VIRTUAL_ENTRY_NAME,
    plugins: [
      virtual({
        [VIRTUAL_ENTRY_NAME]: `\
import script from ${JSON.stringify(scriptModuleSpecifier)};

${FS.readFileSync(LOCAL_MAIN_FILE_PATH, 'utf8')}`,
      }),
      ...PLUGINS,
    ],
  });

  const outScript = Path.join(outDir, 'script.mjs');

  await build.write({
    ...BUILD_OPTIONS,
    file: outScript,
  });

  return outScript;
}

function getScriptModuleSpecifier(projectDir: string): string {
  const {name: scriptPackageName} = require(Path.join(
    projectDir,
    'package.json',
  ));

  return resolve.sync(projectDir, scriptPackageName) as string;
}
