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

## 🔗 下一步

准备好探索 **React 并发特性** 了吗？这是现代 React 最激动人心的功能之一！

[→ 28 - 并发特性](../28-concurrent-mode/)
