# dss-sdk

### CLI

```JavaScript
dss build -i xxx -o xxx
```

### SDK

```JavaScript
import {script, devRun} from "dss-sdk";

export const main = script(function(payload, context) {
  // ~
})

// 方便测试运行
devRun(process.env.NODE_ENV === 'development', {}, main);
```

## License

MIT License.
