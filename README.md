# dss-sdk

### CLI

```JavaScript
dss build -i xxx -o xxx
```

### SDK

main.js

```JavaScript
// import type {Script} from "@digshare/script"

export default function(payload, context) {

}) // as Script
```

test.js

```JavaScript
import {devRun} from "@digshare/script";
import fn from "./main";
// import type {DevRunOptions} from "@digshare/script"

// 开发中测试运行
devRun(fn, {} // as DevRunOptions);
```

## License

MIT License.
