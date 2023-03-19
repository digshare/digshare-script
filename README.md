# 盯梢 {script}

```ts
import {script} from '@digshare/script';

export default script(async (state = 0) => {
  state++;

  return {
    message: `这是脚本自动发送的第 ${state} 条消息！`,
    state,
  };
});
```

## License

MIT License.
