import * as FS from 'fs/promises';
import * as Path from 'path';

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import virtual from '@rollup/plugin-virtual';
import resolve from 'enhanced-resolve';
import findUp from 'find-up';
import type {OutputOptions, RollupBuild} from 'rollup';
import {rollup} from 'rollup';

const VIRTUAL_ENTRY_NAME = './__entry.js';

const LOCAL_MAIN_FILE_PATH = Path.join(__dirname, '../../../res/local-main.js');

function ROLLUP({
  tsconfig,
  code,
  minify,
}: {
  tsconfig: string | undefined;
  code: string;
  minify: boolean;
}): Promise<RollupBuild> {
  return rollup({
    input: VIRTUAL_ENTRY_NAME,
    plugins: [
      virtual({
        [VIRTUAL_ENTRY_NAME]: code,
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
      typescript({
        tsconfig,
        compilerOptions: {
          sourceMap: false,
        },
        outputToFilesystem: false,
      }),
      commonjs(),
      json(),
      minify && terser(),
    ],
  });
}

const BUILD_OPTIONS: OutputOptions = {
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
  const [scriptModulePath, tsconfig] = getScriptModule(projectDir);

  const build = await ROLLUP({
    code: `\
export {default} from ${JSON.stringify(scriptModulePath)};
`,
    minify,
    tsconfig,
  });

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
  const [scriptModulePath, tsconfig] = getScriptModule(projectDir);

  const mainFileContent = await FS.readFile(LOCAL_MAIN_FILE_PATH, 'utf8');

  const build = await ROLLUP({
    code: `\
import script from ${JSON.stringify(scriptModulePath)};

${mainFileContent}`,
    minify: false,
    tsconfig,
  });

  const outScript = Path.join(outDir, 'script.mjs');

  await build.write({
    ...BUILD_OPTIONS,
    file: outScript,
  });

  return outScript;
}

function getScriptModule(
  projectDir: string,
): [path: string, tsconfig: string | undefined] {
  const {name: scriptPackageName} = require(Path.join(
    projectDir,
    'package.json',
  )) as {name: string | undefined};

  if (typeof scriptPackageName !== 'string') {
    throw new Error('项目 package.json 中未配置 name 字段。');
  }

  const path = resolve.sync(projectDir, scriptPackageName) as string;

  return [path, getTSConfig(path)];
}

function getTSConfig(path: string): string | undefined {
  return findUp.sync('tsconfig.json', {cwd: Path.dirname(path)});
}
