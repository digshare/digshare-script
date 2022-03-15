import {IScriptAPI} from './api';
import {ScriptStorage} from './storage';

export interface ScriptContext<TStorage extends object> {
  /**
   * 是否是模拟运行
   */
  dryRun: boolean;
  /**
   * 请求唯一 ID
   */
  requestId: string;
  /**
   * 频道授权 token, 代码更新后会重置
   */
  token: string;
  /**
   * 频道脚本相关 Open API 封装
   */
  api: IScriptAPI<TStorage>;
  /**
   * 来自 `api.getScriptStorage`
   * 函数执行完成后将自动保存
   */
  storage: ScriptStorage<TStorage>;
}