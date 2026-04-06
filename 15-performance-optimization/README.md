# 15 - 性能优化

## 本节目标

- 深入理解 React 的渲染机制——到底什么是"渲染"、什么会触发"重新渲染"
- 理解 Virtual DOM 和 Diff 算法的工作原理——这是所有优化技巧的基础
- 掌握 `React.memo`、`useMemo`、`useCallback` 的用法和**为什么**它们有效
- 学会使用工具分析和诊断性能问题

---

## 先理解：React 是怎么把代码变成页面的

### 三个核心概念

在学习优化之前，你必须先搞清楚这三个概念：

#### 1. React Element（React 元素）

React Element 是你写的 JSX 编译后的结果。它不是真正的 DOM，只是一个**描述对象**，告诉 React "我想在这里渲染一个什么样的元素"。

```jsx
// 你写的 JSX
const element = <h1 className="title">Hello</h1>;

// React 实际得到的（简化版）
const element = {
  type: 'h1',
  props: {
    className: 'title',
    children: 'Hello'
  }
};
```

**关键点**：React Element 是轻量级的 JavaScript 对象，创建它几乎没有成本。它就像一张"施工图纸"。

#### 2. Virtual DOM（虚拟 DOM）

当整个组件树执行完毕后，会生成一棵完整的 React Element 树——这就是 Virtual DOM。

```
Virtual DOM（简化示意）：
{
  type: 'div',
  props: {
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p',  props: { children: 'World' } },
      { type: Button, props: { onClick: fn } }
    ]
  }
}
```

Virtual DOM 存在于内存中，它是对真实 DOM 的一层抽象。你可以把它理解为"真实 DOM 的复印件"。

#### 3. 真实 DOM（Real DOM）

就是浏览器页面上的实际 HTML 元素。操作真实 DOM 是**非常昂贵的**——每次修改都可能触发浏览器的"重排（reflow）"和"重绘（repaint）"。

```
// 直接操作真实 DOM（很慢）
document.getElementById('title').textContent = 'New Title';
// 这可能导致浏览器重新计算页面布局
```

### React 的渲染流程

当组件第一次被创建时（挂载），完整流程是：

```
1. 执行组件函数，生成 React Element（虚拟 DOM）
2. 将虚拟 DOM 转换成真实 DOM
3. 将真实 DOM 挂载到页面上
```

当状态或 props 变化时（更新），流程是：

```
1. 执行组件函数，生成新的 React Element（新的虚拟 DOM）
2. 与旧的虚拟 DOM 进行对比（Diff 算法）
3. 计算出最小的变更集
4. 只修改需要变更的真实 DOM
```

**这就是 Virtual DOM 的价值**：通过在内存中进行对比计算，找到最小的修改量，避免直接操作真实 DOM 带来的性能损耗。

---

## Diff 算法：React 如何高效对比

### 一个朴素的想法

如果两棵树要对比，最笨的方法是逐个节点对比：

```
旧树：                新树：
  A                    A
 / \                  / \
B    C      VS      B    D
```

朴素算法的时间复杂度是 O(n³)——对于一棵有 1000 个节点的树，需要对比 10 亿次。这在实际应用中完全不可接受。

### React 的优化策略

React 团队基于以下三个假设做了大量优化：

**假设 1：不同类型的元素会产生不同的树**

```jsx
// React 看到 type 从 <div> 变成了 <span>，会直接销毁整个子树并重建
<div>
  <Counter />
</div>
// 变成
<span>
  <Counter />
</span>
// React 不会去对比 <Counter>，而是直接销毁旧的、创建新的
```

**结论**：不要频繁地在不同类型的组件之间切换。

**假设 2：开发者可以通过 `key` 标识哪些子元素是稳定的**

```jsx
// 没有 key——React 只能按顺序逐个对比
<ul>
  <li>A</li>    // 第 1 个
  <li>B</li>    // 第 2 个
  <li>C</li>    // 第 3 个
</ul>
// 列表变成 [C, A, B]，React 认为每个都变了，全部更新

// 有 key——React 通过 key 知道谁是谁
<ul>
  <li key="a">A</li>    // key="a"
  <li key="b">B</li>    // key="b"
  <li key="c">C</li>    // key="c"
</ul>
// 列表变成 [C, A, B]，React 只移动顺序，不重新创建
```

**结论**：列表渲染必须使用稳定的 key（不要用 `index` 作为 key，除非列表是静态的）。

**假设 3：只对比同一层级的节点**

React 不会跨层级对比——它只比较同一父节点下的直接子节点。如果层级结构变了，整个子树会被销毁重建。

```
React 会对比：
  A → A
  B → B
  C → C

React 不会去对比：
  A.B 和 A.B.C（跨层级）
```

经过这些优化，React 的 Diff 算法复杂度从 O(n³) 降到了 O(n)，完全可以在实际应用中使用。

---

## 什么会触发重新渲染？

理解了渲染流程后，关键问题是：**什么时候 React 会重新执行组件函数？**

### 触发条件（只有两种）

1. **组件自身的 `useState` 或 `useReducer` 的值发生变化**
2. **父组件重新渲染，导致子组件跟着渲染**（即使子组件的 props 没有变化）

### 一个常见的性能陷阱

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  console.log('Parent 渲染了');

  return (
    <div>
      {/* 改变 text 不会影响 count，但 ExpensiveChild 也会重新渲染！ */}
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <input value={text} onChange={e => setText(e.target.value)} />
      <ExpensiveChild count={count} />
    </div>
  );
}

function ExpensiveChild({ count }) {
  console.log('ExpensiveChild 渲染了');

  // 假设这个计算很耗时
  const result = heavyCalculation(count);

  return <div>Result: {result}</div>;
}
```

每次在输入框输入文字时：
1. `Parent` 重新渲染（因为 `text` 变了）
2. `ExpensiveChild` 也重新渲染（因为父组件渲染了）
3. `heavyCalculation` 重新执行（即使 `count` 没有变）

**这就是最常见的性能问题：不必要的孩子组件渲染。**

---

## 优化技术详解

### 1. React.memo：跳过不必要的子组件渲染

**原理**：`React.memo` 是一个高阶组件（Higher-Order Component），它会**缓存上一次的渲染结果**。当父组件重新渲染时，如果子组件的 props 没有变化，`memo` 会直接返回上一次的渲染结果，跳过整个组件函数的执行。

```jsx
// 用法：把组件用 memo() 包裹一下
const ExpensiveChild = memo(function ExpensiveChild({ count }) {
  console.log('ExpensiveChild 渲染了');
  const result = heavyCalculation(count);
  return <div>Result: {result}</div>;
});
```

现在，当 `text` 变化时：
1. `Parent` 重新渲染
2. `memo` 检查 `ExpensiveChild` 的 props（`count`）有没有变化
3. `count` 没有变化 → **跳过渲染，直接使用缓存结果**
4. `console.log` 不会执行，`heavyCalculation` 也不会执行

**memo 的比较机制（浅比较）**：

```javascript
// memo 默认使用浅比较（shallow compare）
function shallowEqual(prevProps, nextProps) {
  // 逐个比较 props 的每个属性
  for (let key in prevProps) {
    if (prevProps[key] !== nextProps[key]) return false;
  }
  return true;
}

// 举例：
shallowEqual({ count: 1 }, { count: 1 });        // true → 不渲染
shallowEqual({ count: 1 }, { count: 2 });        // false → 渲染
shallowEqual({ arr: [1] }, { arr: [1] });        // false! → 渲染
// 为什么最后一个返回 false？因为 [1] !== [1]（引用不同）
```

**陷阱：函数 props 导致 memo 失效**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都创建新的函数引用！
  // memo 的浅比较会发现 onClick 是"新"的，所以每次都会重新渲染子组件
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <MemoizedChild onClick={() => console.log('clicked')} />
    </div>
  );
}
```

解决方案见下面的 `useCallback`。

### 2. useMemo：缓存计算结果

**原理**：`useMemo` 接收一个函数和依赖数组。它只在依赖项变化时才重新执行函数，否则直接返回上一次缓存的结果。

```jsx
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);  // 只有 data 变化时才重新计算
```

**内部原理**（简化版）：

```javascript
// useMemo 的简化实现
function useMemo(createFn, deps) {
  const prevDeps = useRef(deps);
  const prevValue = useRef(null);

  // 检查依赖是否变化
  const depsChanged = deps.some((dep, i) => dep !== prevDeps.current[i]);

  if (depsChanged) {
    // 依赖变了 → 重新计算并缓存
    prevDeps.current = deps;
    prevValue.current = createFn();
  }

  return prevValue.current;  // 返回缓存值或新值
}
```

**什么时候该用 useMemo？**

```jsx
// ✅ 适合：计算确实很昂贵
const sortedItems = useMemo(() => {
  return hugeArray.sort(complexComparator);
}, [hugeArray]);

// ✅ 适合：创建对象/数组传递给 memo 子组件
const themeConfig = useMemo(() => ({
  colors: isDark ? darkTheme : lightTheme,
  fontSize: 16,
}), [isDark]);
<MemoizedThemeProvider config={themeConfig} />

// ❌ 不适合：简单计算（缓存的开销比计算本身还大）
const doubled = useMemo(() => count * 2, [count]);
// 直接写 const doubled = count * 2; 就好

// ❌ 不适合：所有 useMemo 都不加思考地用
// 只在实际遇到性能问题时才添加
```

**经验法则**：如果一个计算在每次渲染中花费的时间超过 1 毫秒（比如遍历 10000+ 个元素、复杂的排序/过滤），才值得用 `useMemo`。

### 3. useCallback：缓存函数引用

**原理**：`useMemo` 缓存的是值，而 `useCallback` 缓存的是**函数**。它在依赖不变时返回同一个函数引用（同一个内存地址）。

```jsx
// ❌ 每次 Parent 渲染都创建新的 handleClick 函数
// 每次新函数的引用都不同，导致 MemoizedChild 的 memo 检查失败
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = () => console.log(count);  // 新的函数！
  return <MemoizedChild onClick={handleClick} />;
}

// ✅ useCallback 缓存函数引用
// count 不变时，handleClick 始终是同一个函数
function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]);  // count 变化时才创建新函数
  return <MemoizedChild onClick={handleClick} />;
}
```

**useCallback 本质上是 `useMemo(() => fn, deps)` 的语法糖**：

```javascript
// 这两种写法效果完全一样
const handleClick = useCallback(() => console.log(count), [count]);
const handleClick = useMemo(() => () => console.log(count), [count]);
```

**什么时候该用 useCallback？**

```jsx
// ✅ 场景一：函数作为 props 传给 React.memo 包裹的子组件
const MemoChild = memo(({ onClick }) => <button onClick={onClick}>Click</button>);
const handleClick = useCallback(() => doSomething(id), [id]);
<MemoChild onClick={handleClick} />

// ✅ 场景二：函数作为 useEffect 的依赖
const fetchData = useCallback(async () => {
  const data = await fetch(url);
  setData(data);
}, [url]);

useEffect(() => {
  fetchData();
}, [fetchData]);  // 如果不用 useCallback，每次渲染 fetchData 都是新函数，effect 会重复执行

// ❌ 场景三：函数只传给非 memo 的普通组件（用了也没用）
function NormalChild({ onClick }) { /* ... */ }
const handleClick = useCallback(() => {}, []);
<NormalChild onClick={handleClick} />  // NormalChild 不是 memo 的，useCallback 没用
```

**经验法则**：`useCallback` 只有配合 `React.memo` 才有意义。如果你的子组件没有用 `memo` 包裹，那 `useCallback` 就是在白费力气。

### 4. 虚拟列表：渲染超长列表

当你需要渲染成百上千条数据时，即使每个项目很轻量，DOM 节点多了也会卡。

**原理**：只渲染用户当前能看到的那些列表项（加上少量缓冲），不在视口内的项目用空白占位。

```bash
npm install react-window
```

```jsx
import { FixedSizeList as List } from 'react-window';

function VirtualList({ items }) {
  // Row 组件：只接收当前可见行的 index 和 style
  const Row = ({ index, style }) => (
    <div style={style}>
      第 {index} 项：{items[index].name}
    </div>
  );

  return (
    <List
      height={500}            // 可视区域高度
      itemCount={items.length} // 总共有多少项
      itemSize={50}            // 每行高度
      width="100%"
    >
      {Row}
    </List>
  );
}
```

**效果**：即使有 100000 条数据，DOM 中也只有大约 10-20 个节点（视口能显示多少就渲染多少），滚动非常流畅。

### 5. 代码分割与懒加载

**问题**：你的应用可能有几十个页面，但用户一次只会访问一个页面。如果一开始就把所有页面的代码都加载，初始加载时间会很长。

**解决**：把代码按路由/功能拆分成小块，需要时再加载。

```jsx
import { lazy, Suspense } from 'react';

// lazy：告诉 React 这个组件需要动态加载
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Suspense：在加载过程中显示 fallback 内容
function App() {
  return (
    <Suspense fallback={<div>页面加载中...</div>}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
```

**原理**：`lazy()` 底层使用 ES Module 的动态 `import()` 语法，它会返回一个 Promise。浏览器会把每个懒加载的组件打包成单独的 JS 文件，只有当路由匹配时才去请求对应的文件。

### 6. 合理拆分组件

把频繁更新的部分和不常变化的部分分开成不同的组件：

```jsx
// ❌ 所有状态放在一起，任何变化都导致整个组件重渲染
function UserProfile() {
  const [userId] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');

  // 用户每次修改 draftName，整个组件（包括 userInfo 的渲染）都重渲染
  return (
    <div>
      <Avatar user={userInfo} />
      <Bio user={userInfo} />
      <input value={draftName} onChange={e => setDraftName(e.target.value)} />
      <button onClick={() => setIsEditing(!isEditing)}>编辑</button>
    </div>
  );
}

// ✅ 拆分：表单部分独立，修改输入框不影响头像和简介
function UserProfile() {
  const [userInfo] = useState(/* ... */);

  return (
    <div>
      <Avatar user={userInfo} />     {/* 不常变化 */}
      <Bio user={userInfo} />        {/* 不常变化 */}
      <NameEditor />                 {/* 频繁变化，但独立 */}
    </div>
  );
}

const NameEditor = memo(function NameEditor() {
  const [draftName, setDraftName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 这里的状态变化不会影响 Avatar 和 Bio
  return (
    <div>
      <input value={draftName} onChange={e => setDraftName(e.target.value)} />
      <button onClick={() => setIsEditing(!isEditing)}>编辑</button>
    </div>
  );
});
```

### 7. 避免内联对象和数组

每次渲染时创建新的对象/数组都会产生新的引用，导致 `memo` 的浅比较失效：

```jsx
// ❌ 每次渲染都创建新的 style 对象（新引用）
<div style={{ color: 'red', fontSize: 16 }}>Hello</div>

// ❌ 每次渲染都创建新的数组（新引用）
<MemoList items={[1, 2, 3]} />

// ✅ 提取为常量（引用永远不变）
const HEADER_STYLE = { color: 'red', fontSize: 16 };
const DEFAULT_ITEMS = [1, 2, 3];

<div style={HEADER_STYLE}>Hello</div>
<MemoList items={DEFAULT_ITEMS} />

// ✅ 或者用 useMemo
const style = useMemo(() => ({ color: 'red', fontSize: 16 }), []);
const items = useMemo(() => [1, 2, 3], []);
```

---

## 性能分析工具

### React DevTools Profiler

React DevTools 内置了 Profiler（分析器），可以记录每次渲染的时间：

```jsx
// 用 Profiler 组件包裹你想分析的组件
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} ${phase} 耗时: ${actualDuration.toFixed(2)}ms`);
}

<Profiler id="TodoList" onRender={onRenderCallback}>
  <TodoList />
</Profiler>
```

**使用步骤**：
1. 安装 React DevTools 浏览器扩展
2. 打开 DevTools → Profiler 标签
3. 点击 Record（录制）
4. 在页面中进行操作
5. 停止录制，查看每个组件的渲染时间和次数

### Chrome Performance Tab

用于分析 JavaScript 执行的性能瓶颈：
1. 打开 Chrome DevTools → Performance
2. 点击 Record
3. 进行交互操作
4. 停止录制
5. 查看火焰图中是否有 Long Tasks（超过 50ms 的任务）

---

## 性能优化清单

### 组件层面
- [ ] 大型列表使用虚拟化（react-window / react-virtuoso）
- [ ] 传递给子组件的 props 没有变化时，用 `React.memo` 避免不必要的渲染
- [ ] 昂贵的计算用 `useMemo` 缓存
- [ ] 传给 `memo` 子组件的函数用 `useCallback` 缓存
- [ ] 避免内联创建对象和数组作为 props

### 结构层面
- [ ] 合理拆分组件，让频繁更新的部分独立
- [ ] 正确使用 `key`（列表渲染、条件渲染切换）
- [ ] 避免过度使用 Context（Context 值变化会触发所有消费者重渲染）

### 加载层面
- [ ] 使用 `lazy` + `Suspense` 做路由级代码分割
- [ ] 图片使用懒加载
- [ ] 大型依赖库做按需加载

---

## 阶段检查清单

- [ ] 理解 React 的渲染流程（Element → Virtual DOM → Real DOM）
- [ ] 理解 Diff 算法的三个假设和为什么 key 很重要
- [ ] 知道什么会触发重新渲染（state 变化、父组件渲染）
- [ ] 掌握 `React.memo`、`useMemo`、`useCallback` 的原理和适用场景
- [ ] 能用 React DevTools Profiler 诊断性能问题

---

## 练习任务

1. **性能诊断**：打开一个包含列表的应用，使用 Profiler 找出哪些组件渲染过于频繁
2. **修复性能问题**：以下代码有多个性能问题，找出并修复：
   ```jsx
   function App() {
     const [text, setText] = useState('');
     const [items, setItems] = useState(largeArray);
     const [theme, setTheme] = useState('light');

     const filtered = items.filter(i => i.name.includes(text));
     const themeStyle = { color: theme === 'dark' ? '#fff' : '#000' };

     return (
       <div style={themeStyle}>
         <input value={text} onChange={e => setText(e.target.value)} />
         <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>切换主题</button>
         <Child items={filtered} onClick={() => console.log('clicked')} />
       </div>
     );
   }
   ```
3. **虚拟列表**：用 react-window 实现一个 10 万条数据的表格，要求滚动流畅

---

[← 14 - 状态管理进阶](../14-state-management/) | [→ 16 - TypeScript 与 React](../16-typescript-react/)
