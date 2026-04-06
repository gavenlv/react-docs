# 09 - Hooks 基础

## 🎯 本节目标
- 理解什么是 Hooks 以及为什么要使用它们
- 深入掌握 useState 和 useEffect
- 学会自定义简单的 Hook
- 了解 Hooks 的使用规则

---

## 📖 Hooks 简介

### 什么是 Hooks？
Hooks 是 React 16.8 引入的新特性，让你在不编写 class 的情况下使用 state 和其他 React 特性。

### 为什么需要 Hooks？

**Class 组件的问题：**

```jsx
// Class 组件 - 代码难以复用和拆分
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  
  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }
  
  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`;
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return <button onClick={this.handleClick}>{this.state.count}</button>;
  }
}
```

**Hooks 版本 - 更简洁清晰：**

```jsx
// 函数组件 + Hooks - 代码更简洁
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Hooks 的优势：**
- ✅ 代码更简洁易读
- ✅ 相关逻辑可以组织在一起
- ✅ 状态逻辑可以在组件间复用
- ✅ 不需要理解 `this` 关键字

---

## 🪝 核心 Hook：useState

我们已经学过 useState，这里做更深度的讲解：

### 多种初始化方式

```jsx
// 1. 固定初始值
const [count, setCount] = useState(0);
const [name, setName] = useState('');

// 2. 函数式初始值（惰性初始化）
const [data, setData] = useState(() => {
  // 只会在首次渲染时执行一次
  const initialValue = computeExpensiveValue();
  return initialValue;
});

// 3. 从 props 获取初始值
function UserProfile({ initialName }) {
  const [name, setName] = useState(initialName);
  // ...
}
```

### 函数式更新

当新 state 依赖于旧 state 时，使用函数式更新：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleMultipleUpdates = () => {
    // ❌ 连续更新可能丢失中间状态
    setCount(count + 1);
    setCount(count + 1);  // 这里的 count 还是旧的
    
    // ✅ 函数式更新保证顺序正确
    setCount(c => c + 1);
    setCount(c => c + 1);  // 这里的 c 是最新的
    setCount(c => c + 1);  // 最终 +3
  };
  
  return <button onClick={handleMultipleUpdates}>+3</button>;
}
```

---

## 🪝 核心 Hook：useEffect

useEffect 让你能够在函数组件中执行副作用操作。

### 副作用是什么？

副作用（Side Effect）：除了返回 JSX 之外的操作，比如：
- 数据获取（API 请求）
- 订阅事件（WebSocket、定时器）
- 手动修改 DOM
- 日志记录

### 基本语法

```jsx
useEffect(setupFunction, dependencies?);
```

- **setupFunction**: 执行副作用的函数
- **dependencies**: 依赖数组（可选）

### 三种使用模式

#### 1. 无依赖数组 - 每次渲染后都执行

```jsx
function Component() {
  useEffect(() => {
    console.log('每次渲染都会执行');
  });
  
  // 等同于 componentDidMount + componentDidUpdate
}
```

#### 2. 空依赖数组 [] - 只在挂载时执行一次

```jsx
function Component() {
  useEffect(() => {
    console.log('只会在组件挂载时执行一次');
    
    // 可选：清理函数（卸载时执行）
    return () => {
      console.log('组件卸载时执行清理');
    };
  }, []);
  
  // 等同于 componentDidMount + componentWillUnmount
}
```

#### 3. 有依赖数组 - 依赖变化时执行

```jsx
function Component({ userId }) {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // 当 userId 变化时重新获取数据
    fetchUser(userId).then(data => {
      setUserData(data);
    });
  }, [userId]);  // 只有 userId 变化时才执行
  
  return userData ? <UserCard user={userData} /> : <Loading />;
}
```

### 清理副作用

很多副作用都需要清理，防止内存泄漏：

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    // 建立 WebSocket 连接
    const connection = createConnection(roomId);
    
    connection.connect();
    connection.onMessage((msg) => {
      console.log('收到消息:', msg);
    });
    
    // 清理函数：断开连接
    return () => {
      connection.disconnect();
    };
  }, [roomId]);  // roomId 变化时会先清理再重新连接
}
```

**更多清理示例：**

```jsx
// 定时器
useEffect(() => {
  const timer = setInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return () => clearInterval(timer);  // 清理定时器
}, []);

// 事件监听
useEffect(() => {
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);  // 移除监听
}, []);

// 取消未完成的请求
useEffect(() => {
  const controller = new AbortController();
  
  fetchData(signal: controller.signal)
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });
    
  return () => controller.abort();  // 取消请求
}, [url]);
```

### 常见 useEffect 场景

#### 数据获取

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);  // 空数组 = 只执行一次
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <UserGrid users={users} />;
}
```

#### 监听外部 Store

```jsx
function TodoCounter({ store }) {
  const [count, setCount] = useState(store.getCount());
  
  useEffect(() => {
    // 订阅 store 变化
    const unsubscribe = store.subscribe(() => {
      setCount(store.getCount());
    });
    
    return unsubscribe;  // 取消订阅
  }, [store]);
  
  return <span>Total todos: {count}</span>;
}
```

---

## 🪝 useRef

useRef 返回一个可变的 ref 对象，在整个组件生命周期内保持不变。

### 用法一：访问 DOM 元素

```jsx
function TextInputWithFocus() {
  const inputEl = useRef(null);
  
  const focusInput = () => {
    inputEl.current.focus();  // 调用 DOM 方法
  };
  
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  );
}
```

### 用法二：存储任意可变值（不触发重新渲染）

```jsx
function Timer() {
  const [count, setCount] = useState(0);
  const timerRef = useRef(null);
  
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, []);
  
  const stopTimer = () => {
    clearInterval(timerRef.current);
  };
  
  return (
    <div>
      Count: {count}
      <button onClick={stopTimer}>停止</button>
    </div>
  );
}
```

**useState vs useRef：**

| 特性 | useState | useRef |
|------|----------|--------|
| 触发重新渲染 | ✅ | ❌ |
| 存储值变化 | ✅ 可观察 | ✅ 但不可观察 |
| 适用场景 | 需要更新 UI | 存储 DOM 引用或其他不可变引用 |

---

## 📏 Hooks 规则（必须遵守）

### 规则一：只在顶层调用 Hooks

```jsx
// ❌ 错误：在循环、条件或嵌套函数中调用
function BadComponent() {
  if (someCondition) {
    const [value, setValue] = useState(0);  // 错误！
  }
  
  function handleClick() {
    const [data, setData] = useState(null);  // 错误！
  }
  
  for (let i = 0; i < 5; i++) {
    useEffect(() => {});  // 错误！
  }
}

// ✅ 正确：始终在最顶层调用
function GoodComponent() {
  const [value, setValue] = useState(0);     // ✓ 顶层
  
  useEffect(() => {                           // ✓ 顶层
    // ...
  }, []);
  
  const handleClick = () => {
    // 可以在这里读取/设置 state，但不能调用 hooks
    setValue(10);
  };
}
```

### 规则二：只在 React 函数中调用 Hooks

✅ 允许的位置：
- React 函数组件
- 自定义 Hook 函数

❌ 不允许的位置：
- 普通 JavaScript 函数
- 类组件

---

## 🎣 自定义 Hooks

### 什么是自定义 Hook？
以 `use` 开头的函数，可以在其中调用其他 Hooks。

### 示例：useLocalStorage

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // 从 localStorage 获取
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  // 当 value 变化时保存到 localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('username', '');
  
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### 示例：useFetch

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    return () => controller.abort();
  }, [url]);
  
  return { data, loading, error };
}

// 使用
function UserList() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## ✅ 阶段检查清单

- [ ] 理解 Hooks 的概念和优势
- [ ] 熟练使用 useState 管理状态
- [ ] 掌握 useEffect 的三种模式和清理机制
- [ ] 知道 useRef 的适用场景
- [ ] 遵守 Hooks 的两条基本规则
- [ ] 能够编写简单的自定义 Hook

---

## 📝 练习任务

1. **useDebounce**: 创建防抖 Hook，用于搜索输入优化
2. **useToggle**: 创建切换布尔值的 Hook
3. **useOnlineStatus**: 创建检测网络状态的 Hook

---

## 🔬 深入理解 Hooks 的底层原理

> 这部分面向已经会用 Hooks 的开发者，帮你理解"为什么"而不仅仅是"怎么用"。

### 1. Hooks 为什么只能在函数组件顶层调用？——链表原理

💡 **大白话解释**：React 把每个组件用到的 Hooks 串成了一条链表。就像你在银行排队取号，如果中途有人插队或者离开队伍，后面所有人的号码就全乱了。Hooks 必须在每次渲染时以**完全相同的顺序**被调用，这样 React 才能准确地把状态和对应的 Hook 匹配上。

**Fiber 节点上的 memoizedState 链表结构**

每个 React 组件对应一个 Fiber 节点。Fiber 节点有一个 `memoizedState` 属性，它指向该组件所有 Hooks 构成的**单向链表**：

```
Fiber 节点 (对应一个组件实例)
 ┌─────────────┐
 │ memoizedState ──────────────────────────────────┐
 └─────────────┘                                   │
                                                  ▼
                                            ┌───────────┐
                              Hook 1        │ baseState │──→ count 的值 (0)
                              useState      │ next ─────┼──────────┐
                                            └───────────┘          │
                                                                   ▼
                                            ┌───────────┐
                              Hook 2        │ baseState │──→ name 的值 ('')
                              useState      │ next ─────┼──────────┐
                                            └───────────┘          │
                                                                   ▼
                                            ┌───────────┐
                              Hook 3        │ baseState │──→ callback
                              useEffect     │ next ─────┼──────────┐
                                            └───────────┘          │
                                                                   ▼
                                                         null (链表结束)
```

**用代码模拟 React 如何记住每个 Hook 的状态**

```jsx
// ⚠️ 这是简化版的原理模拟，不是 React 的真实源码
// 但核心思想完全一致

let hookIndex = 0;           // 当前 Hook 在链表中的位置
let hookChain = [];          // 模拟 Fiber 节点上的 Hook 链表
let isMounting = true;       // 是否是首次挂载

// 模拟 useState
function useStateImpl(initialValue) {
  if (isMounting) {
    // 首次渲染：创建新的 Hook 节点，加入链表
    const hook = {
      state: typeof initialValue === 'function' ? initialValue() : initialValue,
      queue: [],   // 存放待处理的更新
    };
    hookChain.push(hook);
  }

  // 获取当前 Hook 节点
  const hook = hookChain[hookIndex];

  // 返回当前值和 setter
  const setState = (newValue) => {
    hook.queue.push(newValue);
    scheduleRender();  // 通知 React 重新渲染
  };

  // ⭐ 每次调用后，索引 +1（保证下次调用拿到下一个 Hook）
  const currentIndex = hookIndex;
  hookIndex++;

  return [hook.state, setState];
}

// 模拟一次完整的渲染过程
function renderComponent() {
  hookIndex = 0;    // ⭐ 关键！每次渲染都从索引 0 开始
  isMounting = hookChain.length === 0;

  // 调用组件函数，里面会依次调用 useState
  // MyComponent();  → useState('Alice') → useState(0) → ...
}
```

**为什么不能在 if/for/嵌套函数中调用？**

```jsx
function BadComponent({ isLoggedIn }) {
  // 🔴 第一次渲染：isLoggedIn = true
  // 链表：[useState('Alice')]（索引0）
  const [name, setName] = useState('Alice');

  if (isLoggedIn) {
    // 链表：[useState('Alice'), useState(0)]（索引0, 1）
    const [count, setCount] = useState(0);
  }

  // 🔴 第二次渲染：isLoggedIn = false（条件不成立）
  // 链表本应是：[useState('Alice')]（只有索引0）
  // 但 React 仍然按索引1去找 → 拿到了上次的 useState(0) → 💥 位置错乱！
  // name 会突然变成 0，count 对应的 Hook 也不存在了
}
```

```
第一次渲染 (isLoggedIn = true):
  索引0 → useState('Alice') ✓
  索引1 → useState(0)      ✓
  索引2 → useEffect(...)    ✓

第二次渲染 (isLoggedIn = false):
  索引0 → useState('Alice') ✓
  索引1 → useEffect(...)    ✗ ← 期望是 useState(0)，但拿到了 useEffect！💥
```

> ⚠️ 所以：Hooks 的调用顺序**必须**在每次渲染时保持完全一致，就像排队取号——如果队伍中有人突然消失或多出来，后面所有人的号码就全对应不上了。

---

### 2. useState 的完整生命周期——从调用到渲染

💡 **大白话解释**：可以把 `useState` 想象成一个"存钱罐"。第一次调用时你往里面放初始金额，之后每次渲染时 React 帮你从存钱罐里把钱拿出来给你看，而 `setState` 就是你往里面继续塞钱的操作。

**第一次渲染 vs 后续更新的不同行为**

```
┌──────────────────────────────────────────────────────┐
│              第一次渲染 (Mounting)                      │
│                                                       │
│  const [count, setCount] = useState(0)                │
│                                                       │
│  React 内部：                                         │
│  1. 创建一个新的 Hook 节点                            │
│  2. 将初始值 0 存入 state                            │
│  3. 把 Hook 节点挂到链表上                            │
│  4. 返回 [0, setter]                                 │
│                                                       │
├──────────────────────────────────────────────────────┤
│              后续更新 (Updating)                       │
│                                                       │
│  const [count, setCount] = useState(0)                │
│                                                       │
│  React 内部：                                         │
│  1. 忽略参数 0（初始值在首次渲染后就不再使用了）      │
│  2. 从链表中找到对应的 Hook 节点                      │
│  3. 处理所有排队的更新                                │
│  4. 返回 [最新state, setter]                         │
└──────────────────────────────────────────────────────┘
```

**setState 是同步还是异步？（React 18 的自动批处理）**

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Alice');

  const handleClick = () => {
    // React 18 之前：在 setTimeout/原生事件 中每次 setState 都会触发一次渲染
    // React 18：所有场景都自动批处理，无论在哪里调用

    setCount(1);     // ← 排队，不立即渲染
    setName('Bob');   // ← 排队，不立即渲染
    console.log(count); // ← 还是 0！（不是新的 1）

    // 这里的两次 setState 会被合并成一次渲染
    // React 会在当前事件处理函数执行完毕后，统一处理所有更新
  };

  return (
    <>
      <span>{count} - {name}</span>
      <button onClick={handleClick}>更新</button>
    </>
  );
}
```

```
React 18 自动批处理行为对比：
┌─────────────────────────────────────────────────────────┐
│ 场景              │ React 17        │ React 18           │
├─────────────────────────────────────────────────────────┤
│ 事件处理器中       │ 自动批处理 ✅    │ 自动批处理 ✅       │
│ setTimeout 中      │ 每次都渲染 🔴    │ 自动批处理 ✅       │
│ Promise 中         │ 每次都渲染 🔴    │ 自动批处理 ✅       │
│ 原生 DOM 事件中     │ 每次都渲染 🔴    │ 自动批处理 ✅       │
└─────────────────────────────────────────────────────────┘
```

**为什么 setState 后不能立即拿到新值？（闭包陷阱）**

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    // 🔴 这里的 count 仍然是当前渲染时的值（闭包捕获的值）
    // 因为 setCount 只是"通知" React 更新，不会立即改变 count 变量
    // count 是当前这次渲染的快照，不会因为 setState 而改变
    console.log(count); // 输出 0，不是 1
  };

  // 💡 解决方案1：函数式更新（推荐）
  const handleClickGood = () => {
    setCount(prev => prev + 1);
    // prev 参数始终是最新的 state，不受闭包影响
  };

  return <button onClick={handleClickGood}>{count}</button>;
}
```

**函数式更新 `setState(prev => prev + 1)` 的工作原理**

```jsx
// 🔍 为什么函数式更新能保证正确？

function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 这三次更新会被放入队列
    setCount(c => c + 1);  // 队列: [f1]
    setCount(c => c + 1);  // 队列: [f1, f2]
    setCount(c => c + 1);  // 队列: [f1, f2, f3]

    // 渲染时 React 会依次处理队列中的每个函数：
    // 1. baseState = 0, 执行 f1(0) → 1
    // 2. baseState = 1, 执行 f2(1) → 2
    // 3. baseState = 2, 执行 f3(2) → 3
    // 最终 count = 3 ✅
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

**useState 的惰性初始化（传入函数 vs 传入值）**

```jsx
function MyComponent({ items }) {
  // ❌ 每次 MyComponent 渲染时都会计算 sortedItems（即使只在首次用）
  // const [sorted, setSorted] = useState(items.sort((a, b) => a - b));

  // ✅ 传入函数：只在首次渲染时执行一次
  // 后续渲染时 React 会忽略这个函数参数，直接返回链表中存储的值
  const [sorted, setSorted] = useState(() => {
    console.log('这行只会在首次渲染时打印一次');
    return [...items].sort((a, b) => a - b);
  });
}
```

💡 **性能意义**：当初始值需要通过复杂计算获得（如读取 localStorage、排序大数据、解析大 JSON），惰性初始化可以避免每次渲染都重复计算。

---

### 3. useEffect 的执行时机完全解密

💡 **大白话解释**：`useEffect` 就像是你在饭点之后才去洗碗——先让 React 把"饭菜"（UI）端上桌（绘制到屏幕），用户能看到了，然后你再去"洗碗"（执行副作用）。而 `useLayoutEffect` 则是：饭菜还没端上桌，你先在厨房里把碗洗干净了（DOM 更新了但用户还看不到），然后再一起端出去。

**useEffect vs useLayoutEffect 的真实区别**

```
浏览器一帧的完整时间线：

  React 渲染      DOM 更新      浏览器绘制       useEffect
  (生成虚拟DOM)   (写入真实DOM)  (用户看到画面)   (异步执行)
       │              │              │              │
       ▼              ▼              ▼              ▼
  ──────────────────────────────────────────────────────────→
  ──────────────────────────────────────────────────────────→
       │              │                              │
       │              ▼                              │
       │     ┌──────────────────┐                    │
       │     │useLayoutEffect   │                    │
       │     │ (同步执行，       │                    │
       │     │  阻塞绘制)       │                    │
       │     └──────────────────┘                    │
       │                                              │

时间轴：
  ─────────────────────────────────────────────────────────→
  │  │         │              │              │            │
  │  ▼         ▼              ▼              ▼            ▼
  │ 渲染 → DOM更新 → useLayoutEffect → 浏览器绘制 → useEffect
  │                          ↑
  │                  此时 DOM 已更新
  │                  但用户还看不到
```

```jsx
// useLayoutEffect 的典型使用场景：避免闪烁

import { useState, useLayoutEffect, useEffect, useRef } from 'react';

function Tooltip({ isVisible }) {
  const tooltipRef = useRef(null);

  // ✅ 用 useLayoutEffect：在用户看到画面之前就调整好位置
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      // 如果弹出位置超出屏幕，在用户看到之前就修正
      if (rect.right > window.innerWidth) {
        tooltipRef.current.style.left = `${window.innerWidth - rect.width - 10}px`;
      }
    }
  }, [isVisible]);

  // 如果用 useEffect，用户会先看到弹出框在错误位置闪烁一下，然后跳到正确位置

  return isVisible ? <div ref={tooltipRef} className="tooltip">提示内容</div> : null;
}
```

**cleanup 函数的执行时机**

```jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(`1. 连接到房间: ${roomId}`);

    const connection = createConnection(roomId);
    connection.onMessage((msg) => setMessages(prev => [...prev, msg]));

    // cleanup 函数会在以下两种情况执行：
    return () => {
      console.log(`2. 断开房间: ${roomId}`);
      connection.disconnect();
    };
  }, [roomId]);

  // 当 roomId 从 "A" 变成 "B" 时，执行顺序是：
  // 1. 渲染新的 UI（roomId = "B"）
  // 2. 执行 cleanup（断开房间 "A"）  ← 注意：是旧的 cleanup
  // 3. 执行新的 effect（连接房间 "B"）
  // 4. 浏览器绘制
}
```

```
cleanup 函数执行时机图解：

  组件挂载时：
  ─────────────────────────────→
       │                    │
       ▼                    ▼
   执行 effect          组件卸载
                       执行 cleanup
                          │
                          ▼
                       组件销毁

  roomId 变化时（从 A → B）：
  ────────────────────────────────→
       │       │       │         │
       ▼       ▼       ▼         ▼
   渲染(B) cleanup(A) effect(B)  绘制
  (虚拟DOM) (断开A)  (连接B)   (用户看到)
```

**依赖数组的工作原理：Object.is 比较**

```jsx
// React 用 Object.is() 来比较依赖项是否变化

// 基本类型：按值比较
Object.is(1, 1)           // true  ✅ 不会重新执行
Object.is('hello', 'hello') // true  ✅ 不会重新执行
Object.is(1, 2)           // false 🔴 会重新执行

// 引用类型：按引用比较
Object.is({}, {})         // false 🔴 即使内容相同，引用不同
Object.is([], [])         // false 🔴 即使内容相同，引用不同

const obj = { a: 1 };
Object.is(obj, obj)       // true  ✅ 同一个引用

// 💡 这就是为什么引用类型的依赖容易出 bug
function MyComponent() {
  const [options, setOptions] = useState({ page: 1, size: 10 });

  useEffect(() => {
    fetchData(options);
  }, [options]);  // ✅ 正确：options 是 state，引用不变

  // 🔴 常见错误：依赖内联对象
  useEffect(() => {
    fetchData({ page: 1, size: 10 });  // 每次都创建新对象
  }, [{ page: 1, size: 10 }]);          // 每次渲染都是新引用 → 每次都执行！
}
```

**useEffect 的闭包陷阱原理和解决方案**

```jsx
function Timer() {
  const [count, setCount] = useState(0);

  // 🔴 闭包陷阱：effect 捕获了首次渲染时的 count（值为 0）
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);  // count 永远是 0！因为闭包捕获了初始值
    }, 1000);

    return () => clearInterval(timer);
  }, []);  // 空依赖 → effect 只执行一次 → count 永远是 0

  // ✅ 解决方案1：使用函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1);  // prev 始终是最新值
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ 解决方案2：正确声明依赖
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [count]);  // count 变化时重新创建定时器
  // ⚠️ 但这意味着每次 count 变化都会重新创建定时器

  return <div>{count}</div>;
}
```

---

### 4. React 如何实现"记住"状态？——闭包+链表的秘密

💡 **大白话解释**：闭包就像一个"记忆口袋"——函数在创建时会把它当时看到的所有变量都装进口袋里带走，即使之后外面的变量变了，口袋里的值也不会变。React 的 Hooks 巧妙地利用了闭包来记住状态。

**用简单的 JavaScript 代码模拟 useState 的核心实现**

```jsx
// ⚠️ 约 20 行代码，模拟 useState 的核心原理
// 这不是 React 源码，但核心机制完全一致

// 模拟 React 的全局状态
let currentComponent = null;  // 当前正在渲染的组件
let hookIndex = 0;            // 当前 Hook 索引

// 模拟 useState
function useState(initialValue) {
  // 获取当前组件的 Hook 链表
  const hooks = currentComponent.hooks || [];

  if (hookIndex >= hooks.length) {
    // 首次渲染：创建新的 Hook 节点
    const value = typeof initialValue === 'function'
      ? initialValue()
      : initialValue;
    hooks.push({
      value,         // 当前状态值
      listeners: []  // 订阅者（通知组件重新渲染）
    });
  }

  // 获取当前 Hook
  const hook = hooks[hookIndex];
  const currentIndex = hookIndex++;
  const value = hook.value;

  // setState 函数 —— 利用闭包记住当前 Hook 的索引
  const setValue = (newValue) => {
    // 支持函数式更新
    const resolvedValue = typeof newValue === 'function'
      ? newValue(hook.value)
      : newValue;

    // 只在值真正变化时才更新
    if (!Object.is(hook.value, resolvedValue)) {
      hook.value = resolvedValue;
      // 通知组件重新渲染
      scheduleRender(currentComponent);
    }
  };

  return [value, setValue];
}

// 模拟组件渲染
function scheduleRender(component) {
  // 重新执行组件函数
  hookIndex = 0;  // ⭐ 重置索引！这是链表能工作的关键
  const newElement = component.render();
  // 对比差异 → 更新 DOM（简化省略）
}
```

**用简单的 JavaScript 代码模拟 useEffect 的核心实现**

```jsx
// 模拟 useEffect
function useEffect(callback, deps) {
  const hooks = currentComponent.hooks;
  const hookIndex = currentComponent.hookIndex++;

  // 首次渲染：创建 effect 记录
  if (!hooks[hookIndex]) {
    hooks[hookIndex] = { deps: null, cleanup: null };
  }

  const prevDeps = hooks[hookIndex].deps;
  const prevCleanup = hooks[hookIndex].cleanup;

  // 比较依赖是否变化（使用 Object.is）
  let depsChanged = false;
  if (deps === undefined) {
    depsChanged = true;  // 没有依赖数组 → 每次都执行
  } else if (prevDeps === null) {
    depsChanged = true;  // 首次渲染
  } else {
    depsChanged = deps.some((dep, i) => !Object.is(dep, prevDeps[i]));
  }

  if (depsChanged) {
    // 1. 先执行上一次的 cleanup（如果有）
    if (prevCleanup) prevCleanup();

    // 2. 执行新的 effect，保存 cleanup 函数
    const cleanup = callback();
    hooks[hookIndex].deps = deps;
    hooks[hookIndex].cleanup = cleanup || null;
  }
}
```

**闭包在 Hooks 中的核心作用**

```jsx
// 🔍 闭包让每个渲染"看到"自己的状态快照

function Counter() {
  const [count, setCount] = useState(0);

  // 每次渲染时：
  // 1. React 调用 Counter()
  // 2. useState 返回当前 count 值和 setCount
  // 3. 这个 setCount 通过闭包记住了它对应的 Hook 索引
  // 4. 组件函数执行完毕后，返回的 JSX 也通过闭包捕获了当前的 count

  const handleClick = () => {
    // 这个 handleClick 函数是一个闭包
    // 它"记住"了创建它时那个渲染周期的 count 值
    setCount(count + 1);
  };

  // 渲染1：count = 0，handleClick 看到的 count 是 0
  // 渲染2：count = 1，handleClick 看到的 count 是 1
  // 渲染3：count = 2，handleClick 看到的 count 是 2
  // ...
  // 每个渲染周期都有自己的"状态快照"

  return <button onClick={handleClick}>{count}</button>;
}
```

```
每次渲染都是一张"快照"：

  渲染 1 (count=0):
  ┌─────────────────────────────┐
  │ count = 0                   │
  │ handleClick → setCount(0+1) │ ← 闭包捕获 count=0
  │ JSX: <button>0</button>     │
  └─────────────────────────────┘
              ↓ 点击
  渲染 2 (count=1):
  ┌─────────────────────────────┐
  │ count = 1                   │
  │ handleClick → setCount(1+1) │ ← 闭包捕获 count=1
  │ JSX: <button>1</button>     │
  └─────────────────────────────┘
              ↓ 点击
  渲染 3 (count=2):
  ┌─────────────────────────────┐
  │ count = 2                   │
  │ handleClick → setCount(2+1) │ ← 闭包捕获 count=2
  │ JSX: <button>2</button>     │
  └─────────────────────────────┘
```

---

### 5. 常见 Hooks 陷阱原理级解析

#### useEffect 死循环的原因和原理

```jsx
// 🔴 最常见的死循环：依赖数组中放了每次渲染都会变化的值

function MyComponent() {
  const [data, setData] = useState([]);

  // 死循环！原因分析：
  useEffect(() => {
    fetchData().then(res => {
      // setData 触发重新渲染
      setData(res.data);
    });
  }, [data]);  // data 变化 → 重新执行 effect → setData → data 变化 → 无限循环！

  // ✅ 解决方案：移除 data 依赖（通常不需要它）
  useEffect(() => {
    fetchData().then(res => setData(res.data));
  }, []);  // 只在挂载时执行
}
```

```
死循环的完整流程：

  挂载 → useEffect 执行 → setData(newData)
    ↑                             ↓
    ←──── 重新渲染 ←──── data 变化了
    │                             ↓
    ←──── 重新渲染 ←──── data 又变了
    ↑                             ↓
    ←─────────────────────────────┘（无限循环 💥）
```

```jsx
// 🔴 另一种常见的死循环：依赖中的引用类型

function MyComponent() {
  const [options, setOptions] = useState({ page: 1 });

  // 🔴 死循环！因为 effect 内部的 setOptions 每次都创建新对象
  useEffect(() => {
    // 即使 page 没变，每次 setOptions 都创建了新对象引用
    setOptions(prev => ({ ...prev, timestamp: Date.now() }));
  }, [options]);  // options 引用变了 → 重新执行 → 又变了 → 死循环

  // ✅ 解决方案1：只依赖真正关心的值
  useEffect(() => {
    setOptions(prev => ({ ...prev, timestamp: Date.now() }));
  }, [options.page]);  // 只在 page 变化时执行

  // ✅ 解决方案2：用 useRef 追踪，避免触发重新渲染
}
```

#### 为什么 React 会警告缺少依赖

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  // React ESLint 规则会警告：query 应该加入依赖数组
  useEffect(() => {
    const controller = new AbortController();

    async function search() {
      setIsLoading(true);
      const res = await fetch(`/api/search?q=${query}`, {
        signal: controller.signal
      });
      const data = await res.json();
      setResults(data);
      setIsLoading(false);
    }

    search();
    return () => controller.abort();
  }, []);  // ⚠️ 缺少 query 依赖！

  // 为什么 React 要警告？
  // 因为 query 在 effect 的闭包中被使用了，但没有声明为依赖
  // 如果 query 从 "React" 变成 "Vue"，effect 不会重新执行
  // 用户看到的还是 "React" 的搜索结果！

  // ✅ 正确做法：添加所有在 effect 中使用到的值
  useEffect(() => {
    // ...
  }, [query]);  // query 变化时，自动取消旧请求并发起新请求
}
```

#### stale closure（陈旧闭包）的原理和解决方案

💡 **大白话解释**：陈旧闭包就像你拿着一张过期的地图去导航——地图上标注的是旧版本的街道，但现实中的路已经变了。函数"记住"的是它被创建时的变量值，如果变量的最新值已经改变，但函数还在用旧值，就产生了陈旧闭包。

```jsx
// 🔴 经典的 stale closure 问题

function EventListener() {
  const [count, setCount] = useState(0);

  // 🔴 这个 effect 只执行一次（空依赖）
  useEffect(() => {
    const handleClick = () => {
      // handleClick 是一个闭包，它在 effect 创建时被"冻结"
      // 此时的 count 是 0，永远不会变
      console.log('当前 count:', count);  // 永远输出 0！
      setCount(count + 1);  // 永远是 0 + 1 = 1
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);  // ← 这就是问题所在

  // ✅ 解决方案1：使用 ref 存储最新值
  const countRef = useRef(count);
  countRef.current = count;  // 每次渲染都更新 ref

  useEffect(() => {
    const handleClick = () => {
      // ref.current 始终是最新值
      console.log('当前 count:', countRef.current);  // ✅ 正确
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // ✅ 解决方案2：使用函数式更新（最推荐）
  useEffect(() => {
    const handleClick = () => {
      setCount(prev => {
        console.log('当前 count:', prev);  // ✅ prev 始终是最新值
        return prev + 1;
      });
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // ✅ 解决方案3：正确添加依赖（但会频繁注册/注销事件）
  useEffect(() => {
    const handleClick = () => {
      console.log('当前 count:', count);  // ✅ 每次创建新的闭包
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [count]);  // count 变化 → 重新注册事件
  // ⚠️ 缺点：每次 count 变化都要注销再注册事件监听器
}
```

```
stale closure 原理图解：

  渲染1: count = 0
  ┌────────────────────────────────┐
  │ useEffect 创建的 handleClick:  │
  │   闭包中的 count = 0           │  ← 被冻结了
  │                                │
  │   count 永远是 0！              │  ← stale！
  └────────────────────────────────┘
       │ 注册到 window
       ▼

  渲染2: count = 1（但 handleClick 不知道）
  渲染3: count = 2（但 handleClick 不知道）
  ...

  用户点击 → 触发 handleClick → count 仍然是 0

  ┌──────────────────────────────────────────────────┐
  │ 三种解决方案对比                                   │
  ├──────────────┬──────────────┬─────────────────────┤
  │ 方案          │ 优点          │ 缺点               │
  ├──────────────┼──────────────┼─────────────────────┤
  │ useRef       │ 简单直接      │ 需要额外维护 ref    │
  │ 函数式更新    │ 最优雅 ✅     │ 只适用于 setState   │
  │ 正确依赖      │ 代码最清晰    │ 可能频繁注册/注销   │
  └──────────────┴──────────────┴─────────────────────┘
```

---

[→ 10 - 入门项目实战](../10-mini-project/)
