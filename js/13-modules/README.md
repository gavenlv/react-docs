# 13 - 模块化开发

## 🎯 本节目标
- 理解模块化的概念
- 掌握 ES Modules 语法
- 了解 CommonJS 规范
- 学会模块的组织和导入导出

---

## 📖 什么是模块化？

模块化是将代码分割成独立、可复用的模块，每个模块负责特定功能。

### 优点

- 代码复用
- 命名空间隔离
- 依赖管理
- 易于维护

---

## 📦 ES Modules

### 导出（export）

```javascript
// utils.js

// 命名导出
export const PI = 3.14159;

export function add(a, b) {
  return a + b;
}

export class Calculator {
  add(a, b) { return a + b; }
}

// 统一导出
const name = 'Utils';
const version = '1.0.0';
export { name, version };

// 重命名导出
export { add as sum };

// 默认导出
export default class User {
  constructor(name) {
    this.name = name;
  }
}
```

### 导入（import）

```javascript
// main.js

// 命名导入
import { PI, add } from './utils.js';

// 重命名导入
import { add as sum } from './utils.js';

// 导入所有
import * as Utils from './utils.js';
Utils.add(1, 2);

// 默认导入
import User from './utils.js';

// 混合导入
import User, { PI, add } from './utils.js';

// 动态导入
const module = await import('./utils.js');
```

---

## 📋 模块特点

### 严格模式

ES Modules 默认使用严格模式。

```javascript
// 自动启用严格模式
export const x = 1;
```

### 单例

模块只执行一次，多次导入共享同一实例。

```javascript
// counter.js
let count = 0;
export function increment() {
  return ++count;
}

// a.js 和 b.js 导入的是同一个 count
```

### 静态结构

import/export 必须在顶层，不能在条件语句中。

```javascript
// ❌ 错误
if (condition) {
  import { foo } from './module.js';
}

// ✅ 正确（动态导入）
if (condition) {
  const module = await import('./module.js');
}
```

---

## 💻 实战示例：模块组织

```
src/
├── modules/
│   ├── utils/
│   │   ├── index.js
│   │   ├── string.js
│   │   └── number.js
│   ├── services/
│   │   ├── index.js
│   │   └── api.js
│   └── components/
│       ├── index.js
│       └── Button.js
└── main.js
```

```javascript
// modules/utils/index.js
export * from './string.js';
export * from './number.js';

// main.js
import { capitalize, sum } from './modules/utils/index.js';
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解模块化的概念
- [ ] 掌握 export 和 import 语法
- [ ] 了解默认导出和命名导出
- [ ] 会使用动态导入
- [ ] 能够组织模块结构

---

## 🔗 相关资源

- [MDN - 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)
- [ES Modules 规范](https://tc39.es/ecma262/#sec-modules)
