import {ReadableStream} from 'stream/web';

import * as x from 'x-value';

const Image = x.unknown.refined<
  never,
  string | ArrayBuffer | Blob | ReadableStream
>(value =>
  x.refinement(
    typeof value === 'string' ||
      value instanceof ArrayBuffer ||
      value instanceof Blob ||
      value instanceof ReadableStream,
    value,
    '图片必须是链接字符串、ArrayBuffer、Blob 或 ReadableStream',
  ),
);

export const ScriptUpdateMessage = x.object({
  tags: x.array(x.string).optional(),
  title: x.string.optional(),
  content: x.string,
  images: x.array(Image).optional(),
});

export type ScriptUpdateMessage = x.TypeOf<typeof ScriptUpdateMessage>;

export const ScriptResponse = x.object({
  headers: x.record(x.string, x.string).optional(),
  body: x.string.optional(),
});

export type ScriptResponse = x.TypeOf<typeof ScriptResponse>;
