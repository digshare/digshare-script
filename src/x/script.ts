import {ReadableStream} from 'stream/web';

import * as x from 'x-value';

const Image = x.unknown.refined<never, ArrayBuffer | Blob | ReadableStream>(
  value =>
    x.refinement(
      value instanceof ArrayBuffer ||
        value instanceof Blob ||
        value instanceof ReadableStream,
      value,
      '图片必须是 ArrayBuffer、Blob 或 ReadableStream',
    ),
);

export const ScriptUpdateMessage = x.object({
  title: x.string.optional(),
  content: x.string,
  images: x.array(Image).optional(),
});

export type ScriptUpdateMessage = x.TypeOf<typeof ScriptUpdateMessage>;
