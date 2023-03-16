/* global script */

import * as FS from 'fs/promises';

import {ScriptMessage, x} from '@digshare/script/x';

const STATE_FILE_PATH = new URL('state.json', import.meta.url).pathname;

const {program} = script;

let state;

try {
  state = JSON.parse(await FS.readFile(STATE_FILE_PATH, 'utf8'));
} catch {
  // do nothing
}

const updates = program(state);

if (!updates) {
  process.exit();
}

if (updates instanceof Promise) {
  const update = await updates;

  if (update) {
    await scriptUpdate(update);
  }
} else if (updates[Symbol.toStringTag] === 'AsyncGenerator') {
  for await (const update of updates) {
    await scriptUpdate(update);
  }
} else {
  throw new Error('无效的脚本返回值');
}

async function scriptUpdate({message, state}) {
  if (message) {
    if (typeof message === 'string') {
      message = {content: message};
    }

    console.info(
      '发布消息',
      ScriptMessage.decode(x.extendedJSONValue, message),
    );
  }

  if (state !== undefined) {
    console.info('更新状态', state);
    await FS.writeFile(STATE_FILE_PATH, JSON.stringify(state));
  }
}
