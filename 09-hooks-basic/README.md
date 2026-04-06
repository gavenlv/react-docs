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

[→ 10 - 入门项目实战](../10-mini-project/)
