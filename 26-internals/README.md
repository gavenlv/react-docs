# 26 - React 内部原理

> **学习建议：** 本章是 React 高级进阶内容。如果你刚学完基础，不用担心完全理解每个细节。建议先建立整体认知，以后需要深入时再回来复习。

---

## 🎯 本节目标
- 理解 React 的核心设计理念
- 掌握虚拟 DOM 和 Diff 算法的工作机制
- 了解调度系统（Scheduler）和渲染流程
- 为深入学习 Fiber 和并发模式打下基础

---

## 💡 先用一个故事来理解 React 的核心思想

想象你在管理一个**大型餐厅的菜单展示板**：

- **传统方式（命令式）**：每次菜品变了，你都要亲自走到展示板前，擦掉旧的菜名，用笔写上新的菜名。一个字一个字地改。
- **React 方式（声明式）**：你只需要告诉助手"展示板应该显示什么"，助手会自动计算哪些菜变了、哪些没变，然后只修改需要改的部分。

React 就是那个"聪明的助手" —— 你只管描述 UI 应该长什么样，它负责高效地更新真实页面。

---

## 📖 React 核心概念

### 1. 声明式编程

#### 是什么？

**声明式编程**就是：你告诉计算机"我要什么结果"，而不是"一步步怎么做"。

**命令式**（ Imperative）：告诉计算机每一步怎么做
**声明式**（ Declarative）：告诉计算机你想要什么

#### 类比

- **命令式**就像给出租车司机说："往前开200米，左转，再开500米，右转，到了"
- **声明式**就像给出租车司机说："我要去天安门"

```jsx
// 命令式：一步一步告诉浏览器怎么做（传统 DOM 操作）
// 1. 找到元素
const titleEl = document.getElementById('title');
const countEl = document.getElementById('count');
const btnEl = document.getElementById('btn');

// 2. 修改内容
countEl.textContent = count;

// 3. 绑定事件
btnEl.addEventListener('click', () => {
  count++;
  countEl.textContent = count;
  if (count > 10) {
    titleEl.style.color = 'red';
  }
});

// 声明式：描述 UI 应该长什么样（React）
function Counter({ count, onIncrement }) {
  return (
    <div>
      <h1 style={{ color: count > 10 ? 'red' : 'black' }}>
        计数器
      </h1>
      <p>当前值: {count}</p>
      <button onClick={onIncrement}>+1</button>
    </div>
  );
}
// 你不需要操心 DOM 怎么更新，React 自动帮你处理！
```

#### 为什么 React 选择声明式？

| 对比 | 命令式 | 声明式 |
|------|--------|--------|
| 代码量 | 多（每个步骤都要写） | 少（描述结果即可） |
| 维护性 | 差（改动一处可能影响多处） | 好（UI 和状态一一对应） |
| 出Bug概率 | 高（手动操作容易遗漏） | 低（框架保证正确性） |
| 学习成本 | 低（直觉上好理解） | 稍高（需要理解状态驱动UI） |

### 2. 虚拟 DOM（Virtual DOM）

#### 是什么？

虚拟 DOM 是 React 用 **JavaScript 对象**来描述真实 DOM 结构的一种技术。你可以把它理解为"真实 DOM 的复印件"。

#### 为什么需要它？

直接操作真实 DOM 的代价很高：

1. **性能开销大**：每次修改 DOM 都会触发浏览器的"重排"（reflow，重新计算布局）和"重绘"（repaint，重新绘制）
2. **跨浏览器兼容**：不同浏览器的 DOM 实现有差异
3. **难以优化**：大量手动 DOM 操作难以维护和优化

**类比：** 想象你要装修房子：
- **没有虚拟 DOM**：每次改一个家具，工人就要跑到房子里搬一次，改完再搬回来
- **有虚拟 DOM**：你先在图纸上画好所有要改的地方，然后一次性告诉工人"按这个图纸改"，工人只改需要改的部分

#### 工作原理

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   State      │ ──▶ │  虚拟 DOM 树      │ ──▶ │  真实 DOM    │
│  (数据)       │     │  (JavaScript 对象) │     │  (浏览器)    │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    Diff 算法比较
                    计算最小变更
```

**步骤：**
1. 你的状态（State）发生变化
2. React 生成新的虚拟 DOM 树
3. React 把新树和旧树进行对比（Diff），找出差异
4. React 只把差异部分应用到真实 DOM（最小化操作）

#### 虚拟 DOM 的本质

- 用 JavaScript 对象表示 DOM 结构
- 在内存中进行计算和比较
- 批量更新，最小化真实 DOM 操作

### 3. JSX 到 Virtual DOM 的转换

#### 是什么？

JSX 是 React 提供的一种语法糖，让你可以在 JavaScript 中写类似 HTML 的代码。但浏览器不认识 JSX，所以需要编译转换。

#### 怎么转换？

```jsx
// 第1步：你写的 JSX（语法糖，看起来像HTML）
const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// 第2步：Babel 编译后 → 调用 React.createElement()
const element = React.createElement(
  'div',                          // 第1个参数：元素类型
  { className: 'container' },     // 第2个参数：属性对象（props）
  // 第3个及之后的参数：子元素（children）
  React.createElement('h1', null, 'Hello'),
  React.createElement('p', null, 'World')
);

// 第3步：React.createElement() 返回的虚拟 DOM 对象
{
  type: 'div',           // 元素类型
  props: {
    className: 'container',  // 属性
    children: [              // 子元素
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
  key: null,              // key（用于列表优化）
  ref: null               // ref（用于直接访问DOM）
}
```

#### 为什么要了解这个？

- 当你遇到 "React.createElement is not a function" 之类的错误时，你就知道是编译出了问题
- 理解了底层机制，就能更好地理解 React 的工作方式
- 面试经常问 📝

---

## 🔄 协调与渲染

### 渲染流程概览

#### 是什么？

当你的数据变化时，React 会经历两个阶段来完成 UI 更新：

1. **Render 阶段**（可以被打断）：计算 UI 应该长什么样
2. **Commit 阶段**（不可打断）：把计算结果应用到真实 DOM

#### 类比

- **Render 阶段**就像建筑师在图纸上画设计图（可以随时擦掉重画）
- **Commit 阶段**就像施工队按图纸实际建造（一旦开始就不能停）

```
State/Props 变化
      ↓
┌─────────────────────────────────────────┐
│           Render 阶段                     │
│  （纯函数，可以被打断）                    │
│                                          │
│  • 调用组件函数生成新的 Virtual DOM        │
│  • 不涉及任何副作用（不操作真实DOM）        │
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

**1. 触发更新的方式**

```jsx
// 多种触发更新的方式
setState(newValue);              // State 变化：最常见
forceUpdate();                  // 强制更新：一般不推荐
父组件重新渲染导致 props 变化    // Props 变化：子组件被动更新
Context 值变化                   // Context 变化：消费该Context的组件更新
```

**2. 创建 Update 对象**

每个状态更新都会创建一个 Update 对象：

```javascript
// Update 的结构（简化版）
const update = {
  action: action,          // 更新内容（值或函数）
  priority: priority,      // 优先级（高/中/低）
  tag: tag,                // 更新类型（ReplaceState、ForceUpdate 等）
  next: null               // 链表指针（指向下一个更新）
};
```

**3. 调度更新**

根据优先级决定何时执行更新：

```javascript
// Scheduler 根据优先级安排任务
if (isHighPriority(update)) {
  // 高优先级：用户正在交互，需要立即响应
  scheduleImmediateWork(render);
} else if (isUserBlockingPriority(update)) {
  // 中优先级：比如页面切换动画
  scheduleCallback(NORMAL_PRIORITY_TASK, render);
} else {
  // 低优先级：比如后台数据分析
  scheduleCallback(IDLE_PRIORITY_TASK, render);
}
```

---

## 🔍 Reconciliation（协调）算法

### 是什么？

React 通过对比新旧两棵虚拟 DOM 树，确定如何最高效地更新 UI。这个过程称为**协调（Reconciliation）**，核心是 **Diff 算法**。

### 为什么叫"协调"？

因为 React 不是简单地把旧树删掉、新树建起来（那样效率太低），而是像一个聪明的编辑在"协调"两版稿件，找出最小的改动。

### Diff 算法的三个假设

> **重要：** 为了把时间复杂度从 O(n³) 降低到 O(n)，Diff 算法做了三个大胆的假设：

| 假设 | 含义 | 违反的后果 |
|------|------|-----------|
| 1. 不同类型 → 不同树 | `<div>` 变成 `<span>`，会销毁重建 | 不能频繁切换根元素类型 |
| 2. 通过 key 识别稳定元素 | 有相同 key 的元素被视为同一个 | key 必须稳定且唯一 |
| 3. 开发者通过 key 暗示稳定性 | React 信任你给的 key | 不要用随机数做 key |

### Diff 策略详解

#### 策略一：树层级的比较（Tree Level）

React **只比较同一层级的节点**，不会跨层级比较。这意味着如果根节点类型不同，整个树都会被销毁重建。

```jsx
// 如果根节点类型不同 → 销毁旧树，创建新树
// 之前：
<div>
  <Counter />
</div>

// 之后：
<span>
  <Counter />  {/* 虽然 Counter 没变，但它的父节点从 div 变成了 span，所以会被销毁重建！ */}
</span>
```

**优化建议：** 避免在条件判断中改变根元素的类型

```jsx
// ❌ 不好的做法：根元素类型会变化
{condition ? (
  <div><Component /></div>  // div → span，类型变化导致子树全部重建
) : (
  <span><Component /></span>
)}

// ✅ 好的做法：保持外层元素类型不变，只切换内部组件
<div className="wrapper">
  {condition ? <ComponentA /> : <ComponentB />}
</div>
```

#### 策略二：组件的比较（Component）

对于同一类型的组件，React 会复用组件实例，只更新 props。

**类比：** 就像你换了一身衣服（更新 props），但你还是你（同一个组件实例）。

```jsx
// 组件类型相同 → 复用实例，更新 props
<Avatar user={user1} />  →  <Avatar user={user2} />
// Avatar 组件实例被复用，只是接收了新的 user props
// 组件内部的状态（state）会保留！
```

#### 策略三：子元素列表的比较（Child Reconciliation）

这是最复杂也最需要优化的部分。

**无 key 的情况（默认按索引比较）：**

```jsx
// 初始状态
<ul>
  <li>第一项</li>    // 索引 0
  <li>第二项</li>    // 索引 1
  <li>第三项</li>    // 索引 2
</ul>

// 在开头插入新项
<ul>
  <li>新增项</li>    // 索引 0 ← 变了！
  <li>第一项</li>    // 索引 1（原来是0）
  <li>第二项</li>    // 索引 2（原来是1）
  <li>第三项</li>    // 索引 3（原来是2）
</ul>

// React 按索引比较的处理：
// 索引 0: "第一项" → "新增项"  → 修改文本 ❌
// 索引 1: "第二项" → "第一项"  → 修改文本 ❌
// 索引 2: "第三项" → "第二项"  → 修改文本 ❌
// 新增索引 3:                → 新建元素
// 结果：所有元素都被修改了！效率很低 ❌
```

**使用 key 的情况：**

```jsx
// 使用唯一 ID 作为 key
<li key="1">第一项</li>
<li key="2">第二项</li>
<li key="3">第三项</li>

// 插入后：
<li key="new">新增项</li>  // React 发现是新的 key → 新建 ✅
<li key="1">第一项</li>    // key=1 没变 → 保持不变 ✅
<li key="2">第二项</li>    // key=2 没变 → 保持不变 ✅
<li key="3">第三项</li>    // key=3 没变 → 保持不变 ✅

// React 的处理：只需要插入一个新元素！效率很高 ✅
```

#### Key 的选择原则

| 做法 | 评价 | 说明 |
|------|------|------|
| ✅ 使用数据库 ID | 最好 | `key={item.id}`，稳定且唯一 |
| ⚠️ 使用 index | 谨慎 | 仅当列表**静态不变**时才用 |
| ❌ 使用随机数 | 禁止 | 每次渲染都变，失去意义 |
| ❌ 使用可能重复的字段 | 禁止 | 两个元素有相同 key 会导致 bug |

```jsx
// ❌ 错误：使用随机数作为 key
{items.map(item => (
  <ListItem key={Math.random()} item={item} />
))}

// ❌ 错误：使用 index 作为 key（列表会变动时）
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}

// ✅ 正确：使用唯一 ID 作为 key
{todos.map(todo => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

---

## 🏗️ React 内部架构

### 核心包结构

React 代码库分为多个核心包，每个包负责不同的功能：

| 包名 | 功能 | 类比 |
|------|------|------|
| `react` | 公共 API（React、Components、Hooks 等） | 餐厅的**菜单**（你看到的部分） |
| `react-dom` | DOM 渲染器（浏览器环境） | 餐厅的**厨师**（在浏览器上做菜） |
| `react-reconciler` | 协调器（平台无关的核心逻辑） | 餐厅的**经理**（协调所有人） |
| `scheduler` | 调度器（任务优先级管理） | 餐厅的**服务员调度系统** |
| `react-art` | Canvas/SVG 渲染 | 餐厅的**外卖部门** |

### 包之间的关系

```
用户代码 (App)
    ↓ 调用
react (API 层)          ← 你直接使用的包
    ↓ 内部调用
react-dom / react-native (Renderer - 平台相关)  ← 负责渲染到具体平台
    ↓ 内部调用
react-reconciler (Reconciler - 平台无关)         ← 核心协调逻辑
    ↓ 内部调用
scheduler (Scheduler - 任务调度)                  ← 决定什么时候做什么事
```

### Fiber 节点结构

Fiber 是 React 内部工作的核心数据结构。你可以把它理解为 React 内部的"工作单元" —— 每个 React 元素都对应一个 Fiber 节点。

```javascript
// 简化的 Fiber 节点结构（真实源码有更多属性）
function FiberNode(tag, pendingProps, key) {
  // === 实例相关 ===
  this.tag = tag;                    // 组件类型标记（函数组件/类组件/HTML元素等）
  this.key = key;                    // key（用于 diff 优化）
  this.type = null;                  // 函数/类/字符串（如 'div' 或 MyComponent）
  this.stateNode = null;            // DOM 元素或组件实例（真实的节点引用）

  // === 树结构（通过这三个属性组成树） ===
  this.return = null;               // 父 Fiber（指向上面的节点）
  this.child = null;                // 第一个子 Fiber（指向下面的第一个节点）
  this.sibling = null;              // 下一个兄弟 Fiber（指向右边的节点）
  this.index = 0;                   // 在兄弟中的索引位置

  // === Props ===
  this.pendingProps = pendingProps; // 新的 props（即将使用的）
  this.memoizedProps = null;        // 上一次渲染使用的 props（旧的）

  // === State/Hooks ===
  this.memoizedState = null;        // 上一次渲染后的 state（Hooks 链表头）
  this.updateQueue = null;          // 待处理的更新队列

  // === Effects（副作用标记） ===
  this.flags = NoFlags;             // 当前节点需要执行的副作用（如插入/更新/删除）
  this.subtreeFlags = NoFlags;      // 子树中存在的副作用标记
  this.deletions = null;            // 待删除的子节点列表

  // === 双缓存（核心！） ===
  this.alternate = null;            // 对应另一棵树中的 fiber 节点

  // === 调度 ===
  this.lanes = NoLanes;             // 该 fiber 涉及的优先级车道
  this.childLanes = NoLanes;        // 子树涉及的优先级车道
}
```

### Fiber 树的结构

React 维护**两棵** Fiber 树（双缓存技术）：

```
currentTree（当前屏幕显示的内容 —— "当前版"）
    │
    ├── rootFiber
    │       ├── App
    │       │   ├── Header
    │       │   └── Content
    │       │       ├── Sidebar
    │       │       └── Main
    │       └── Footer

workInProgressTree（正在构建的新树 —— "草稿版"）
    │
    ├── rootFiber (alternate ↔ currentTree.rootFiber)
    │       ├── App (alternate ↔ currentTree.App)
    │       │   ├── Header (alternate ↔ ...)
    │       │   └── Content (alternate ↔ ...)
    │       │       ├── Sidebar (alternate ↔ ...)
    │       │       └── Main (alternate ↔ ...)
    │       └── Footer (alternate ↔ ...)

完成 commit 后，两棵树互换引用（"草稿版"变成"当前版"）
```

**类比：** 就像你用 Word 编辑文档时，你看到的永远是"当前版"，但背后 Word 在维护一个"草稿版"。当你在草稿中改完后，Word 会把草稿提交为当前版。

---

## 📊 更新的生命周期

### 同步更新流程（React 17 及之前的 Legacy Mode）

```javascript
// 简化的同步更新流程
// 1. 创建更新
const update = createUpdate(eventTime, lane);
update.payload = payload;
enqueueUpdate(fiber, update);

// 2. 调度更新
const root = markUpdateLaneFromFiberToRoot(fiber);
ensureRootIsScheduled(root, eventTime);

// 3. 执行工作循环（同步，不可中断）
performSyncWorkOnRoot(root);

// 4. 提交更改（应用到真实 DOM）
commitRoot(root);
```

### 并发更新流程（React 18 的 Concurrent Mode）

```javascript
// 简化的并发更新流程
// 1. 创建更新（带优先级）
const lane = requestUpdateLane(fiber);
const update = createUpdate(eventTime, lane);

// 2. 并发模式下的调度（可以被中断）
scheduleUpdateOnFiber(fiber, lane, eventTime);

// 3. 可中断的工作循环（核心区别！）
function workLoopConcurrent() {
  // 只要还有工作要做，且还没有超过时间限制
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }

  // 如果还有工作但时间片用完了 → 暂停，让出控制权
  // 等下一次有时间了再继续
}

// 4. 当再次获得时间片时继续
function flushWork(currentTime, transitions) {
  return workLoop(Sync, false, currentTime, transitions);
}
```

### 同步 vs 并发的对比

| 对比 | 同步更新 | 并发更新 |
|------|---------|---------|
| 是否可中断 | ❌ 不可中断，一口气做完 | ✅ 可中断，做一点歇一下 |
| 用户感知 | 复杂页面会卡顿 | 流畅，输入不卡 |
| 完成顺序 | 按提交顺序 | 高优先级先完成 |
| API | `ReactDOM.render()` | `createRoot().render()` |

---

## 🧪 调试与理解内部机制

### 使用 React DevTools

React DevTools 是理解 React 内部机制的最佳工具：

1. **Components 面板**：查看 Fiber 树结构和 props/state
2. **Profiler 面板**：录制渲染性能，看每个组件渲染花了多长时间
3. **Settings**：启用额外调试选项

### 内部调试工具

```jsx
// ⚠️ 警告：以下 API 是 React 内部 API，不要在生产代码中使用！

// 开启详细日志
import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from 'react';
// 名字都告诉你了：用了你就被开除 😄

const internals = __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

// ✅ 推荐使用第三方工具代替
// 追踪渲染原因（React 18+）
// 安装：npm install @welldone-software/why-did-you-render
import whyDidYouRender from '@welldone-software/why-did-you-render';

whyDidYouRender(React, {
  trackAllPureComponents: true,
});
```

### 性能分析标记

```jsx
// 使用 Profiler API 追踪组件渲染性能
import { Profiler } from 'react';

// 渲染回调函数
function onRenderCallback(
  id,              // Profiler 的 id（如 "App", "Header"）
  phase,           // "mount"（首次渲染）或 "update"（更新）
  actualDuration,  // 本次提交渲染实际耗时
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

// 用 Profiler 包裹组件
function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComplexComponent />
    </Profiler>
  );
}
```

---

## 📚 延伸阅读

### 源码学习路径

1. **入门**：阅读 [React 源码解析](https://react.jokcy.me/)
2. **深入**：克隆 React 源码仓库，添加注释
3. **实践**：尝试实现简化版的 React（如 [preact](https://github.com/preactjs/preact)、[mini-react](https://github.com/hujiulong/blog/issues/16)）

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

## 📝 练习题

### 练习1：Diff 算法理解（基础题）

思考以下场景中 React 会做什么：

1. `<div>` 变成 `<section>`，但子元素完全相同 → React 会？
2. `<ul>` 中有三个 `<li>`，删除第一个 → React 会？
3. 列表有 100 个元素，用 index 做 key，在中间插入一个 → React 会？

### 练习2：渲染流程追踪（进阶题）

假设有如下组件树：
```
App
├── Header
├── Content
│   ├── Sidebar
│   └── Main
└── Footer
```

当 `Content` 的 state 变化时：
1. 哪些组件会重新渲染？
2. Render 阶段会做什么？
3. Commit 阶段会做什么？

### 练习3：实现简化版 Virtual DOM（高级题）

尝试实现一个迷你版的 Virtual DOM：
1. 实现 `createElement` 函数
2. 实现 `render` 函数（将虚拟 DOM 渲染到真实 DOM）
3. 实现 `diff` 函数（比较新旧虚拟 DOM，返回最小操作集）
4. 实现 `patch` 函数（将差异应用到真实 DOM）

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
