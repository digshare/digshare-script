import {IScriptAPI, IStore} from './api';

export interface ScriptContext<TStore extends IStore> {
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
  /**
   * 频道脚本相关 open api 封装
   */
  api: IScriptAPI<TStore>;
}
