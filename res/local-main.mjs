/* global script */

import * as FS from 'fs/promises';

const STATE_FILE_PATH = new URL('state.json', import.meta.url).pathname;

const {program} = script;

let state;

try {
  state = JSON.parse(await FS.readFile(STATE_FILE_PATH, 'utf8'));
} catch {
  // do nothing
}

const messages = program(state);

if (!messages) {
  process.exit();
}

if (messages instanceof Promise) {
  const message = await messages;

  if (message) {
    await publishMessage(message);
  }
} else if (messages[Symbol.toStringTag] === 'AsyncGenerator') {
  for await (const message of messages) {
    await publishMessage(message);
  }
} else {
  throw new Error('无效的脚本返回值');
}

async function publishMessage(message) {
  console.info('发布消息', message);

  const {state} = message;

  if (state !== undefined) {
    await FS.writeFile(STATE_FILE_PATH, JSON.stringify(state));
  }
}
