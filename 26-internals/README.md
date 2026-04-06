# 26 - React 内部原理

## 🎯 本节目标
- 理解 React 的核心设计理念
- 掌握虚拟 DOM 和 Diff 算法的工作机制
- 了解调度系统（Scheduler）和渲染流程
- 为深入学习 Fiber 和并发模式打下基础

---

## 📖 React 核心概念

### 声明式编程

React 采用**声明式**范式，开发者描述"UI 应该是什么样子"，而不是"如何一步步操作 DOM"。

```jsx
// 声明式：你想要什么
function Counter({ count }) {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}

// 命令式：如何实现
// document.getElementById('count').textContent = count;
// document.getElementById('btn').onclick = onIncrement;
```

### 虚拟 DOM (Virtual DOM)

**为什么需要 Virtual DOM？**

直接操作真实 DOM 的代价很高：
1. **性能开销大**: 每次修改都会触发重排（reflow）和重绘（repaint）
2. **跨浏览器兼容**: 不同浏览器的 DOM 实现有差异
3. **难以优化**: 大量手动 DOM 操作难以维护

**Virtual DOM 的解决方案：**

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   State      │ ──▶ │  虚拟 DOM 树      │ ──▶ │  真实 DOM    │
│  (数据)       │     │  (JavaScript 对象) │     │  (浏览器)    │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    Diff 算法比较
                    计算最小变更
```

**Virtual DOM 的本质：**
- 用 JavaScript 对象表示 DOM 结构
- 在内存中进行计算和比较
- 批量更新，最小化真实 DOM 操作

### JSX 到 Virtual DOM 的转换

```jsx
// JSX（语法糖）
const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// 编译后：调用 React.createElement()
const element = React.createElement(
  'div',                          // type: 元素类型
  { className: 'container' },     // props: 属性对象
  // children: 子元素（可变参数）
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
);

// 最终生成的 Virtual DOM 对象
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: { children: 'Hello' }
      },
      {
        type: 'p',
        props: { children: 'World' }
      }
    ]
  },
  key: null,
  ref: null
}
```

---

## 🔄 协调与渲染

### 渲染流程概览

```
State/Props 变化
      ↓
┌─────────────────────────────────────────┐
│           Render 阶段                     │
│  （纯函数，可以被打断）                    │
│                                          │
│  • 调用组件函数生成新的 Virtual DOM        │
│  • 不涉及任何副作用                        │
│  • 可被高优先级任务中断                    │
└─────────────────────────────────────────┘
      ↓
┌─────────────────────────────────────────┐
│           Commit 阶段                     │
│  （同步执行，不可打断）                    │
│                                          │
│  • 将变更应用到真实 DOM                   │
│  • 执行副作用（useEffect 等）             │
│  • 更新 refs                             │
└─────────────────────────────────────────┘
      ↓
   浏览器绘制
```

### Render 阶段详解

**1. 触发更新**

```jsx
// 多种触发更新的方式
setState(newValue);              // State 变化
forceUpdate();                  // 强制更新
父组件重新渲染导致 props 变化    // Props 变化
Context 值变化                   // Context 变化
```

**2. 创建 Update 对象**

每个状态更新都会创建一个 Update 对象：

```javascript
// Update 结构
const update = {
  action: action,          // 更新内容（值或函数）
  priority: priority,      // 优先级
  tag: tag,                // 更新标签（ReplaceState、ForceUpdate 等）
  next: null               // 链表指针
};
```

**3. 调度更新**

根据优先级决定何时执行更新：

```javascript
// Scheduler 根据优先级安排任务
if (isHighPriority(update)) {
  scheduleImmediateWork(render);  // 同步或微任务
} else if (isUserBlockingPriority(update)) {
  scheduleCallback(NORMAL_PRIORITY_TASK, render);  // requestAnimationFrame 或 setTimeout
} else {
  scheduleCallback(IDLE_PRIORITY_TASK, render);  // requestIdleCallback
}
```

---

## 🔍 Reconciliation（协调）算法

### 为什么叫 "Reconciliation"？

React 通过对比新旧两棵 Virtual DOM 树，确定如何最高效地更新 UI。这个过程称为**协调（Reconciliation）**。

### Diff 算法的三个假设

为了降低算法复杂度（从 O(n³) 到 O(n)），Diff 算法基于以下假设：

1. **不同类型的元素会产生不同的树**
2. **可以通过 key 来识别哪些子元素在不同渲染中保持不变**
3. **开发者可以通过 key 暗示哪些子元素是稳定的**

### Diff 策略

#### 策略一：树层级的比较（Tree Level）

React 只比较同一层级的节点，不会跨层级比较。

```jsx
// 如果根节点类型不同，销毁旧树，创建新树
// 之前：
<div>
  <Counter />
</div>

// 之后：
<span>
  <Counter />  {/* 即使内部相同，也会被销毁重建 */}
</span>
```

**优化建议：** 避免在条件判断中改变根元素的类型

```jsx
// ❌ 不好的做法
{condition ? (
  <div><Component /></div>  // div → span 类型变化
) : (
  <span><Component /></span>
)}

// ✅ 好的做法
<div className="wrapper">
  {condition ? <ComponentA /> : <ComponentB />}
</div>
```

#### 策略二：组件的比较（Component）

对于同一类型的组件，React 会更新组件实例的 props，并调用 `componentWillReceiveProps`（类组件）或重新执行函数组件。

**关键点：** 组件实例保持不变，只更新输入。

```jsx
// 组件类型相同 → 复用实例，更新 props
<Avatar user={user1} />  →  <Avatar user={user2} />
// Avatar 组件实例被复用，只是接收了新的 props
```

#### 策略三：子元素列表的比较（Child Reconciliation）

这是最复杂也最需要优化的部分。

**无 key 的情况：**

```jsx
// 初始
<ul>
  <li>第一项</li>    // index 0
  <li>第二项</li>    // index 1
  <li>第三项</li>    // index 2
</ul>

// 在开头插入新项
<ul>
  <li>新增项</li>    // index 0 ← 这里！
  <li>第一项</li>    // index 1 → 原来是 0
  <li>第二项</li>    // index 2 → 原来是 1
  <li>第三项</li>    // index 3 → 原来是 2
</ul>

// React 的处理（按 index 比较）：
// index 0: "第一项" vs "新增项" → 修改为 "新增项"
// index 1: "第二项" vs "第一项" → 修改为 "第一项"
// index 2: "第三项" vs "第二项" → 修改为 "第二项"
// 新增 index 3: "第三项"
// 结果：所有元素都变了！效率很低 ❌
```

**使用 key 的情况：**

```jsx
// 使用唯一 ID 作为 key
<li key="1">第一项</li>
<li key="2">第二项</li>
<li key="3">第三项</li>

// 插入后：
<li key="new">新增项</li>  // 新增
<li key="1">第一项</li>    // 保持不变 ✓
<li key="2">第二项</li>    // 保持不变 ✓
<li key="3">第三项</li>    // 保持不变 ✓

// React 的处理：
// 只需插入一个新的元素！效率很高 ✅
```

**Key 的选择原则：**
- ✅ 使用稳定、唯一的 ID（如数据库主键）
- ⚠️ 可以使用 index（仅当列表静态且不变时）
- ❌ 不要使用随机数（每次渲染都变）
- ❌ 不要使用可能重复的字段

---

## 🏗️ React 内部架构

### 核心包结构

React 代码库分为多个核心包：

| 包名 | 功能 |
|------|------|
| `react` | 公共 API（React、Components、Hooks 等） |
| `react-dom` | DOM 渲染器（浏览器环境） |
| `react-reconciler` | 协调器（构建器无关的核心逻辑） |
| `scheduler` | 调度器（任务优先级管理） |
| `react-art` | Canvas/SVG 渲染 |

### 包之间的关系

```
用户代码 (App)
    ↓ 调用
react (API 层)
    ↓ 内部调用
react-dom / react-native (Renderer - 平台相关)
    ↓ 内部调用
react-reconciler (Reconciler - 平台无关)
    ↓ 内部调用
scheduler (Scheduler - 任务调度)
```

### Fiber 节点结构

Fiber 是 React 内部工作的核心数据结构：

```javascript
// 简化的 Fiber 节点结构
function FiberNode(tag, pendingProps, key) {
  // === 实例相关 ===
  this.tag = tag;                    // 组件类型标记
  this.key = key;                    // key
  this.type = null;                  // 函数/类/字符串
  this.stateNode = null;            // DOM 元素/组件实例
  
  // === 树结构 ===
  this.return = null;               // 父 fiber
  this.child = null;                // 第一个子 fiber
  this.sibling = null;              // 下一个兄弟 fiber
  this.index = 0;                   // 在兄弟中的索引
  
  // === Props ===
  this.pendingProps = pendingProps; // 新 props
  this.memoizedProps = null;        // 上一次渲染的 props
  
  // === State/Hooks ===
  this.memoizedState = null;        // 上一次的状态
  this.updateQueue = null;          // 待处理的更新队列
  
  // === Effects ===
  this.flags = NoFlags;             // 副作用标记
  this.subtreeFlags = NoFlags;      // 子树副作用
  this.deletions = null;            // 待删除的子节点
  
  // === 双缓存 ===
  this.alternate = null;            // 对应的另一个树的 fiber
  
  // === 调度 ===
  this.lanes = NoLanes;             // 该 fiber 涉及的 lanes
  this.childLanes = NoLanes;        // 子树的 lanes
}
```

### Fiber 树的结构

React 维护两棵 Fiber 树：

```
currentTree (当前屏幕显示的内容)
    │
    ├── rootFiber
    │       ├── App
    │       │   ├── Header
    │       │   └── Content
    │       │       ├── Sidebar
    │       │       └── Main
    │       └── Footer
    
workInProgressTree (正在构建的新树)
    │
    ├── rootFiber (alternate ↔ currentTree.rootFiber)
    │       ├── App (alternate ↔ currentTree.App)
    │       │   ├── Header (alternate ↔ ...)
    │       │   └── Content (alternate ↔ ...)
    │       │       ├── Sidebar (alternate ↔ ...)
    │       │       └── Main (alternate ↔ ...)
    │       └── Footer (alternate ↔ ...)

完成 commit 后，两棵树互换引用
```

---

## 📊 更新的生命周期

### 同步更新流程

```javascript
// 1. 创建更新
const update = createUpdate(eventTime, lane);
update.payload = payload;
enqueueUpdate(fiber, update);

// 2. 调度更新
const root = markUpdateLaneFromFiberToRoot(fiber);
ensureRootIsScheduled(root, eventTime);

// 3. 执行工作循环
performSyncWorkOnRoot(root);

// 4. 提交更改
commitRoot(root);
```

### 并发更新流程（Concurrent Mode）

```javascript
// 1. 创建更新（带优先级）
const lane = requestUpdateLane(fiber);
const update = createUpdate(eventTime, lane);

// 2. 并发模式下的调度
scheduleUpdateOnFiber(fiber, lane, eventTime);

// 3. 可中断的工作循环
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
  
  // 如果还有工作但时间片用完，暂停并让出控制权
}

// 4. 当再次获得时间片时继续
function flushWork(currentTime, transitions) {
  return workLoop(Sync, false, currentTime, transitions);
}
```

---

## 🧪 调试与理解内部机制

### 使用 React DevTools

1. **Components 面板**: 查看 Fiber 树结构和 props/state
2. **Profiler 面板**: 录制渲染性能
3. **Settings**: 启用额外调试选项

### 内部调试工具

```jsx
// 开启详细日志
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from 'react';

const internals = __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

// 追踪渲染原因（React 18+）
// 安装 @welldone-software/why-did-you-render
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, {
  trackAllPureComponents: true,
});
```

### 性能分析标记

```jsx
// 使用 Profiler API
import { Profiler } from 'react';

function onRenderCallback(
  id,              // Profiler 树的 id ("App", "Header" 等)
  phase,           // "mount" 或 "update"
  actualDuration,  // 本次提交渲染耗时
  baseDuration,    // 不使用 memoization 的预估耗时
  startTime,       // React 开始渲染的时间戳
  commitTime,      // React 提交的时间戳
  interactions     // 本次更新的交互集合
) {
  console.log(`${id} ${phase}:`, {
    actualDuration: `${actualDuration.toFixed(2)}ms`,
    baseDuration: `${baseDuration.toFixed(2)}ms`,
  });
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

---

## 📚 延伸阅读

### 源码学习路径

1. **入门**: 阅读 [React 源码解析](https://react.jokcy.me/)
2. **深入**: 克隆 React 源码仓库，添加注释
3. **实践**: 尝试实现简化版的 React（如 [preact](https://github.com/preactjs/preact)、[mini-react](https://github.com/hujiulong/blog/issues/16)）

### 关键源文件

```
packages/react/src/
├── React.js                 # 公共 API 入口
├── ReactHooks.js           # Hooks 实现
└── ReactBaseClasses.js     # Component/PureComponent

packages/react-reconciler/src/
├── ReactFiberWorkLoop.js   # 工作循环（核心调度）
├── ReactFiberBeginWork.js  # 开始处理 fiber
├── ReactFiberCompleteWork.js # 完成 fiber 处理
└── ReactFiberCommitWork.js # 提交阶段

packages/scheduler/src/
├── Scheduler.js            # 调度器核心
└── SchedulerMinHeap.js     # 优先级队列（小顶堆）

packages/react-dom/src/
├── ReactDOM.js            # ReactDOM API
├── ReactDOMLegacy.js      # 旧版 API（render/hydrate）
└── ReactDOMHostConfig.js   # Host Config（平台特定配置）
```

---

## ✅ 阶段检查清单

- [ ] 理解 Virtual DOM 的概念和优势
- [ ] 掌握 JSX 到 React.createElement 的编译过程
- [ ] 理解 Diff 算法的三大策略和 Key 的重要性
- [ ] 了解 React 的渲染流程（Render → Commit）
- [ ] 熟悉 Fiber 数据结构和双缓存机制
- [ ] 能够使用工具分析和诊断渲染问题

---

## 🔗 下一步

掌握了基础原理后，让我们深入了解 **Fiber 架构**！

[→ 27 - Fiber 架构](../27-fiber-architecture/)
