# 盯梢 {script}

盯梢是可以将消息变现的推送工具，盯梢频道主既可以手动向订阅者推送新消息，也可以通过盯梢脚本自动完成消息采集和推送。

盯梢脚本是盯梢提供的自动化频道消息推送方案，频道主可以通过 JavaScript 快速编写自动化脚本，托管到盯梢脚本服务器，定时或通过 webhook 触发执行。

盯梢脚本提供了两种编辑/部署方案：

1. 通过在线[盯梢脚本编辑器（script.dingshao.cn）](https://script.dingshao.cn/)直接编辑和部署脚本。
2. 通过 npm 命令行向盯梢脚本 registry 发布脚本。

## 为盯梢频道创建脚本

1. 打开[盯梢手机应用](https://www.dingshao.cn/)，切换到“发布”页面创建频道。
2. 打开[盯梢脚本编辑器](https://script.dingshao.cn/)，在手机应用上进入频道管理页面，打开扫一扫授权盯梢脚本编辑器。

此时可以看到生成的默认脚本，大致如下：

```js
/**
 * @param payload webhook 参数（POST body，支持 JSON）
 * @param context 脚本执行上下文，包括简单的键值存储对象
 */
export default async function (payload, context) {
  return {
    content: '你好，盯梢！',
  };
}
```

> 目前盯梢脚本编辑器提供了 JavaScript 和 TypeScript 两个版本的模板，可自行切换。

在脚本“调试”页面点击右下角“测试”按钮即可在模拟环境下执行脚本，此时不会真的推送消息。

调试完成后，可以在部署页面看到 webhook 或按需配置计划执行，点击右下角“部署”按钮即可实际部署脚本。部署完成后，按钮将变为“执行”，再次点击可以手动执行部署脚本，此时如果脚本函数返回值不为空，则会推送相关消息到当前频道。

[在线编辑器提供了少量 npm 包](https://docs.dingshao.cn/script-manual/online-editor/available-npm-packages)，同时提供了全局的 `fetch` API（`node-fetch`）供开发者使用。如果您想使用更多 npm 包，建议通过本地构建上传，参考[盯梢脚本模板](https://github.com/digshare/digshare-script-template)。

## 使用参考

### 脚本 `default` 函数

脚本 `default` 函数类型为 `Script`，可以是普通的异步函数或异步生成器。

`Script` 接受两个参数，`payload` 和 `context`：

- `payload` 是用户通过 webhook 传入的参数。
- `context` 类型为 `ScriptContext`。
- 返回值（或 `yield` 值）为消息对象 `ScriptMessage`，包含消息内容、链接、标签等。

### 脚本上下文 `ScriptContext<TStorage extends object>`

[[源码]](./src/library/script/context.ts)

`ScriptContext` 中最常用的是 `storage`，该对象提供了 `getItem(key)` 和 `setItem(key, value)` 两个方法，可以用于存储脚本执行信息，经常被我们用来避免发送重复的消息或内容。

```js
export default async function (payload, {storage}) {
  let count = storage.getItem('count') ?? 1;

  console.log(`这是脚本第 ${count} 次执行。`);

  storage.setItem('count', count + 1);

  return {
    content: '你好，盯梢！',
  };
}
```

### 脚本消息 `ScriptMessage`

[[源码]](./src/library/script/script.ts)

除了 `content` 之外都是可选参数。

```js
export default async function (payload, context) {
  if (nothingNew) {
    // 返回 undefined 表示不用推送新消息。
    return undefined;
  }

  return {
    content: '消息内容。',
    images: [
      /* 图片 Buffer 的数组。*/
    ],
    links: [
      'https://www.dingshao.cn/',
      {
        url: 'https://script.dingshao.cn/',
        description: '盯梢脚本编辑器',
      },
    ],
    tags: ['标签', '不存在将自动创建'],
  };
}
```

## 本地开发

盯梢脚本支持本地开发构建后，通过 npm 发布到盯梢脚本 registry。

参考[盯梢脚本模板](https://github.com/digshare/digshare-script-template)。
