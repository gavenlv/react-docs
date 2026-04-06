# 27 - Fiber 架构

## 🎯 本节目标
- 深入理解 Fiber 架构的设计动机和工作原理
- 掌握 Fiber 节点的数据结构和链表遍历方式
- 理解双缓冲技术和时间切片的实现
- 为理解并发特性奠定坚实基础

---

## 📖 为什么需要 Fiber？

### Stack Reconciler（React 15 及之前）的问题

**同步递归更新：**

```javascript
// 旧版 React 的递归协调过程
function reconcile(vNode, domNode) {
  // 递归处理整个树，一旦开始就不能中断
  const newDom = createDOMFromVNode(vNode);
  
  vNode.children.forEach(child => {
    reconcile(child, newDom);  // 深度优先，同步递归
  });
  
  replaceNode(domNode, newDom);
}
```

**问题：**
1. **不可中断**: 一旦开始就必须完成，阻塞主线程
2. **无优先级**: 所有更新同等重要
3. **用户体验差**: 复杂应用会出现卡顿（Jank）
4. **无法利用空闲时间**: 主线程忙时无法做其他事情

### Fiber Reconciler 的解决方案

```
Stack Reconciler（递归）         Fiber Reconciler（迭代 + 链表）
┌─────────────────────┐          ┌─────────────────────────┐
│ function A() {      │          │ A → B → D → E → C → F  │
│   B();              │  ───▶     │ ↘           ↑          │
│   C();              │          │  E → G     │          │
│ }                   │          └─────────────────────────┘
│ function B() {      │          可中断的迭代过程
│   D();
│   E();
│ }
```

**Fiber 的核心思想：**
- 将递归改为**基于链表的迭代**
- 工作可以被**分割成小的单元**
- 支持**中断和恢复**
- 支持为不同的更新设置**优先级**

---

## 🏗️ Fiber 数据结构深度解析

### 完整的 Fiber 节点属性

```typescript
interface Fiber {
  // ===== 标记 =====
  tag: WorkTag;                    // 组件类型标记（Function/Class/Host等）
  key: Key | null;                 // 唯一标识符
  elementType: any;                // 函数/类/字符串
  type: any;                       // 同 elementType（有时会优化）
  stateNode: any;                  // DOM节点、组件实例、或null

  // ===== 树结构 =====
  return: Fiber | null;            // 父节点
  child: Fiber | null;             // 第一个子节点
  sibling: Fiber | null;           // 下一个兄弟节点
  index: number;                   // 在父节点的children中的索引

  ref: Ref | null;                 // ref引用

  // ===== 新的props =====
  pendingProps: any;               // 从父组件传入的新props
  memoizedProps: any;              // 上次渲染使用的props

  // ===== 状态 =====
  memoizedState: any;              // 上次渲染后的state（Hooks链表头）
  updateQueue: mixed;              // 状态更新队列

  // ===== 副作用 =====
  flags: Flags;                    // 副作用标志位
  subtreeFlags: Flags;             // 子树中存在的副作用标志
  deletions: Array<Fiber> | null;  // 要删除的子节点列表

  // ===== 双缓存 =====
  alternate: Fiber | null;         // 对应另一棵树中的fiber节点

  // ===== Lane模型 =====
  lanes: Lanes;                    // 本节点涉及的更新优先级
  childLanes: Lanes;               // 子树涉及的更新优先级

  // ===== 调试 =====
  _debugID?: number;
  _debugSource?: Source | null;
  _debugOwner?: Fiber | null;
}
```

### Tag 类型（WorkTag）

```javascript
export const FunctionComponent = 0;
export const ClassComponent = 1;
export const IndeterminateComponent = 2;  // 不知道是函数还是类
export const HostRoot = 3;                // Root Fiber（ReactDOM.render的容器）
export const HostPortal = 4;              // Portal
export const HostComponent = 5;           // HTML元素（div, span等）
export const HostText = 6;                // 文本节点
export const Fragment = 7;                // React.Fragment
export const Mode = 8;                    // StrictMode/ConcurrentMode
export const ContextConsumer = 9;
export const ContextProvider = 10;
export const ForwardRef = 11;
export const SuspenseComponent = 13;
export const MemoComponent = 14;
export const SimpleMemoComponent = 15;
// ... 更多
```

### Flags（副作用标志位）

```javascript
// 常见标志
export const Placement = 0b00000000000010;           // 需要插入DOM
export const Update = 0b00000000000100;              // 需要更新属性
export const Deletion = 0b00000000001000;            // 需要删除
export const Passive = 0b000000100000000;            // useEffect/useLayoutEffect
export const Ref = 0b000010000000000;               // ref发生变化

// 组合示例
flags = Placement | Update;  // 同时需要插入和更新
```

---

## 🔗 Fiber 树的遍历

### 深度优先遍历（Depth-First Traversal）

Fiber 使用**深度优先**的方式遍历树：

```
        App (root)
       /    \
    Header  Content
             /    \
          Sidebar  Main

遍历顺序: App → Header → Content → Sidebar → Main
```

### 遍历伪代码

```javascript
let workInProgress = root;

function workLoop() {
  // 第一阶段：向下遍历（beginWork）
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(fiber) {
  // 1. beginWork: 处理当前节点（创建子fiber、diff等）
  beginWork(fiber);
  
  // 2. 如果有子节点，先处理子节点（向下）
  if (fiber.child !== null) {
    return fiber.child;  // 返回下一个要处理的fiber
  }
  
  // 3. 如果没有子节点，完成当前节点（completeWork）
  let sibling = fiber.sibling;
  
  while (sibling !== null) {
    // 4. 如果有兄弟节点，处理兄弟（向右）
    completeWork(fiber);  // 先完成自己
    return sibling;
  }
  
  // 5. 如果既没有子节点也没有兄弟节点，向上返回（回溯）
  completeWork(fiber);
  return fiber.return;  // 返回父节点继续
}
```

### 图解遍历过程

```
初始状态:
    A
   / \
  B   C
 / \
D   E

Step 1: 处理 A (beginWork)
    A* ← 当前
   / \
  B   C
 / \
D   E

Step 2: 有子节点B，进入B
    A
   / \
  B*  C        ← 当前
 / \
D   E

Step 3: 有子节点D，进入D
    A
   / \
  B   C
 / \
D*  E          ← 当前（叶子节点）

Step 4: D没有子节点，completeWork(D)，返回兄弟E
    A
   / \
  B   C
 / \
D✓ E*          ← 当前（completeWork(D)完成）

Step 5: E没有子节点，completeWork(E)，返回父节点B
    A
   / \
  B*  C        ← 当前
 / \
D✓ E✓

Step 6: B的子节点都处理完了，completeWork(B)，返回兄弟C
    A
   / \
  B✓ C*       ← 当前
 / \
D✓ E✓

Step 7: C没有子节点，completeWork(C)，返回父节点A
   A*          ← 当前
  / \
 B✓ C✓
/ \
D✓ E✓

Step 8: A的所有子节点处理完毕，completeWork(A)
  A✓         ← 完成！
 / \
B✓ C✓
/ \
D✓ E✓
```

---

## 💾 双缓冲技术（Double Buffering）

### 什么是双缓冲？

React 维护**两棵 Fiber 树**：
- **currentTree**: 与屏幕上一致的内容
- **workInProgressTree**: 正在构建的新树

### 工作流程

```
初始挂载（Mount）:

1. 创建 rootFiber（current = workInProgress）
2. 构建 workInProgressTree
3. 提交到屏幕
4. workInProgress 变为 current

更新（Update）:

1. 基于 current 复制一份作为 workInProgress
2. 在 workInProgress 上进行 diff 和更新
3. 完成后提交
4. 交换 current 和 workInProgress 引用
```

### 代码示意

```javascript
function prepareFreshStack(root, lanes) {
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  
  // 获取当前的 root fiber
  const workInProgress = root.current;
  // 创建 alternate（复制）
  const workInProgress2 = createWorkInProgress(workInProgress, root.pendingProps);
  
  root.workInProgress = workInProgress2;
  return workInProgress2;
}

function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 首次创建：克隆当前fiber
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    
    // 双向链接
    workInProgress.alternate = current;
    current.alternate = workInProgress;
    
    // ...
  } else {
    // 复用已有的alternate
    workInProgress.pendingProps = pendingProps;
    // 重置一些属性...
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;
  
  return workInProgress;
}
```

### Commit 阶段的切换

```javascript
function commitRoot(root) {
  // 1. 完成的workInProgress成为finishedWork
  const finishedWork = root.finishedWork;
  
  // 2. 应用变更到真实DOM
  commitMutationEffects(root, finishedWork);
  commitLayoutEffects(finishedWork);
  commitPassiveMountEffects(root, finishedWork.root); // useEffect
  
  // 3. 交换current和workInProgress
  root.current = finishedWork;  // workInProgress变成current
  finishedWork.stateNode = root;
  
  // 4. 清理
  root.finishedWork = null;
}
```

---

## ⏱️ 时间切片（Time Slicing）

### 实现原理

利用浏览器的 `requestIdleCallback` 或自定义的调度器，将长时间的任务拆分成小块：

```javascript
// 调度器的核心接口
type Callback = (didTimeout: boolean) => CallbackNode;

function scheduleCallback(
  priorityLevel: PriorityLevel,
  callback: Callback,
  options?: { delay: number }
): CallbackNode;

function cancelCallback(callbackNode: CallbackNode): void;

function getCurrentPriorityLevel(): PriorityLevel;
```

### 工作循环（Work Loop）

```javascript
// 同步模式（不可中断）
function workLoopSync() {
  while (workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}

// 并发模式（可中断）
function workLoopConcurrent() {
  // 只要还有工作要做，且还没有超过时间限制
  while (workInProgress !== null && !shouldYieldToHost()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  // 如果 shouldYield() 返回 true，则中断，等待下一次调度
}
```

### shouldYield 的实现

```javascript
// 简化的 shouldYield
let yieldInterval = 5;  // 默认5ms的时间片
let deadline = 0;

function getCurrentTime() {
  return performance.now();
}

function shouldYieldToHost() {
  // 获取当前时间
  const timeElapsed = getCurrentTime() - deadline;
  
  if (timeElapsed < yieldInterval) {
    // 还没到截止时间，可以继续工作
    return false;
  }
  
  // 时间到了，应该让出主线程
  if (enableIsInputPending) {
    // 检查是否有用户交互正在等待
    if (navigator.scheduling?.isInputPending?.()) {
      return true;  // 用户正在交互，立即让出
    }
  }
  
  return true;  // 超过时间片，让出
}
```

### 调度优先级

```javascript
export const ImmediatePriority = 1;       // 最高：同步任务
export const UserBlockingPriority = 2;    // 用户交互：点击、输入等
export const NormalPriority = 3;          // 默认优先级
export const LowPriority = 4;             // 低优先级： analytics
export const IdlePriority = 5;            // 最低：空闲时才执行
```

---

## 🔄 BeginWork & CompleteWork

### BeginWork（处理 Fiber 节点）

```javascript
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  // 1. 如果current存在且没有pendingWork，尝试复用（bailout）
  if (current !== null) {
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    
    if (
      oldProps === newProps &&
      !hasContextChanged() &&
      !checkScheduledUpdateOrContext(current, renderLanes)
    ) {
      // 可以复用！不需要重新渲染这个fiber及其子树
      didReceiveUpdate = false;
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes
      );
    }
  }
  
  didReceiveUpdate = true;
  
  // 2. 根据tag类型进行不同的处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      
      return updateFunctionComponent(
        null,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      );
    }
    
    case HostComponent: {
      return updateHostComponent(current, workInProgress, renderLanes);
    }
    
    case HostText: {
      return updateHostText(current, workInProgress);
    }
    
    case ContextProvider:
    case ContextConsumer:
    case MemoComponent:
    case SimpleMemoComponent:
    // ... 其他类型
      
    default:
      throw new Error('Unknown unit of work tag');
  }
}
```

### CompleteWork（完成 Fiber 处理）

```javascript
function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  const newProps = workInProgress.pendingProps;
  
  switch (workInProgress.tag) {
    case FunctionComponent:
    case MemoComponent:
    case SimpleMemoComponent:
    case Block: {
      bubbleProperties(workInProgress);  // 将子节点的flags冒泡上来
      return null;
    }
    
    case HostComponent: {
      popHostContext(workInProgress);
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      
      if (current !== null && workInProgress.stateNode != null) {
        // 更新现有DOM节点
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance
        );
        
        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress);  // 标记ref变化
        }
      } else {
        // 创建新的DOM节点
        const instance = createInstance(
          type,
          newProps,
          rootContainerInstance,
          current,
          workInProgress
        );
        
        appendAllChildren(instance, workInProgress, false, false);
        workInProgress.stateNode = instance;
        
        // 处理ref
        if (workInProgress.ref !== null) {
          markRef(workInProgress);
        }
      }
      return null;
    }
    
    case HostText: {
      const newText = newProps;
      
      if (current !== null && current.stateNode != null) {
        const oldText = current.memoizedProps;
        updateHostText(current, oldText, newText);
      } else {
        workInProgress.stateNode = createTextInstance(
          newText,
          rootContainerInstance,
          current,
          workInProgress
        );
      }
      return null;
    }
    
    // ... 其他类型
  }
}
```

---

## 📊 性能影响与优化启示

### 理解 Fiber 后的最佳实践

1. **合理使用 memo 和 useMemo**: 减少不必要的 fiber 处理
2. **避免深层嵌套**: 减少遍历深度
3. **稳定的 key**: 让 diff 更高效
4. **拆分大型组件**: 让更多部分能 bailOut
5. **批量更新 setState**: 减少调度次数

### 常见问题排查

```javascript
// 问题1：为什么会卡顿？
// 可能原因：
// - 单次渲染的fiber数量太多（长列表未虚拟化）
// - 某个beginWork/completeWork耗时过长
// - 低优先级任务被高优先级任务不断抢占

// 解决方案：
// 1. 使用 React DevTools Profiler 定位瓶颈组件
// 2. 虚拟化长列表
// 3. 降低更新频率（防抖/节流）
// 4. 使用 startTransition 标记非紧急更新


// 问题2：为什么更新不生效？
// 可能原因：
// - 错误地修改了state（直接赋值而非setState）
// - 在条件语句中使用Hook
// - 依赖数组不正确导致effect未执行
```

---

## ✅ 阶段检查清单

- [ ] 深刻理解 Stack Reconciler 的局限性和 Fiber 的解决思路
- [ ] 掌握 Fiber 节点的完整数据结构
- [ ] 能够手写 Fiber 树的遍历过程
- [ ] 理解双缓冲技术的实现细节
- [ ] 掌握时间切片和优先级调度的原理
- [ ] 了解 beginWork 和 completeWork 的工作流程

---

## 🔬 Fiber 架构的核心数据结构与算法

### 1. Fiber 节点的完整数据结构解析

#### 所有关键字段逐一解释

```javascript
// React 源码中 Fiber 节点的完整结构（带详细注释）
function FiberNode(tag, pendingProps, key, mode) {

  // ═══════════════════════════════════════════
  //  第一组：静态标识信息（"这个 Fiber 是什么"）
  // ═══════════════════════════════════════════
  this.tag = tag;
  // 告诉 React 这是什么类型的 Fiber
  // 例如：FunctionComponent=0, ClassComponent=1, HostComponent=5(div/span等)
  // React 在 beginWork 中根据 tag 来决定如何处理这个节点

  this.key = key;
  // 你写的 key={item.id} 中的值
  // 用于列表 Diff 时识别"同一个"元素
  // null 表示没有设置 key

  this.elementType = null;
  // 实际的组件类型（function / class / string）
  // 对于 memo 包裹的组件，elementType 是原始组件

  this.type = null;
  // 通常是 elementType 的别名，但某些情况下会优化
  // 对于 HTML 元素：type = 'div', 'span', 'p' 等字符串

  this.stateNode = null;
  // 💡 这是真实世界的"锚点"
  // 对于 HTML 元素：指向真实的 DOM 节点（如 document.createElement('div') 的结果）
  // 对于类组件：指向组件实例（this）
  // 对于函数组件：null（函数组件没有实例）

  // ═══════════════════════════════════════════
  //  第二组：树结构（"Fiber 之间怎么连接"）
  // ═══════════════════════════════════════════
  this.return = null;
  // 指向父 Fiber 节点
  // 为什么叫 return 不叫 parent？
  // 因为 Fiber 使用迭代（非递归）遍历，处理完子节点后要"返回"父节点

  this.child = null;
  // 指向第一个子 Fiber 节点
  // 注意：只有"第一个"子节点！其他子节点通过 sibling 链接

  this.sibling = null;
  // 指向下一个兄弟 Fiber 节点
  // 形成一个单向链表：child → sibling → sibling → ...

  this.index = 0;
  // 在兄弟节点中的索引位置
  // 用于确定插入 DOM 时的位置

  this.ref = null;
  // ref 引用（ref={myRef} 或 ref={createRef()}）
  // Commit 阶段会将 stateNode 赋值给 ref.current

  // ═══════════════════════════════════════════
  //  第三组：输入（"传进来的东西"）
  // ═══════════════════════════════════════════
  this.pendingProps = pendingProps;
  // 📥 新的 props（本次更新传入的）
  // 父组件传递过来的、或 beginWork 计算出来的新属性

  this.memoizedProps = null;
  // 📦 旧的 props（上一次渲染使用的）
  // 用于 bailout 判断：如果 pendingProps === memoizedProps，说明 props 没变

  // ═══════════════════════════════════════════
  //  第四组：状态（"组件的记忆"）
  // ═══════════════════════════════════════════
  this.memoizedState = null;
  // 💡 对函数组件：指向 Hooks 链表的头部
  // 对类组件：指向 this.state
  // 对 HostComponent：null
  //
  // Hooks 链表结构：
  // useState('hello') 的 memoizedState = { memoizedState: 'hello', baseState: 'hello', queue: {...}, next: <下一个Hook> }
  // useEffect(fn, deps) 的 memoizedState = { tag: 'effect', create: fn, deps: [...], next: <下一个Hook> }

  this.updateQueue = null;
  // 待处理的更新队列
  // 每次 setState 都会创建一个 Update 对象，追加到这个队列中
  // 结构：circular linked list（环形链表）
  // shared: { pending: update1 ↔ update2 ↔ update3 ↔ update1 }

  // ═══════════════════════════════════════════
  //  第五组：副作用（"渲染后要做什么"）
  // ═══════════════════════════════════════════
  this.flags = NoFlags;
  // 当前 Fiber 节点需要执行的副作用（位掩码）
  // Placement(0b10): 需要插入DOM
  // Update(0b100): 需要更新属性
  // Deletion(0b1000): 需要删除
  // Passive(0b100000000): useEffect
  // Ref(0b100000000000): ref变化

  this.subtreeFlags = NoFlags;
  // 子树中所有副作用标记的"合并"（冒泡机制）
  // 完全跳过没有 subtreeFlags 的子树，加速遍历

  this.deletions = null;
  // 需要删除的子 Fiber 列表
  // 为什么需要单独的 deletions 数组？
  // 因为删除的节点不在新的 workInProgress 树中
  // 必须单独收集起来，在 Commit 阶段统一处理

  // ═══════════════════════════════════════════
  //  第六组：双缓冲（"两个世界的桥梁"）⭐核心
  // ═══════════════════════════════════════════
  this.alternate = null;
  // 💡 指向另一棵树中对应的 Fiber 节点
  // 如果这个 Fiber 在 current 树中，alternate 指向 workInProgress 树中的对应节点
  // 如果这个 Fiber 在 workInProgress 树中，alternate 指向 current 树中的对应节点
  //
  // 这是 React 双缓冲技术的核心！
  // current 树 ──alternate──▶ workInProgress 树
  //     A  ◄────alternate────▶ A'
  //    / \                      / \
  //   B   C                    B'  C'

  // ═══════════════════════════════════════════
  //  第七组：优先级（"谁先做"）
  // ═══════════════════════════════════════════
  this.lanes = NoLanes;
  // 这个 Fiber 节点上的更新对应的优先级
  // 用二进制位表示（详见 Lane 优先级系统一节）

  this.childLanes = NoLanes;
  // 子树中所有更新的最高优先级
  // 如果 childLanes === NoLanes，说明整个子树都没有待处理的更新
  // → 可以跳过整个子树的遍历（重要的优化）

  // ═══════════════════════════════════════════
  //  第八组：模式与调试
  // ═══════════════════════════════════════════
  this.mode = mode;
  // 并发模式标记
  // NoMode=0, StrictMode=1, ConcurrentMode=2

  // ... 还有若干调试字段（_debugSource, _debugOwner 等）此处省略
}
```

#### Fiber 节点的内存布局可视化

```
一个 Fiber 节点在内存中的样子：

┌──────────────────────────────────────────────────┐
│                  FiberNode                        │
├──────────┬───────────────────────────────────────┤
│ 标识     │ tag │ key │ elementType │ type │ stateNode
├──────────┼───────────────────────────────────────┤
│ 树结构   │ return │ child │ sibling │ index │ ref
├──────────┼───────────────────────────────────────┤
│ 输入     │ pendingProps │ memoizedProps
├──────────┼───────────────────────────────────────┤
│ 状态     │ memoizedState(Hooks链表头) │ updateQueue
├──────────┼───────────────────────────────────────┤
│ 副作用   │ flags │ subtreeFlags │ deletions
├──────────┼───────────────────────────────────────┤
│ 双缓冲   │ alternate ←──→ 另一棵树的对应节点
├──────────┼───────────────────────────────────────┤
│ 优先级   │ lanes │ childLanes
└──────────┴───────────────────────────────────────┘
```

#### current 树 vs workInProgress 树（双缓冲技术详解）

💡 **类比——游戏开发中的"双缓冲"：**

你玩游戏时，画面是60帧/秒（每秒60张图片）。如果游戏引擎直接在屏幕上一笔一笔画，你会看到画面"撕裂"——上半帧是旧画面，下半帧是新画面。

解决方案就是"双缓冲"：
1. 引擎在**后台缓冲区**（你看不到的地方）画好完整的一帧
2. 画完之后，**一瞬间**把后台缓冲区的内容切换到前台（屏幕上）
3. 你看到的永远是完整的画面，从不撕裂

React 的双缓冲完全一样的思路：

```
React 的双缓冲切换过程：

     ┌──────────────┐              ┌──────────────┐
     │  current 树  │   alternate   │ workInProgress│
     │  （用户看到的）│ ◄───────────▶ │  树（后台画布） │
     │              │   双向指针     │              │
     └──────────────┘              └──────────────┘

时间线：
──────────────────────────────────────────────────────▶

阶段1：用户看到 current 树的内容
┌─────────┐          ┌─────────────────┐
│ current │  ◄─alt──▶ │ workInProgress  │
│ (显示中) │          │   （空/旧数据）   │
└─────────┘          └─────────────────┘

阶段2：在 workInProgress 上开始构建新树
┌─────────┐          ┌─────────────────┐
│ current │  ◄─alt──▶ │ workInProgress  │
│ (显示中) │          │  （正在构建中...） │
└─────────┘          └─────────────────┘
  屏幕显示旧内容         后台：执行 beginWork/completeWork

阶段3：workInProgress 构建完成，执行 Commit
┌─────────┐          ┌─────────────────┐
│ current │  ◄─alt──▶ │ workInProgress  │
│ (显示中) │          │  （构建完成！）    │
└─────────┘          └─────────────────┘
  即将被替换              新内容准备好了

阶段4：交换！current 变成旧树，workInProgress 变成 current
┌─────────────────┐    ┌─────────┐
│ workInProgress  │alt▶│ current │
│  (现在是新的     │    │ (旧的   │
│   current！)     │    │  wip)   │
└─────────────────┘    └─────────┘
  屏幕显示新内容           等待下次更新

💡 关键：交换只是改了指针！root.current = finishedWork
```

```javascript
// 交换的核心代码（简化版）
function commitRoot(root) {
  const finishedWork = root.finishedWork;  // workInProgress 树

  // 1. 将变更应用到真实 DOM（此时用户看不到，因为还没切换）
  commitMutationEffects(root, finishedWork);
  commitLayoutEffects(finishedWork);

  // 2. ⭐ 关键一步：交换 current 指针
  root.current = finishedWork;
  // 从此刻起，finishedWork 就是新的 current 树
  // 旧的 current 树变成了 finishedWork.alternate（旧的 workInProgress）

  // 3. 下次更新时，React 会基于新的 current 创建新的 workInProgress
  // 新的 workInProgress 会复用旧 wip 的 Fiber 节点（避免 GC 压力）
}
```

---

### 2. Fiber 的遍历算法：深度优先遍历

#### child → sibling → return 的遍历顺序

React 选择深度优先遍历（DFS）来处理 Fiber 树。这个选择不是随意的，它与 React 的渲染模型密切相关。

```
组件树：
        App
       / | \
     Nav  Main  Footer
         / | \
       Card  List
            / | \
           Li1 Li2 Li3

对应的 Fiber 树结构：
        App
       /    \
     Nav    Main ──── Footer
             |
            Card ──── List
                       |
                      Li1 ──── Li2 ──── Li3
```

💡 **大白话理解遍历方向：**
- `child`：往下走（从父到子）—— "先处理自己的孩子"
- `sibling`：往右走（从左到右）—— "处理完孩子，处理兄弟"
- `return`：往上走（从子到父）—— "所有孩子都处理完了，回到父节点"

```
遍历完整路径：

       App ←───(8) return
      / | \         (3) completeWork
    Nav  Main      /
         |        / (1) beginWork
       Card ─── Main ────(5) child
         |        \
     (2) completeWork  List ────(6) child
                       |
                      Li1 ────(7) child→return (叶子)
                        \
                        Li2 ──── sibling
                          \
                          Li3

beginWork 顺序：App → Nav → Main → Card → List → Li1 → Li2 → Li3
completeWork 顺序：Li3 → Li2 → Li1 → List → Card → Main → Nav → App
（后进先出，类似栈的行为）
```

#### 用具体组件树图示遍历过程

```
假设有以下 JSX：
function App() {
  return (
    <div>                 {/* Fiber A */}
      <Header />          {/* Fiber B */}
      <main>              {/* Fiber C */}
        <Sidebar />       {/* Fiber D */}
        <Content />       {/* Fiber E */}
      </main>
    </div>
  );
}

Fiber 树结构：
        A (div)
       / \
      B   C (main)
         / \
        D   E (Content)

═══════════════════════════════════════════════
步骤 │ 当前Fiber │ 动作          │ child/sibling/return
═══════════════════════════════════════════════
 1   │ A         │ beginWork(A)  │ → child = B
 2   │ B         │ beginWork(B)  │ → child = null
     │           │ completeWork(B)│ → sibling = C
 3   │ C         │ beginWork(C)  │ → child = D
 4   │ D         │ beginWork(D)  │ → child = null
     │           │ completeWork(D)│ → sibling = E
 5   │ E         │ beginWork(E)  │ → child = null
     │           │ completeWork(E)│ → sibling = null
     │           │               │ → return = C
     │           │ completeWork(C)│ → sibling = null
     │           │               │ → return = A
     │           │ completeWork(A)│ → return = null
═══════════════════════════════════════════════
  完成！整棵树处理完毕
═══════════════════════════════════════════════
```

#### 为什么不用广度优先（BFS）？

💡 **类比——读书的方式：**

- **深度优先** = 你读一本书时，一章一章地读。读完第一章的所有内容，再读第二章。这样你总是有完整的上下文。
- **广度优先** = 你同时读所有章节的第一段，然后同时读所有章节的第二段……每章你只读了一小部分，完全没有连贯性。

React 选择 DFS 的技术原因：

| 维度 | 深度优先（DFS） | 广度优先（BFS） |
|------|--------------|--------------|
| **completeWork 的时机** | 处理完所有子节点后才能完成父节点 | 父节点先处理完，子节点还没开始 |
| **DOM 创建时机** | 自底向上创建（先创建叶子节点，再包裹到父节点） | 自顶向下创建（先创建父节点，再插入子节点） |
| **内存占用** | 只需要一个栈，O(h) 其中 h 是树高度 | 需要队列，O(w) 其中 w 是树宽度 |
| **中断/恢复** | 天然支持（记住当前位置即可） | 需要保存更多状态 |
| **subtreeFlags 冒泡** | 天然自底向上（completeWork 时冒泡） | 不自然 |
| **DOM 插入顺序** | 子节点已创建好，直接 appendAllChildren | 需要反复操作同一个父节点 |

```javascript
// DFS 中 DOM 的创建方式（自底向上）
// completeWork(E) → 创建 <Content /> 的 DOM
// completeWork(D) → 创建 <Sidebar /> 的 DOM
// completeWork(C) → 创建 <main> 的 DOM → appendAllChildren(把 D 和 E 插入)
// completeWork(B) → 创建 <Header /> 的 DOM
// completeWork(A) → 创建 <div> 的 DOM → appendAllChildren(把 B 和 C 插入)

// 每个父节点创建时，子节点的 DOM 已经准备好了，可以一次性插入
// 这比"先创建空父节点，再一个一个插入子节点"高效得多
```

#### beginWork 和 completeWork 的执行时机

```javascript
// beginWork：进入节点时调用（"向下走"之前）
// 职责：
// 1. 对比 current 和 workInProgress，判断是否可以 bailout（跳过）
// 2. 根据 tag 调用对应的更新函数（updateFunctionComponent 等）
// 3. 创建子 Fiber 链表（通过 reconcileChildFibers）
// 4. 返回第一个子 Fiber（workInProgress.child）

// completeWork：离开节点时调用（所有子节点都处理完之后）
// 职责：
// 1. 对于 HostComponent/HostText：创建或更新真实 DOM 节点
// 2. 把子节点的 flags 冒泡到 subtreeFlags
// 3. 返回 null（表示"这个节点完成了"）

// 时间线：
// beginWork(A) → beginWork(B) → completeWork(B) → beginWork(C)
//   → beginWork(D) → completeWork(D) → beginWork(E) → completeWork(E)
//   → completeWork(C) → completeWork(A)
```

---

### 3. 时间切片（Time Slicing）的实现原理

#### requestIdleCallback vs MessageChannel vs Scheduler

React 的 Scheduler 没有直接使用 `requestIdleCallback`，而是自己实现了一套基于 `MessageChannel` 的调度机制。原因如下：

```
三种方案的对比：

┌───────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                   │requestIdleCallback│  MessageChannel  │   React Scheduler │
├───────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 调度精度           │ ~50ms            │ ~4-5ms           │ ~5ms             │
│ 兼容性             │ 不支持 Safari    │ 广泛支持         │ 广泛支持          │
│ 是否阻塞主线程      │ 不阻塞           │ 不阻塞           │ 不阻塞           │
│ 是否支持优先级      │ ❌               │ ❌（需自己实现）   │ ✅ 完整优先级系统  │
│ 是否支持过期处理     │ ❌               │ ❌（需自己实现）   │ ✅               │
│ React 是否使用      │ 曾考虑但放弃      │ 底层实现          │ 最终方案          │
└───────────────────┴──────────────────┴──────────────────┴──────────────────┘

💡 为什么不用 requestIdleCallback？
1. Safari 不支持
2. 空闲回调的触发间隔约 50ms，对 60fps 来说太长了
3. 没有优先级概念

💡 为什么用 MessageChannel？
1. 浏览器兼容性好
2. 宏任务（macrotask），不会阻塞微任务
3. React 在其之上构建了完整的优先级调度系统
```

```javascript
// React Scheduler 的核心实现（简化版）
// 基于 MessageChannel 的调度

const channel = new MessageChannel();
const port = channel.port2;

// 收到消息 = 有任务要执行了
channel.port1.onmessage = performWork;

// 任务队列（小顶堆，按过期时间排序）
let taskQueue = [];

// 调度一个新任务
function scheduleCallback(priorityLevel, callback) {
  const currentTime = getCurrentTime();
  const timeout = timeoutsByPriority[priorityLevel];

  const task = {
    callback,                    // 要执行的回调
    priorityLevel,               // 优先级
    expirationTime: currentTime + timeout, // 过期时间
  };

  // 把任务加入队列（按优先级排序）
  push(taskQueue, task);

  // 请求调度
  requestHostCallback();
}

// 向浏览器请求执行时间
function requestHostCallback() {
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    port.postMessage(null);  // ← 通过 MessageChannel 触发 performWork
  }
}

// 实际执行任务的函数
function performWork() {
  const currentTime = getCurrentTime();

  // 取出所有已过期或优先级最高的任务
  while (taskQueue.length > 0) {
    const task = peek(taskQueue);

    // 如果任务还没过期，检查是否应该让出
    if (currentTime < task.expirationTime) {
      if (!shouldYieldToHost()) {
        // 还有时间，继续执行
        const continuationCallback = task.callback(true); // didTimeout = true
        if (typeof continuationCallback === 'function') {
          // 任务没执行完，放回队列继续
          task.callback = continuationCallback;
        }
        continue;
      }
      // 时间到了，让出主线程
      break;
    }

    // 任务已过期，必须执行
    const continuationCallback = task.callback(false); // didTimeout = false
    if (typeof continuationCallback === 'function') {
      // 任务没执行完（比如被 yield 中断了）
      task.callback = continuationCallback;
    } else {
      // 任务完成了，从队列移除
      pop(taskQueue);
    }
  }
}
```

#### React 如何判断"时间到了"？—— 5ms 切片原理

```javascript
// React 的时间切片核心逻辑
let yieldInterval = 5;  // 5ms 的时间片
let deadline = 0;       // 当前时间片的截止时间
let scheduledCallback = null;

// 开始一个新的时间片
function requestHostCallback(callback) {
  scheduledCallback = callback;
  deadline = getCurrentTime() + yieldInterval;
  port.postMessage(null);  // 请求调度
}

// 判断是否应该让出主线程
function shouldYieldToHost() {
  // 方式1：检查是否超过了 5ms 时间片
  if (getCurrentTime() >= deadline) {
    return true;  // 时间到了，让出
  }

  // 方式2：检查是否有用户输入正在等待
  // 这是 Chrome 的实验性 API
  if (typeof navigator !== 'undefined' &&
      navigator.scheduling !== undefined &&
      navigator.scheduling.isInputPending !== undefined) {
    if (navigator.scheduling.isInputPending()) {
      return true;  // 用户在输入（点击、打字等），优先响应用户
    }
  }

  return false;  // 还有时间，继续工作
}
```

#### 为什么是 5ms？（60fps 的帧预算）

```
一帧的时间预算（60fps）：
16.67ms = 1000ms / 60fps

┌─────────────────────────────────────────────────────────────────┐
│  一帧 = 16.67ms                                                  │
├──────────────────┬──────────────────┬────────────────────────────┤
│  React 工作时间   │  浏览器绘制时间   │     空闲时间               │
│  (最多 5ms)      │  (约 10ms)       │  (剩余时间)                │
│                  │                  │                            │
│ ████████         │ ████████████████ │ ░░░░░░░░                   │
│ 0    5ms        │ 5   15ms         │ 15  16.67ms                │
└──────────────────┴──────────────────┴────────────────────────────┘

为什么是 5ms 而不是更多？
- 浏览器需要约 10ms 来执行样式计算 + 布局 + 绘制
- 留出约 1.67ms 的缓冲
- 总共给 React 的预算 ≈ 5ms

如果 React 超过 5ms 会怎样？
→ 浏览器来不及绘制 → 掉帧 → 用户感觉卡顿
→ 输入事件延迟响应 → 用户感觉"不跟手"
```

💡 **类比——厨房做菜：**

一家餐厅每道菜的出菜时间是 16.67 分钟（60道菜/小时）。厨房约定：
- 前 5 分钟：准备食材（React Render）
- 后 11 分钟：烹饪上菜（浏览器绘制）
- 如果准备工作超过 5 分钟，客人等太久会投诉

#### 用代码模拟一个简化版的时间切片调度器

```javascript
// 🎮 一个可以运行的简化版时间切片调度器
// 帮助理解 React Scheduler 的核心原理

class MiniScheduler {
  constructor() {
    this.taskQueue = [];          // 任务队列
    this.isPerformingWork = false; // 是否正在执行
    this.YIELD_INTERVAL = 5;      // 5ms 时间片
  }

  // 添加任务到队列
  scheduleTask(task) {
    this.taskQueue.push({
      callback: task,
      priority: task.priority || 'normal', // 优先级
    });
    this.taskQueue.sort((a, b) => {
      const order = { immediate: 0, high: 1, normal: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    });

    if (!this.isPerformingWork) {
      this.isPerformingWork = true;
      this.performWork();
    }
  }

  // 执行工作（核心循环）
  performWork() {
    const startTime = performance.now();
    const deadline = startTime + this.YIELD_INTERVAL;

    while (this.taskQueue.length > 0) {
      // 🔍 关键：检查时间片是否用完
      if (performance.now() >= deadline) {
        // 时间到了！让出主线程，稍后继续
        console.log(`⏱️ 时间片用完，已工作 ${performance.now() - startTime}ms`);
        console.log(`   剩余任务: ${this.taskQueue.length} 个`);
        // 使用 MessageChannel（或 setTimeout）让出主线程
        channel.port1.postMessage(null);
        return; // ← yield! 暂停执行
      }

      // 取出下一个任务
      const { callback } = this.taskQueue.shift();

      // 执行任务
      // 如果任务返回一个函数，说明它需要继续执行（被 yield 了）
      const continuation = callback();
      if (typeof continuation === 'function') {
        // 任务没执行完，放回队列头部
        this.taskQueue.unshift({ callback: continuation, priority: 'normal' });
      }
    }

    this.isPerformingWork = false;
    console.log('✅ 所有任务完成！');
  }
}

// ====== 使用示例 ======
const scheduler = new MiniScheduler();

// 模拟一个大量组件的渲染（比如 1000 个 Fiber 节点）
function renderAllFibers(remainingCount = 1000) {
  const batch = Math.min(remainingCount, 50); // 每次处理 50 个
  for (let i = 0; i < batch; i++) {
    // 模拟处理一个 Fiber 节点（耗时极短）
    // beginWork / completeWork ...
  }
  console.log(`  已处理 ${batch} 个 Fiber 节点`);
  remainingCount -= batch;

  if (remainingCount > 0) {
    // 返回函数 → 表示"我还没做完，下次继续"
    return () => renderAllFibers(remainingCount);
  }
  return null; // 全部完成
}

// 添加任务
scheduler.scheduleTask({
  priority: 'normal',
  fn: renderAllFibers,
});

// 模拟一个高优先级任务（用户点击）打断低优先级
setTimeout(() => {
  scheduler.scheduleTask({
    priority: 'immediate',
    fn: () => {
      console.log('🔴 高优先级任务：处理用户点击！');
      return null; // 一次性完成
    },
  });
}, 2); // 2ms 后添加高优先级任务
```

---

### 4. Lane 优先级系统

#### React 的优先级从简单到复杂的演进

```
React 优先级系统的演进历程：

React 15:  无优先级
  │         所有更新一视同仁，同步执行
  │
  ▼
React 16:  ExpirationTime（过期时间）
  │         用数字表示优先级，数字越小越紧急
  │         问题：不够灵活，不能表达"部分匹配"
  │
  ▼
React 17:  Lane 模型（位运算优先级）
           用二进制位表示优先级，每个位代表一种优先级
           可以同时表达多个优先级、支持优先级组合和降级
```

#### Lane 的位运算原理

💡 **类比——高速公路车道：**

"Lane"字面意思就是"车道"。想象一条高速公路有多条车道：
- 最左边的车道（紧急车道）= 最高优先级，救护车专用
- 中间的车道 = 普通优先级
- 最右边的车道 = 最低优先级，货车慢车道

React 用二进制位来表示这些车道：

```javascript
// React 源码中的 Lane 定义（简化版）
export const SyncLane =    0b0000000000000000000000000000001;  // 第1位：同步
export const InputLane =   0b0000000000000000000000000000010;  // 第2位：输入事件
export const InputContinuousLane = 0b0000000000000000000000000000100; // 第3位：连续输入
// ... 更多 lane
export const DefaultLane = 0b0000000000000000000001000000000;  // 第10位：默认
export const IdleLane =    0b0100000000000000000000000000000;  // 第31位：空闲

// Lanes = 多个 Lane 的组合（位或运算）
export const NoLanes = 0b0000000000000000000000000000000;  // 没有任何 lane
export const NoLanes = -1;  // 所有 lane

// 为什么用位运算？
// 1. 极速比较：bitwise AND 和 OR 是 CPU 最快的操作
// 2. 天然支持组合：一个数字可以同时表示多个优先级
// 3. 高效的集合操作
```

#### 各种 Lane 的优先级层级图示

```
优先级从高到低（从左到右）：

位位置:  31 30 29 28 27 26 25 24 23 22 21 20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 0
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  └─ SyncLane（同步）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  └──── InputLane（离散输入）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  └─────── InputContinuousLane（连续输入）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │           ↓
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       默认优先级区间
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       Transition 优先级
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       （useTransition）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │           ↓
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       重试优先级
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       （Suspense 重试）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │           ↓
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       空闲优先级
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │       （离屏渲染等）
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
         └─ IdleLane（空闲）

优先级由高到低：
┌─────────────┬──────────────────────────────────┬────────────────────┐
│ 同步/紧急     │ 默认                            │ 过渡/空闲            │
│ (bit 0-3)   │ (bit 4-14)                      │ (bit 15-31)         │
├─────────────┼──────────────────────────────────┼────────────────────┤
│ 用户输入      │ setState、useReducer             │ startTransition    │
│ 同步更新      │ useEffect 数据获取               │ Suspense 重试       │
│ flushSync    │ Context 更新                     │ 离屏预渲染          │
└─────────────┴──────────────────────────────────┴────────────────────┘
```

#### 位运算操作的常用场景

```javascript
// ===== 场景1：判断是否包含某个优先级 =====
const lanes = InputLane | DefaultLane;  // 0b...1010

// 检查是否包含 InputLane
lanes & InputLane  // → InputLane（非零 = 包含）
// 原理：位与运算，只有对应的位都是1结果才为1

// 检查是否包含 IdleLane
lanes & IdleLane   // → 0（零 = 不包含）

// ===== 场景2：合并优先级 =====
const lane1 = InputLane;     // 用户点击
const lane2 = TransitionLane; // transition 更新
const merged = lane1 | lane2; // 同时包含两种优先级

// ===== 场景3：获取最高优先级 =====
function getHighestPriorityLane(lanes) {
  // 取最右边的1的位置
  return lanes & -lanes;
  // 原理：-lanes 是 lanes 的补码加1
  // lanes = 0b10100
  // -lanes = 0b01100
  // AND   = 0b00100  ← 只保留最右边的1
}

// ===== 场景4：移除某个优先级 =====
function removeLane(lanes, lane) {
  return lanes & ~lane;
  // ~lane = 按位取反
  // 示例：lanes = 0b1110, lane = 0b0010
  // ~lane = 0b1101
  // AND   = 0b1100  ← 移除了 bit 1
}

// ===== 场景5：判断是否有更高优先级的更新 =====
function includesHigherPriority(lanes, renderLanes) {
  // 如果 lanes 中有比 renderLanes 更高（更靠右）的位
  return (lanes & renderLanes) !== lanes;
}
```

#### 高优先级如何打断低优先级（抢占机制）

```
时间线：高优先级打断低优先级

时间 ──────────────────────────────────────────────────────────────────▶

                    ←── 5ms ──→ ←── 5ms ──→ ←── 5ms ──→
┌──────────────────────────────────────────────────────────────────────┐
│ 低优先级任务（transition 更新，比如搜索过滤）：                       │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ↑ 工作中    ↑ 被打断                      ↑ 恢复     ↑ 完成        │
├──────────────────────────────────────────────────────────────────────┤
│ 高优先级任务（用户点击）：                                           │
│ ░░░░░░░░░░████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│            ↑ 立即执行  ↑ 完成                                        │
└──────────────────────────────────────────────────────────────────────┘

具体流程：
1. React 开始执行 transition 更新（低优先级）
2. 工作了 2ms 后，用户点击了按钮（高优先级 InputLane）
3. shouldYield() 返回 true（用户输入等待中或时间到了）
4. React 保存当前进度（workInProgress 树的状态完整保存在内存中）
5. React 切换到高优先级任务，完整执行用户点击的更新
6. 高优先级任务完成后，恢复之前的 transition 更新
7. 继续从上次中断的地方执行
```

```javascript
// 抢占的核心实现（简化版）
function ensureRootIsScheduled(root) {
  const nextLanes = getNextLanes(root);  // 获取下一个要处理的 lanes
  const newCallbackPriority = getHighestPriorityLane(nextLanes);

  // 如果新任务的优先级 > 当前正在执行的任务优先级
  if (newCallbackPriority === SyncLane) {
    // 最高优先级：立即同步执行，打断当前任务
    flushSyncCallbackQueue();
  } else if (newCallbackPriority > currentCallbackPriority) {
    // 高优先级打断低优先级
    cancelCallback(currentCallback);  // 取消当前低优先级回调
    scheduleCallback(ImmediatePriority, performConcurrentWorkOnRoot);
    // 低优先级任务会在高优先级任务完成后重新调度
  }

  // 如果新任务优先级 ≤ 当前任务优先级，加入队列等待
}

// 💡 关键理解：
// 低优先级任务被打断后不会丢失！
// 它保存在 Fiber 的 updateQueue 中
// 高优先级任务完成后，React 会检查是否还有待处理的低优先级更新
// 如果有，重新调度执行
```

> 💡 **一句话总结**：Lane 优先级系统是 React 并发能力的基石。通过位运算实现了极速的优先级比较、合并和抢占，让 React 能够在"响应用户交互"和"处理后台更新"之间找到最佳平衡。

---

## 🔗 下一步

准备好探索 **React 并发特性** 了吗？这是现代 React 最激动人心的功能之一！

[→ 28 - 并发特性](../28-concurrent-mode/)
