/* global script */

import * as FS from 'fs/promises';
import {fileURLToPath} from 'url';

import {ScriptUpdateMessage, x} from '@digshare/script/x';
import {isGeneratorObject} from 'util/types';

const {resetState} = JSON.parse(process.argv[2]);

const STATE_FILE_PATH = fileURLToPath(new URL('state.json', import.meta.url));

const {program} = script;

let state;

try {
  if (resetState) {
    await FS.unlink(STATE_FILE_PATH);
  } else {
    state = JSON.parse(await FS.readFile(STATE_FILE_PATH, 'utf8'));
  }
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error;
  }
}

let anyEffect = false;

const updates = program(state);

if (updates) {
  if (typeof updates === 'object') {
    if (updates instanceof Promise) {
      const update = await updates;

      if (update) {
        await scriptUpdate(update);
      }
    } else if (isGeneratorObject(updates)) {
      for await (const update of updates) {
        await scriptUpdate(update);
      }
    } else {
      await scriptUpdate(updates);
    }
  } else {
    throw new Error('无效的脚本返回值');
  }
}

if (!anyEffect) {
  console.info('脚本执行完毕，没有需要发布的消息或更新的状态。');
}

process.exit();

async function scriptUpdate({message, state, ...unknown}) {
  const unknownKeys = Object.keys(unknown);

  if (unknownKeys.length > 0) {
    console.warn('未知属性', unknownKeys);

    if (ScriptUpdateMessage.is(unknown)) {
      console.warn('是否忘记了将消息放在 message 属性中？');
    }
  }

  if (message) {
    if (typeof message === 'string') {
      message = {content: message};
    }

    console.info(
      '发布消息',
      ScriptUpdateMessage.decode(x.extendedJSONValue, message),
    );

    anyEffect = true;
  }

  if (state !== undefined) {
    console.info('更新状态', state);

    await FS.writeFile(STATE_FILE_PATH, JSON.stringify(state));

    anyEffect = true;
  }
}
