import {ScriptAPI} from './api';

export interface ScriptContext {
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
   * Open API 地址
   */
  baseURL: string;
  api: ScriptAPI;
}
