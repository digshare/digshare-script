import * as FS from 'fs';
import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import virtual from '@rollup/plugin-virtual';
import resolve from 'enhanced-resolve';
import type {RollupBuild} from 'rollup';
import {rollup} from 'rollup';

const VIRTUAL_ENTRY_NAME = './__entry.js';

const LOCAL_MAIN_FILE_PATH = Path.join(__dirname, '../../../res/local-main.js');

function ROLLUP(entryCode: string, minify: boolean): Promise<RollupBuild> {
  return rollup({
    input: VIRTUAL_ENTRY_NAME,
    plugins: [
      virtual({
        [VIRTUAL_ENTRY_NAME]: entryCode,
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
      minify && terser(),
    ],
  });
}

const BUILD_OPTIONS = {
  inlineDynamicImports: true,
};

export interface PackOptions {
  out?: string;
  minify?: boolean;
}

export async function pack(
  projectDir: string,
  {out, minify = false}: PackOptions = {},
): Promise<string> {
  const scriptModuleSpecifier = getScriptModuleSpecifier(projectDir);

  const build = await ROLLUP(
    `\
export {default} from ${JSON.stringify(scriptModuleSpecifier)};
`,
    minify,
  );

  const {
    output: [{code}],
  } = await (out
    ? build.write({
        ...BUILD_OPTIONS,
        file: out,
      })
    : build.generate(BUILD_OPTIONS));

  return code;
}

export async function packLocal(
  projectDir: string,
  outDir: string,
): Promise<string> {
  const scriptModuleSpecifier = getScriptModuleSpecifier(projectDir);

  const build = await ROLLUP(
    `\
import script from ${JSON.stringify(scriptModuleSpecifier)};

${FS.readFileSync(LOCAL_MAIN_FILE_PATH, 'utf8')}`,
    false,
  );

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
