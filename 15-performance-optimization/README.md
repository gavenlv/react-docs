# 15 - 性能优化

## 🎯 本节目标
- 理解 React 渲染机制和性能瓶颈
- 掌握常用的性能优化策略
- 学会使用工具分析和诊断性能问题

---

## 📖 理解 React 的渲染行为

### 什么是重新渲染？
当组件的 state 或 props 发生变化时，React 会重新调用组件函数生成新的虚拟 DOM，然后进行 diff 对比更新真实 DOM。

### 不必要的渲染问题

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  
  console.log('Parent re-rendered');
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      <input value={name} onChange={(e) => setName(e.target.value)} />
      
      {/* name 变化也会导致 ExpensiveChild 重渲染！ */}
      <ExpensiveChild count={count} />
    </div>
  );
}

function ExpensiveChild({ count }) {
  console.log('ExpensiveChild re-rendered');
  
  // 假设这里有一个昂贵的计算
  const result = useMemo(() => {
    return Array(10000).fill(0).map((_, i) => i * i).reduce((a, b) => a + b);
  }, [count]);
  
  return <div>{result}</div>;
}
```

---

## 🚀 性能优化技术

### 1. React.memo - 记忆化组件

防止父组件更新时不必要的子组件重渲染。

```jsx
import { memo, useState } from 'react';

// ❌ 普通组件：每次父组件更新都重渲染
function NormalChild({ onClick }) {
  console.log('NormalChild rendered');
  return <button onClick={onClick}>Click me</button>;
}

// ✅ 使用 React.memo：只在 props 变化时重渲染
const MemoizedChild = memo(function MemoizedChild({ onClick }) {
  console.log('MemoizedChild rendered');
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => console.log('clicked');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      
      <NormalChild onClick={handleClick} />
      {/* 点击 +1 时 NormalChild 会重渲染，MemoizedChild 不会 */}
      <MemoizedChild onClick={handleClick} />
    </div>
  );
}
```

**注意函数 prop 的问题：**

```jsx
// ❌ 即使使用了 memo，内联函数仍然是新的引用！
<MemoizedChild onClick={() => doSomething(id)} />

// ✅ 解决方案一：使用 useCallback
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);  // id 不变则引用不变
<MemoizedChild onClick={handleClick} />

// ✅ 解决方案二：传递 ID，让子组件自己处理
<MemoizedChild id={id} onDo={doSomething} />
```

### 2. useMemo - 缓存计算结果

缓存昂贵的计算结果，避免每次渲染都重新计算。

```jsx
function ExpensiveList({ items, filter }) {
  // ❌ 每次渲染都重新计算
  const filteredItems = items
    .filter(item => item.name.includes(filter))
    .sort((a, b) => b.price - a.price)
    .map(item => ({ ...item, totalPrice: item.price * 1.1 }));
  
  // ✅ 只在依赖项变化时重新计算
  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.name.includes(filter))
      .sort((a, b) => b.price - a.price)
      .map(item => ({ ...item, totalPrice: item.price * 1.1 }));
  }, [items, filter]);  // 只有 items 或 filter 变化时才重新计算
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}: ${item.totalPrice}</li>
      ))}
    </ul>
  );
}
```

**何时使用 useMemo：**

```jsx
// ✅ 适合：昂贵计算
const sortedData = useMemo(() => {
  return hugeArray.sort(complexSortFunction);
}, [hugeArray]);

// ✅ 适合：创建稳定引用避免子组件重渲染
const theme = useMemo(() => ({
  colors,
  fonts,
  spacing
}), [colors, fonts, spacing]);

// ❌ 不适合：简单计算（缓存成本可能更高）
const doubled = useMemo(() => x * 2, [x]);  // 直接计算即可
```

### 3. useCallback - 缓存函数引用

缓存函数定义，避免因函数引用变化导致子组件不必要的重渲染。

```jsx
function TodoList({ todos }) {
  const [text, setText] = useState('');

  // ❌ 每次渲染创建新函数
  const handleAdd = () => {
    addTodo(text);
  };

  // ✅ 使用 useCallback 缓存函数
  const handleAdd = useCallback(() => {
    addTodo(text);
  }, [text]);  // text 变化时才创建新函数

  // ✅ 对于事件处理器，通常不需要依赖 state
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    addTodo(text);
  }, []);  // 注意：这会捕获旧的 text！

  // ✅ 正确做法：使用 ref 或函数式更新
  const inputRef = useRef();
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    addTodo(inputRef.current.value);
  }, []);
  
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} onChange={(e) => setText(e.target.value)} />
      <MemoizedButton onClick={handleAdd}>添加</MemoizedButton>
    </form>
  );
}
```

**useCallback 最佳实践：**

```jsx
// 场景一：传递给 memo 子组件的回调
const handleClick = useCallback((id) => {
  setSelectedId(id);
}, []);

<MemoizedListItem onClick={handleClick} />

// 场景二：作为 effect 的依赖
useEffect(() => {
  fetchData(params);
}, [fetchData]);  // fetchData 用 useCallback 包装

// 场景三：不依赖外部变量的纯操作
const resetForm = useCallback(() => {
  setName('');
  setEmail('');
  setPassword('');
}, []);
```

### 4. 虚拟列表 - 渲染长列表

当列表有数百或数千项时，只渲染可视区域的元素。

```bash
# 安装 react-window 或 react-virtualized
npm install react-window
```

```jsx
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      Item {index}: {items[index].name}
    </div>
  );

  return (
    <List
      height={500}           // 列表高度
      itemCount={items.length}  // 总项目数
      itemSize={50}          // 每行高度
      width="100%"           // 宽度
    >
      {Row}
    </List>
  );
}

// 10000 条数据也能流畅滚动！
```

### 5. 代码分割与懒加载

将大应用拆分成小块，按需加载。

```jsx
import { lazy, Suspense } from 'react';

// 懒加载重型组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));
const ChartComponent = lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HeavyComponent data={data} />
      <ChartComponent stats={stats} />
    </Suspense>
  );
}

// 路由级别的懒加载
const routes = [
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LazyDashboard />
      </Suspense>
    )
  },
  {
    path: '/settings',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LazySettings />
      </Suspense>
    )
  }
];
```

### 6. 避免内联对象和数组

内联创建的对象/数组每次都是新引用，会导致 memo 失效。

```jsx
// ❌ 问题：每次渲染都创建新对象
<div style={{ color: 'red', fontSize: 16 }}>
  Content
</div>
<ListItem data={{ id: 1, name: 'Test' }} />

// ✅ 解决：提取到外部或使用 useMemo/useState
const containerStyle = useMemo(() => ({
  color: 'red',
  fontSize: 16
}), []);  // 空依赖 = 永远不变

<div style={containerStyle}>Content</div>

// 或者使用常量（如果值固定）
const ITEM_DATA = { id: 1, name: 'Test' };
<ListItem data={ITEM_DATA} />
```

### 7. 合理拆分组件

将频繁更新的部分和不经常变化的部分分离。

```jsx
// ❌ 整体一起重渲染
function CounterWithForm() {
  const [count, setCount] = useState(0);
  const [formData, setFormData] = useState({});
  
  // count 变化导致整个组件重渲染，包括表单部分
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}  {/* 可能频繁变化 */}
      </button>
      
      <form>
        <input onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input onChange={(e) => setFormData({...formData, email: e.target.value})} />
        {/* 表单不应该因为 count 变化而重渲染 */}
      </form>
    </div>
  );
}

// ✅ 拆分组件
function CounterWithForm() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <CounterDisplay count={count} onIncrement={() => setCount(c => c + 1)} />
      <MemoizedForm />  {/* 表单独立，不受 count 影响 */}
    </div>
  );
}

const Form = memo(function Form() {
  // ...
});
```

---

## 🔍 性能分析工具

### 1. React DevTools Profiler

```jsx
// 在开发环境中启用 Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id,              // Profiler 树的 id
  phase,           // "mount" 或 "update"
  actualDuration,  // 本次更新花费的时间
  baseDuration,    // 不做任何优化的预计时间
  startTime,       // 开始时间
  commitTime,      // 提交时间
  interactions     // 触发更新的交互集合
) {
  console.log(`${id} took ${actualDuration.toFixed(2)}ms`);
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

### 2. Chrome Performance Tab

1. 打开 Chrome DevTools → Performance
2. 点击 Record
3. 进行交互操作
4. 停止录制并分析结果
5. 查看 Long Tasks、Script Execution 等

### 3. React.StrictMode

检测潜在的性能问题和反模式：

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

StrictMode 会：
- 双重调用 render、useState setter 等
- 检测废弃的 API
- 警告不安全的生命周期方法

---

## 💡 性能优化清单

在发布前检查这些项目：

### 组件层面
- [ ] 大型列表使用虚拟化（react-window）
- [ ] 昂贵组件用 React.memo 包装
- [ ] 复杂计算用 useMemo 缓存
- [ ] 回调函数用 useCallback 包装
- [ ] 避免内联样式对象

### 数据获取
- [ ] 使用 Suspense + lazy 加载路由
- [ ] 图片使用懒加载
- [ ] API 请求添加防抖节流
- [ ] 实现请求去重和缓存

### 渲染层面
- [ ] 减少不必要的状态更新
- [ ] 合理拆分组件粒度
- [ ] 使用 key 正确识别列表项
- [ ] 避免 Context 过度使用

### 打包优化
- [ ] 配置 Tree Shaking
- [ ] 分离第三方库
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 使用 CDN 托管静态资源

---

## ✅ 阶段检查清单

- [ ] 理解 React 的渲染机制和重渲染触发条件
- [ ] 掌握 React.memo、useMemo、useCallback 的用法和适用场景
- [ ] 了解虚拟列表和代码分割的实现方式
- [ ] 能够使用工具分析性能问题
- [ ] 形成良好的性能优化习惯

---

## 📝 练习任务

1. **性能问题修复**: 提供一个存在性能问题的组件，要求找出并修复所有问题
2. **大型表格优化**: 实现一个支持排序、筛选、分页的高性能表格组件

---

[→ 16 - TypeScript 与 React](../16-typescript-react/)
