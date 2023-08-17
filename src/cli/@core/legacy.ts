import * as FS from 'fs/promises';
import * as Path from 'path';

import type {Entrances} from '../@entrances';

export interface RetrieveLegacyOptions {
  out: string;
}

export async function retrieveLegacy(
  {api}: Entrances,
  {out}: RetrieveLegacyOptions,
): Promise<boolean> {
  const {content} = await api.call<{content: Record<string, string> | false}>(
    '/v2/script/retrieve-legacy-script',
    {},
  );

  if (!content) {
    return false;
  }

  await FS.mkdir(out, {recursive: true});

  for (const [name, text] of Object.entries(content)) {
    await FS.writeFile(Path.join(out, name), text);
  }

  return true;
}
