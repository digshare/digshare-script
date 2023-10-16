import {Errors, Flags} from '@oclif/core';

export const Params = Flags.custom<Record<string, unknown>>({
  description: '脚本执行参数（JSON 格式）。',
  parse(input) {
    try {
      const params = JSON.parse(input);

      if (typeof params !== 'object' || params === null) {
        throw new Error('参数必须为对象。');
      }

      return params;
    } catch (error) {
      throw new Errors.CLIError(`JSON 格式错误：${(error as Error).message}`);
    }
  },
});
