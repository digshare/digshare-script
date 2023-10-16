/* global script, PROJECT_DIR */

import * as FS from 'fs/promises';
import * as Path from 'path';
import {fileURLToPath} from 'url';
import {isGeneratorObject} from 'util/types';

import {ScriptUpdateMessage, ScriptResponse} from '@digshare/script/x';

const {params, resetState} = JSON.parse(process.argv[2]);

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

const updates = program(state, {params});

if (updates) {
  if (typeof updates === 'object') {
    if (updates instanceof Promise) {
      const update = await updates;

      if (update) {
        await scriptUpdate(update);
      }
    } else if (isGeneratorObject(updates)) {
      let result;

      // eslint-disable-next-line no-cond-assign
      while ((result = await updates.next())) {
        const {value: update, done} = result;

        if (update) {
          await scriptUpdate(update);
        }

        if (done) {
          break;
        }
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

async function scriptUpdate({message, state, response, ...unknown}) {
  const unknownKeys = Object.keys(unknown);

  if (unknownKeys.length > 0) {
    console.warn('未知属性', unknownKeys);

    if (ScriptUpdateMessage.is(unknown)) {
      console.warn('是否忘记了将消息放在 message 属性中？');
    }
  }

  if (typeof message === 'string') {
    message = {content: message};
  }

  if (message) {
    console.info('发布消息', ScriptUpdateMessage.sanitize(message));

    anyEffect = true;
  }

  if (state !== undefined) {
    console.info('更新状态', Path.relative(PROJECT_DIR, STATE_FILE_PATH));

    await FS.writeFile(STATE_FILE_PATH, JSON.stringify(state, undefined, 2));

    anyEffect = true;
  }

  if (typeof response === 'string') {
    response = {body: response};
  }

  if (response) {
    console.info('设置响应', ScriptResponse.sanitize(response));
  }
}
