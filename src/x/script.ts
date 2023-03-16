import * as x from 'x-value';

export const ScriptMessage = x.object({
  title: x.string.optional(),
  content: x.string,
});
