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

## 🔬 React 性能优化的底层原理

### 1. React 渲染性能的本质

#### 渲染 ≠ DOM 更新（Render vs Paint）

很多开发者把"渲染"和"DOM 更新"混为一谈，这是理解性能优化的第一步：

```
React 渲染（Render）：
  执行组件函数 → 生成新的 React Element（虚拟 DOM）
  
  ⏱️ 速度：快（纯 JS 计算，通常 < 1ms）
  💡 类比：重新画一张设计图纸

DOM 更新（Commit + Paint）：
  对比新旧虚拟 DOM → 计算差异 → 修改真实 DOM → 浏览器重绘
  
  ⏱️ 速度：慢（涉及浏览器布局计算、重绘，可能 > 16ms）
  💡 类比：按照新图纸实际施工装修

关键结论：
  ❌ 渲染慢 ≠ DOM 更新慢
  ✅ 渲染快但次数太多 → 也会造成卡顿
  ✅ 减少不必要的渲染 = 减少 JS 执行时间
  ✅ 减少 DOM 操作 = 减少浏览器工作量
```

> 💡 **大白话**：渲染（Render）就像建筑师"重新画图纸"，DOM 更新就像施工队"按图纸拆墙砌砖"。画图纸很快，但施工很慢。所以优化性能要两手抓：既减少画图纸的次数（减少渲染），也减少施工的面积（减少 DOM 更新）。

#### 一次 setState 触发了多少次组件函数调用？

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');

  const handleClick = () => {
    setCount(1);    // 触发渲染 #1？
    setCount(2);    // 触发渲染 #2？
    setName('JS');  // 触发渲染 #3？
  };

  return (
    <div>
      <p>{count} {name}</p>
      <Child />     {/* Child 会被渲染几次？ */}
      <button onClick={handleClick}>更新</button>
    </div>
  );
}

function Child() {
  console.log('Child 渲染了');
  return <div>I am Child</div>;
}
```

**答案：整个组件树只渲染 1 次！**

```
setState 被调用 3 次的完整流程：

  setCount(1) → React 标记 count 需要更新
  setCount(2) → React 覆盖标记：count 更新为 2（覆盖了 1）
  setName('JS') → React 标记 name 需要更新
  
  handleClick 执行完毕
  
  ↓ React 进入"批量更新"（Batching）
  
  ↓ 收集所有状态变化：count → 2, name → 'JS'
  
  ↓ 重新执行 App 函数（第 1 次也是唯一 1 次）
    → 生成新的 React Element 树
    
  ↓ Diff 对比新旧树
    
  ↓ 只有变化的部分更新到 DOM
    
  ↓ Child 的 React Element 与上次相同（没有变化）
    → 但 Child 的函数仍然被调用了 1 次！
    → 因为 Child 是 App 的子组件，父组件渲染时子组件默认跟着渲染
```

> ⚠️ **关键发现**：React 18 的自动批处理（Automatic Batching）确保了多次 `setState` 合并为一次渲染。但子组件 `Child` 虽然输出没变，它的函数仍然被调用了。这就是为什么需要 `React.memo`。

#### 用 React DevTools Profiler 分析渲染

```
Profiler 的关键指标：

┌──────────────────────────────────────────────────┐
│  🔍 Profiler 面板                                │
│                                                   │
│  组件名            渲染次数    渲染耗时    原因    │
│  ─────────────────────────────────────            │
│  App                1       0.5ms     state 变化 │
│  ├─ Header          1       0.2ms     父组件渲染 │
│  │  ├─ Logo         1       0.1ms     父组件渲染 │
│  │  └─ Nav          1       0.3ms     父组件渲染 │
│  ├─ MainContent     1       0.8ms     父组件渲染 │
│  │  └─ TodoList     1       5.2ms     父组件渲染 │  ⚠️ 慢！
│  └─ Footer          1       0.1ms     父组件渲染 │
│                                                   │
│  💡 TodoList 耗时 5.2ms，远超其他组件              │
│     这就是需要优化的目标！                         │
└──────────────────────────────────────────────────┘
```

---

### 2. React.memo 的原理和局限

#### 浅比较（Shallow Compare）的实现

`React.memo` 的核心就是一个**浅比较函数**：

```javascript
// React.memo 的内部简化实现
function memo(Component, areEqual) {
  function MemoizedComponent(props) {
    // 获取上一次的 props（存在 Fiber 上）
    const prevProps = currentFiber.memoizedProps;

    // 如果没有提供自定义比较函数，使用默认的浅比较
    if (areEqual === undefined) {
      areEqual = shallowEqual;
    }

    // 比较：如果 props 没变，返回缓存的 React Element
    if (prevProps !== null && areEqual(prevProps, props)) {
      // 返回上一次渲染的结果，跳过组件函数执行！
      return currentFiber.memoizedResult;
    }

    // props 变了，重新执行组件函数
    const result = Component(props);
    // 缓存结果
    currentFiber.memoizedProps = props;
    currentFiber.memoizedResult = result;
    return result;
  }

  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

// 默认的浅比较实现
function shallowEqual(prevProps, nextProps) {
  if (prevProps === nextProps) return true;
  
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  // 属性数量不同 → 不等
  if (prevKeys.length !== nextKeys.length) return false;
  
  // 逐个比较每个属性（用 Object.is）
  for (const key of prevKeys) {
    if (!Object.is(prevProps[key], nextProps[key])) {
      return false;  // 有任何属性不等 → 不等
    }
  }
  
  return true;  // 所有属性都相等
}
```

> 💡 **大白话**：浅比较就像比对两张身份证——只看名字、身份证号是否完全一样。它不会深入比较里面的"户籍地址"（嵌套对象）。

#### 为什么对引用类型无效？

```javascript
// 浅比较的关键：用 Object.is 比较
Object.is(1, 1);           // true  ✅
Object.is('hello', 'hello'); // true  ✅
Object.is(true, true);      // true  ✅

// 但是引用类型……
Object.is({}, {});          // false ❌（两个不同的对象）
Object.is([], []);          // false ❌（两个不同的数组）
Object.is(() => {}, () => {}); // false ❌（两个不同的函数）

// 即使内容完全一样！
const a = { name: '张三', age: 25 };
const b = { name: '张三', age: 25 };
Object.is(a, b);  // false ❌（不同的内存地址）
```

```
这为什么是 React 性能问题 #1？

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      
      {/* 每次渲染都创建新的对象/数组/函数 */}
      <MemoChild
        style={{ color: 'red' }}           // 新对象！
        items={[1, 2, 3]}                  // 新数组！
        onClick={() => console.log('hi')}  // 新函数！
      />
    </div>
  );
}

每次 count 变化 → Parent 渲染 → 创建新的 style/items/onClick
→ memo 浅比较发现引用全变了 → MemoChild 无辜重渲染
→ memo 完全失效了！
```

#### 自定义比较函数的正确写法

```jsx
// 当 props 中包含复杂对象时，可以自定义比较逻辑
const MemoChild = memo(function MemoChild({ style, items, onClick }) {
  return <div style={style}>{items.map(i => <span key={i}>{i}</span>)}</div>;
}, function areEqual(prevProps, nextProps) {
  // 返回 true = props 相等，不需要重渲染
  // 返回 false = props 不等，需要重渲染
  
  // 自定义深度比较
  return (
    prevProps.style.color === nextProps.style.color &&
    prevProps.items.length === nextProps.items.length &&
    prevProps.onClick === nextProps.onClick  // 函数还是用引用比较
  );
});

// ⚠️ 注意：自定义比较函数应该返回"props 是否相等"
// 不要搞反了！返回 true = 不渲染，返回 false = 渲染
```

> ⚠️ **慎用自定义比较函数**：如果比较逻辑本身很复杂（比如深比较），那比较的开销可能比重渲染还大。更好的方案是从源头避免创建新的引用（用 `useMemo`/`useCallback`）。

#### 什么时候不该用 React.memo？（过度优化的代价）

```
过度使用 memo 的代价：

  每个 memo 组件都有额外的开销：
  ┌──────────────────────────────────────────────┐
  │  1. 存储上一次的 props 和渲染结果（内存开销）  │
  │  2. 每次父组件渲染时执行浅比较（CPU 开销）     │
  │  3. 增加 React 内部的复杂度（维护开销）        │
  └──────────────────────────────────────────────┘

  如果组件渲染本身就很快（< 0.1ms）：
    浅比较的开销 ≈ 渲染开销
    → memo 没有带来任何收益，反而增加了代码复杂度

  如果组件几乎没有重渲染的机会：
    memo 永远不会"跳过"渲染
    → memo 就是一个纯粹的开销
```

**决策指南：**

```
该用 memo 吗？

  组件渲染成本高吗？（包含复杂计算、大量子节点）
  ├── 否 → ❌ 不需要 memo
  └── 是 →
      父组件频繁重渲染吗？
      ├── 否 → ❌ 不需要 memo
      └── 是 →
          props 不变时能跳过渲染吗？
          ├── 否（每次 props 都变）→ ❌ memo 无效
          └── 是 → ✅ 使用 memo
```

---

### 3. useMemo 和 useCallback 的原理

#### useMemo 是缓存值 vs useCallback 是缓存函数

```javascript
// useMemo：缓存一个计算结果（值）
const total = useMemo(() => a + b + c, [a, b, c]);
// 当 a/b/c 变化时才重新计算，否则返回缓存值

// useCallback：缓存一个函数引用
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
// 当 count 变化时才创建新函数，否则返回同一个函数

// 本质上：
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);

// 等价于：
const handleClick = useMemo(() => () => {
  console.log(count);
}, [count]);

// useCallback 就是 useMemo 的语法糖，专门用于缓存函数
```

```
两者的关系：

  useMemo(() => value, deps)    → 缓存任意值（对象、数字、字符串……）
  useMemo(() => fn, deps)       → 缓存函数（但不推荐这么写）
  useCallback(fn, deps)          → 缓存函数（推荐写法，语义更清晰）

  ┌─────────────┐
  │ useMemo     │ ──→ 缓存：计算结果、配置对象、数组
  │ useCallback │ ──→ 缓存：事件处理函数、回调函数
  └─────────────┘
```

#### 它们的内部实现原理（依赖数组的比较）

```javascript
// useMemo 的简化内部实现
function useMemo(createFn, deps) {
  // 获取当前 Hook 对应的 Fiber 内存槽位
  const hook = currentFiber.memoizedState;

  if (hook !== null) {
    // 不是首次渲染，比较依赖数组
    const prevDeps = hook.memoizedDeps;
    
    // 逐个比较每个依赖项（使用 Object.is）
    let depsChanged = false;
    for (let i = 0; i < deps.length; i++) {
      if (!Object.is(deps[i], prevDeps[i])) {
        depsChanged = true;
        break;
      }
    }

    if (!depsChanged) {
      // 依赖没变 → 返回缓存值
      return hook.memoizedValue;
    }
  }

  // 首次渲染 或 依赖变了 → 执行函数，缓存结果
  const value = createFn();
  currentFiber.memoizedState = {
    memoizedValue: value,    // 缓存计算结果
    memoizedDeps: deps,       // 缓存依赖数组
  };
  return value;
}
```

> 💡 **大白话**：依赖数组的比较就像"购物清单核对"。每次渲染时，React 拿着新的购物清单和上次的逐一对比。如果每样东西都一样，就用上次的缓存。如果有一项不同，就重新采购（重新计算）。

#### 为什么 useMemo 不总是免费的午餐？（缓存本身的计算开销）

```
useMemo 的成本分析：

  ┌────────────────────────────────────────────────┐
  │  useMemo 的额外开销：                           │
  │                                                │
  │  1. 存储缓存值和依赖数组（内存 ~100 bytes/次）  │
  │  2. 每次渲染时比较依赖数组（O(n) 时间）         │
  │  3. React 内部的 Hook 调度开销                  │
  └────────────────────────────────────────────────┘

  如果计算本身只需要 0.001ms：
  ┌────────────────────────────────────────────────┐
  │  不用 useMemo：每次渲染直接计算 = 0.001ms       │
  │  用 useMemo：比较依赖 + 缓存读取 = 0.002ms     │
  │                                                │
  │  💡 用了反而更慢！                              │
  └────────────────────────────────────────────────┘

  如果计算需要 50ms：
  ┌────────────────────────────────────────────────┐
  │  不用 useMemo：每次渲染都计算 = 50ms            │
  │  用 useMemo：比较依赖 = 0.002ms，命中缓存       │
  │                                                │
  │  💡 节省了 49.998ms，非常值得！                 │
  └────────────────────────────────────────────────┘
```

#### 何时真正需要 useMemo/useCallback（决策指南）

```
useMemo 决策树：

  计算结果用在哪？
  ├── 直接渲染到 JSX（如字符串、数字）
  │   └── 计算快吗（< 1ms）？
  │       ├── 是 → ❌ 不需要 useMemo（缓存开销 > 计算开销）
  │       └── 否 → ⚠️ 考虑 useMemo
  │
  ├── 作为 props 传给 React.memo 子组件
  │   └── ✅ 需要 useMemo（防止 memo 失效）
  │
  ├── 作为 useEffect/useMemo 的依赖
  │   └── ✅ 需要 useMemo（防止 effect 重复执行）
  │
  └── 作为其他 Hook 的参数
      └── ✅ 需要 useMemo（保持引用稳定）

useCallback 决策树：

  函数用在哪？
  ├── 传给非 memo 的普通子组件
  │   └── ❌ 不需要（子组件反正每次都渲染）
  │
  ├── 传给 React.memo 子组件
  │   └── ✅ 需要（防止 memo 失效）
  │
  ├── 作为 useEffect 的依赖
  │   └── ✅ 需要（防止 effect 重复执行）
  │
  ├── 传给第三方库（如 D3、Three.js）
  │   └── ✅ 可能需要（库可能内部做了引用比较）
  │
  └── 只在当前组件内部使用
      └── ❌ 不需要
```

> ⚠️ **React 团队的建议**：不要把 `useMemo` 和 `useCallback` 当作默认选择。只有在 Profiler 证明有性能问题后，才针对性地添加。过度使用反而会降低代码可读性。

---

### 4. 虚拟列表的原理

#### 为什么长列表会卡？（DOM 节点数量 vs 渲染性能）

```
DOM 节点数量对性能的影响：

  节点数        渲染时间      用户体验
  ──────────────────────────────────
  100          ~5ms          极其流畅
  1,000        ~15ms         流畅
  5,000        ~50ms         偶尔卡顿 ⚠️
  10,000       ~150ms        明显卡顿 ❌
  50,000       ~1000ms       严重卡顿 ❌❌
  100,000+     崩溃 💀       不可用

为什么会卡？

  1. 创建 DOM 节点很慢（每个节点需要浏览器分配内存）
  2. React 对比 10 万个节点的虚拟 DOM 很慢（O(n) 遍历）
  3. 浏览器计算 10 万个节点的布局很慢（Layout/Reflow）
  4. 滚动事件频率极高（每秒 60 次），每次都要处理所有节点
```

> 💡 **大白话**：想象一个图书馆，里面有 10 万本书全部摆在一张桌子上。你想找其中一本，得一本一本地翻。这就是"不使用虚拟列表"的情况。虚拟列表就像把大部分书放进书架，桌上只放你正在看的几本——找起来自然快得多。

#### 虚拟列表的核心思想：只渲染可视区域

```
虚拟列表原理图：

  ┌─────────────────────────────────┐
  │         滚动容器                 │
  │  ┌───────────────────────────┐  │
  │  │ ← 已滚过（不渲染）        │  │
  │  │   Item 0 (不渲染)         │  │
  │  │   Item 1 (不渲染)         │  │
  │  │   ...                     │  │
  │  ├───────────────────────────┤  │
  │  │ ↑ 上方缓冲区（预渲染 2-3  │  │
  │  │   个，避免快速滚动时白屏）│  │
  │  │   Item 8                  │  │  ← 实际 DOM
  │  │   Item 9                  │  │  ← 实际 DOM
  │  │ ┌─────────────────────┐   │  │
  │  │ │                     │   │  │  ← 可视区域
  │  │ │   Item 10 (可见)    │   │  │     (Viewport)
  │  │ │   Item 11 (可见)    │   │  │
  │  │ │   Item 12 (可见)    │   │  │
  │  │ │   Item 13 (可见)    │   │  │
  │  │ │                     │   │  │
  │  │ └─────────────────────┘   │  │
  │  │   Item 14                 │  │  ← 实际 DOM
  │  │   Item 15                 │  │  ← 实际 DOM
  │  │ ↓ 下方缓冲区（预渲染）    │  │
  │  ├───────────────────────────┤  │
  │  │   Item 16 (不渲染)        │  │
  │  │   Item 17 (不渲染)        │  │
  │  │   ...                     │  │
  │  │   Item 99999 (不渲染)     │  │
  │  └───────────────────────────┘  │
  └─────────────────────────────────┘

  关键参数：
  - 视口高度（viewportHeight）：可视区域能显示多少内容
  - 行高（itemSize）：每一项的高度
  - 可见项数 = viewportHeight / itemSize
  - 起始索引 = Math.floor(scrollTop / itemSize)
  - 总高度 = totalCount × itemSize（用空白或 transform: translateY 占位）
```

#### react-window / react-virtualized 的实现原理图示

```javascript
// ====== 一个最简虚拟列表实现（约 40 行）======
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // 计算可视区域范围
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // +2 作为缓冲
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount, items.length);
  
  // 只取可视范围的 items
  const visibleItems = items.slice(startIndex, endIndex);
  
  // 总高度（撑开滚动条）
  const totalHeight = items.length * itemHeight;
  // 可视区域的偏移（让当前项出现在正确位置）
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      {/* 占位元素：撑开总高度，使滚动条正确 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 实际渲染的列表项，用 transform 定位 */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => {
            const realIndex = startIndex + i;
            return (
              <div key={realIndex} style={{ height: itemHeight }}>
                第 {realIndex} 项: {item.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

```
滚动时的更新流程：

  用户向下滚动 200px
    ↓
  onScroll 触发 → scrollTop = 200
    ↓
  重新计算：
    startIndex = Math.floor(200 / 50) = 4
    endIndex = 4 + 12 + 2 = 18（12 是可视数量 + 2 缓冲）
    offsetY = 4 × 50 = 200px
    ↓
  只渲染 items[4] 到 items[18]，共 16 个 DOM 节点
    ↓
  用 transform: translateY(200px) 将它们放到正确位置
    ↓
  性能：始终只有 ~16 个 DOM 节点，不管总数是 100 还是 100,000
```

#### 动态高度的虚拟列表难点

```
固定高度 vs 动态高度：

  固定高度（简单）：
  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
  │ 50px│ │ 50px│ │ 50px│ │ 50px│   每行高度一样
  └─────┘ └─────┘ └─────┘ └─────┘
  
  直接用数学公式计算：
  startIndex = scrollTop / itemHeight  ✅ 精确

  动态高度（困难）：
  ┌────────┐ ┌────┐ ┌──────────────┐
  │ 120px  │ │30px│ │  80px        │   每行高度不同
  │ 带图片 │ │文本│ │  带评论/图片  │
  └────────┘ └────┘ └──────────────┘

  问题：
  1. 不知道第 N 项在什么位置 → 无法直接算 startIndex
  2. 不知道总高度 → 无法正确设置滚动条

  解决方案：
  ┌──────────────────────────────────────────┐
  │  位置缓存（Measured Positions）           │
  │                                           │
  │  渲染过的每项高度都记录下来：               │
  │  positions = {                            │
  │    0: { top: 0,    height: 120, bottom: 120 },│
  │    1: { top: 120, height: 30,  bottom: 150 },│
  │    2: { top: 150, height: 80,  bottom: 230 },│
  │    3: { top: 230, height: ?,    bottom: ? },│ ← 还没渲染，高度未知
  │    ...                                     │
  │  }                                         │
  │                                           │
  │  查找 startIndex：                          │
  │  用二分查找在 positions 中搜索               │
  │  找到第一个 bottom > scrollTop 的索引       │
  │                                           │
  │  估算未渲染项的高度：                        │
  │  用已渲染项的平均高度作为估算值             │
  │  avgHeight = sum(known) / count(known)     │
  │                                           │
  │  滚动条总高度 = 已知部分 + 估算部分          │
  └──────────────────────────────────────────┘
```

> 💡 **动态高度虚拟列表的库推荐**：
> - `react-virtuoso`：开箱即用，自动处理动态高度，API 最友好
> - `react-window` 的 `VariableSizeList`：需要手动提供每项的高度
> - `@tanstack/react-virtual`：Headless 设计，可以配合任何 UI

## 🔬 性能调试实战完全指南

### 1. React Profiler 深度使用教程

#### 启用和打开 React Profiler

```
React Profiler 的启用方式：

  开发环境（推荐）：
  ┌────────────────────────────────────────────────┐
  │  1. 安装 React DevTools 浏览器扩展               │
  │     Chrome: Chrome Web Store 搜索 React DevTools │
  │     Firefox: Firefox Add-ons 搜索 React DevTools │
  │                                                 │
  │  2. 打开 DevTools → 点击 ⚛️ React 标签           │
  │                                                 │
  │  3. 点击 Profiler 子标签（⚛️ 旁边的齿轮图标）     │
  │                                                 │
  │  ⚠️ Profiler 仅在开发模式下可用                   │
  └────────────────────────────────────────────────┘

  生产环境：
  ┌────────────────────────────────────────────────┐
  │  需要在构建时注入 profiling 包：                   │
  │                                                 │
  │  webpack:                                       │
  │    resolve.alias: {                             │
  │      'react-dom$': 'react-dom/profiling',       │
  │      'scheduler/tracing': 'scheduler/tracing-profiling', │
  │    }                                            │
  │                                                 │
  │  ⚠️ 生产 Profiling 会增加额外的性能开销           │
  │     只在需要时临时启用                            │
  └────────────────────────────────────────────────┘
```

#### Profiler 界面每个指标的含义

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 React Profiler 界面详解                                    │
│                                                               │
│  ┌─ 工具栏 ─────────────────────────────────────────────────┐ │
│  │ ● Record (录制)  ⏸ Stop (停止)  🔄 Reload (重新加载)    │ │
│  │ [Flamegraph ▼] [Ranked ▼]    [Filter: 组件名筛选]       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─ 选中组件后的详情面板 ───────────────────────────────────┐ │
│  │                                                          │ │
│  │  📊 Rendered (渲染次数)                                   │ │
│  │     该组件在此次录制中被渲染的总次数                        │ │
│  │     💡 如果次数远高于预期，说明存在不必要的重渲染           │ │
│  │                                                          │ │
│  │  ⏱️ Actual duration (实际耗时)                            │ │
│  │     该组件本次渲染实际花费的时间                           │ │
│  │     💡 如果 > 16ms，可能导致帧丢失（卡顿）                 │ │
│  │                                                          │ │
│  │  📏 Base duration (基础耗时)                              │ │
│  │     不考虑 memo 等优化时的预计耗时                        │ │
│  │     💡 Actual < Base 说明 memo/useMemo 发挥了作用         │ │
│  │                                                          │ │
│  │  🏆 Rank (排名)                                          │ │
│  │     该组件在所有组件中按耗时从高到低的排名                  │ │
│  │     💡 优先优化排名靠前的组件                              │ │
│  │                                                          │ │
│  │  🤔 Why did this render? (为什么渲染？)                   │ │
│  │     显示触发此次渲染的原因                                 │ │
│  │     如：Props changed / Hook changed / Context changed    │ │
│  │     💡 这是定位不必要渲染的最关键信息！                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

#### 火焰图（Flamegraph）和排序图（Ranked）的区别

```
Flamegraph（火焰图）— 展示组件层级关系：

  ┌──────────────────────────────────────────┐
  │              App (10ms)                   │
  │  ┌──────────────┐  ┌─────────────────┐   │
  │  │ Header (1ms) │  │ Main (8ms)      │   │
  │  └──────────────┘  │ ┌─────────────┐ │   │
  │                     │ │ List (6ms)  │ │   │  ← 最宽的 = 最慢的
  │                     │ └─────────────┘ │   │
  │                     └─────────────────┘   │
  └──────────────────────────────────────────┘

  💡 横轴 = 渲染时间，纵轴 = 组件嵌套层级
  💡 宽度越大的组件耗时越多
  💡 适合分析"哪个组件树最慢"

Ranked（排序图）— 按耗时从高到低排列：

  组件名            渲染次数    实际耗时    基础耗时
  ─────────────────────────────────────────────
  TodoList            12       8.2ms      8.2ms   ← ⚠️ 最慢
  Header              12       2.1ms      2.1ms
  Sidebar             12       1.8ms      1.8ms
  SearchBar           12       1.2ms      1.2ms
  Footer              12       0.3ms      0.3ms

  💡 直接按耗时排序，一眼看出"最慢的 N 个组件"
  💡 适合快速定位性能瓶颈
```

#### "Why did this render?" 功能的使用方法

```
使用步骤：
  1. 录制一次交互
  2. 在火焰图或排序图中点击某个组件
  3. 右侧面板会显示 "Why did this render?"

典型输出：
  ┌──────────────────────────────────────────────┐
  │  🔍 Why did TodoList render?                 │
  │                                               │
  │  Props changed:                               │
  │    • items: Array (prev 10 → next 10)        │
  │      ↑ 列表长度相同但引用变了！                 │
  │                                               │
  │  Hook changed:                                │
  │    • useState (index 0): "new filter"        │
  │      ↑ state 值变化触发的渲染                  │
  │                                               │
  │  💡 建议：items 的引用变化可能是不必要的       │
  │     检查父组件是否每次都创建了新数组           │
  └──────────────────────────────────────────────┘

  ⚠️ 注意：需安装 React DevTools v4.18+ 才支持此功能
```

#### 录制和分析一次用户交互的性能

```jsx
// 使用 React 的 Profiler API 编程式录制
import { Profiler } from 'react';

// 定义渲染回调，收集详细数据
function onRenderCallback(
  id,                // 组件的 id 标识
  phase,             // "mount"（首次渲染）或 "update"（更新）
  actualDuration,    // 本次渲染实际耗时
  baseDuration,      // 无 memo 时的预估耗时
  startTime,         // 渲染开始时间戳
  commitTime,        // 渲染提交到 DOM 的时间戳
  interactions       // 触发此次渲染的交互集合（调度追踪）
) {
  // 只记录耗时超过 16ms 的渲染（可能掉帧）
  if (actualDuration > 16) {
    console.warn(
      `[性能警告] ${id} (${phase}) 耗时 ${actualDuration.toFixed(2)}ms`,
      {
        baseDuration: baseDuration.toFixed(2),
        savings: (baseDuration - actualDuration).toFixed(2),
        interactions: interactions.map(i => i.id),
      }
    );
  }
}

// 用 Profiler 包裹需要分析的组件
function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Main />
    </Profiler>
  );
}
```

```
📊 录制分析的完整流程：

  步骤 1：准备环境
  ┌─────────────────────────────────────────┐
  │  • 确保在开发模式运行                    │
  │  • 打开 React DevTools → Profiler 标签  │
  │  • 关闭其他可能影响性能的扩展            │
  └─────────────────────────────────────────┘

  步骤 2：录制基线
  ┌─────────────────────────────────────────┐
  │  • 点击 Record (●)                      │
  │  • 执行典型的用户操作（如搜索、滚动）    │
  │  • 停止录制                              │
  │  • 记录各组件的耗时数据作为基线          │
  └─────────────────────────────────────────┘

  步骤 3：分析瓶颈
  ┌─────────────────────────────────────────┐
  │  • 切换到 Ranked 视图，找到最慢的组件    │
  │  • 点击该组件，查看 "Why did this render"│
  │  • 确定是 props 变化、state 变化还是     │
  │    Context 变化导致的渲染                │
  └─────────────────────────────────────────┘

  步骤 4：优化并对比
  ┌─────────────────────────────────────────┐
  │  • 添加 memo / useMemo / useCallback     │
  │  • 重新录制同样的操作                    │
  │  • 对比优化前后的耗时差异                │
  └─────────────────────────────────────────┘
```

#### 导出 Profiler 数据进行分析

```
导出方式：

  1. 从 React DevTools 导出：
  ┌────────────────────────────────────────────────┐
  │  Profiler 面板 → 右上角 "..." → Export          │
  │  导出为 .json 文件                              │
  │                                                │
  │  可用第三方工具分析：                            │
  │  • https://github.com/nickygerritsen/react-profiler-browser │
  │  • 自写脚本解析 JSON 数据                       │
  └────────────────────────────────────────────────┘

  2. 编程式收集（onRenderCallback）：
  ┌────────────────────────────────────────────────┐
  │  将数据发送到监控服务：                          │
  │                                                │
  │  const renderData = [];                        │
  │  function onRender(id, phase, actualDuration) {│
  │    renderData.push({ id, phase, actualDuration });│
  │    // 批量上报到后端                            │
  │    if (renderData.length > 100) {              │
  │      fetch('/api/perf', {                     │
  │        method: 'POST',                         │
  │        body: JSON.stringify(renderData),       │
  │      });                                       │
  │      renderData.length = 0;                    │
  │    }                                           │
  │  }                                             │
  └────────────────────────────────────────────────┘
```

---

### 2. Chrome DevTools Performance 分析

#### 录制 React 应用性能的步骤

```
📊 Chrome Performance 录制完整流程：

  准备阶段：
  ┌─────────────────────────────────────────────────┐
  │  1. 打开 Chrome DevTools → Performance 标签     │
  │  2. 勾选 "Screenshots"（截图）和 "Web Vitals"   │
  │  3. 设置 CPU 降速（可选）：                       │
  │     Settings → Throttling → 4x slowdown        │
  │     💡 模拟中低端手机性能                        │
  └─────────────────────────────────────────────────┘

  录制阶段：
  ┌─────────────────────────────────────────────────┐
  │  4. 点击 ● Record（或按 Ctrl+E）               │
  │  5. 在页面上执行典型用户操作：                   │
  │     • 打开页面                                  │
  │     • 搜索 / 过滤                               │
  │     • 滚动列表                                  │
  │     • 切换页面                                  │
  │  6. 等待 2-3 秒后再次点击 ● Stop               │
  │                                                │
  │  ⚠️ 录制时间不要太长（5-10秒最佳）              │
  │     过长的录制会产生过多数据，难以分析           │
  └─────────────────────────────────────────────────┘

  分析阶段：
  ┌─────────────────────────────────────────────────┐
  │  7. 查看 Summary 面板（总览）                   │
  │  8. 查看 Main Thread 面板（主线程火焰图）       │
  │  9. 查看 Bottom-Up 面板（耗时排名）             │
  │  10. 查看 Interactions 面板（交互响应时间）     │
  └─────────────────────────────────────────────────┘
```

#### 如何看懂 Main Thread 面板

```
Main Thread 面板（主线程火焰图）：

  时间轴 ──────────────────────────────────────────→

  0ms              100ms             200ms            300ms
  ├─────────────────┼─────────────────┼─────────────────┤
  │ ████████████████│                 │                 │
  │ │ Parse HTML    │                 │                 │
  │ │ ██████████    │                 │                 │
  │ │ │ Eval Script │                 │                 │
  │ │ │ ████████████████████████████ │                 │
  │ │ │ │ React Reconciler           │                 │
  │ │ │ │ ██████████████████████████ │                 │
  │ │ │ │ │ Component Render         │  ⚠️ Long Task   │
  │ │ │ │ ████████████████████████████████████████████│
  │ │ │ │ │ DOM Update (Commit)     │                  │
  │ │ │ │ │ ████████████████        │                  │
  │ │ │ │ │ │ Layout (Reflow)       │  ❌ 强制布局     │
  │ │ │ │ ████████████████████████████████████████████│
  │ │ │ │ │ Event Handler (onClick) │                  │

  颜色含义：
  ┌────────────────────────────────────────────────┐
  │  🟨 黄色 — JavaScript 执行（脚本解析/执行）    │
  │  🟪 紫色 — DOM 相关（Layout / Paint）          │
  │  🟩 绿色 — 样式计算（Style Recalculation）     │
  │  🟦 蓝色 — Loading / Parsing（资源加载）       │
  │  ⬜ 灰色 — Idle（空闲）                         │
  └────────────────────────────────────────────────┘
```

#### 识别 Long Tasks（超过 50ms 的任务）

```
Long Tasks 的识别：

  ┌──────────────────────────────────────────────────────┐
  │  什么是 Long Task？                                   │
  │                                                       │
  │  浏览器的事件循环以约 16.67ms 为一帧（60fps）。        │
  │  如果某个 JavaScript 任务连续执行超过 50ms，            │
  │  它就是一个 "Long Task"，会阻塞用户交互。              │
  │                                                       │
  │  帧时间线：                                           │
  │  ┌─── 16ms ───┐┌─── 16ms ───┐┌─── 16ms ───┐       │
  │  │  正常帧 ✅  ││  正常帧 ✅  ││  正常帧 ✅  │       │
  │  └────────────┘└────────────┘└────────────┘         │
  │                                                       │
  │  ┌────────── 150ms ──────────────────────────┐       │
  │  │  Long Task ❌                              │       │
  │  │  阻塞了约 9 帧！用户感觉"页面卡死了"       │       │
  │  └───────────────────────────────────────────┘       │
  └──────────────────────────────────────────────────────┘

  在 Chrome Performance 中识别：
  ┌──────────────────────────────────────────────────────┐
  │  • Main Thread 火焰图中的长条 = Long Task             │
  │  • Summary 面板会显示 "Long Tasks" 数量               │
  │  • 红色三角标记 = 可能的性能问题                      │
  │                                                       │
  │  ⚠️ 如果看到 React 相关的 Long Task：                 │
  │     1. 检查组件是否有昂贵的计算                       │
  │     2. 检查列表渲染数量是否过大                       │
  │     3. 考虑用 useTransition 或 Web Worker             │
  └──────────────────────────────────────────────────────┘
```

#### Layout / Paint / Composite 的含义

```
浏览器渲染流水线（关键渲染路径）：

  JavaScript ──→ Style ──→ Layout ──→ Paint ──→ Composite
     │            │          │          │          │
     │  修改DOM   │  计算样式 │  计算位置 │  填充像素 │  合成图层
     │  /样式     │          │  /大小   │          │
     ▼            ▼          ▼          ▼          ▼

  ┌────────────────────────────────────────────────────┐
  │  各阶段详解：                                       │
  │                                                     │
  │  📐 Layout（布局/回流）                              │
  │     计算每个元素的位置和大小                          │
  │     成本：⭐⭐⭐⭐⭐（最昂贵）                       │
  │     触发：改变 width/height/padding/margin/         │
  │           display/position 等几何属性               │
  │                                                     │
  │  🎨 Paint（绘制）                                   │
  │     填充像素（颜色、文字、图片、边框等）             │
  │     成本：⭐⭐⭐⭐                                   │
  │     触发：改变 color/background/box-shadow/         │
  │           visibility 等视觉属性                     │
  │                                                     │
  │  🖼️ Composite（合成）                               │
  │     将多个图层合并成最终画面                          │
  │     成本：⭐（最便宜）                               │
  │     触发：transform / opacity                       │
  │     💡 GPU 加速，不影响其他元素                     │
  │                                                     │
  │  ⚡ 性能优化核心原则：                               │
  │     尽量只触发 Composite（transform + opacity）      │
  │     避免 Layout → 它会触发整条流水线重新执行         │
  └────────────────────────────────────────────────────┘
```

#### 如何判断卡顿是由 React 渲染还是 DOM 操作引起的

```
🔍 排查流程：

  步骤 1：录制 Performance
  ┌─────────────────────────────────────────────────┐
  │  同时打开：                                     │
  │  • Chrome Performance 面板                       │
  │  • React DevTools Profiler                      │
  └─────────────────────────────────────────────────┘

  步骤 2：分析 Main Thread 中的时间分布
  ┌─────────────────────────────────────────────────┐
  │  情况 A：黄色（JavaScript）占据大部分时间        │
  │  ┌──────────────────────────────────────┐       │
  │  │ ████████████████████████████████      │       │
  │  │ █ React Reconciler (JS计算) █         │       │
  │  │ ████████████████████████████████      │       │
  │  │ 🟪 Layout 🟪 Paint                    │       │
  │  └──────────────────────────────────────┘       │
  │  → 瓶颈在 React 渲染逻辑                         │
  │  → 优化：memo / useMemo / 减少渲染次数          │
  │                                                 │
  │  情况 B：紫色（Layout）占据大部分时间            │
  │  ┌──────────────────────────────────────┐       │
  │  │ 🟨 JS (很短) 🟨                       │       │
  │  │ ████████████████████████████████████  │       │
  │  │ █ Forced Layout (强制布局) █           │       │
  │  │ ████████████████████████████████████  │       │
  │  └──────────────────────────────────────┘       │
  │  → 瓶颈在 DOM 布局计算                           │
  │  → 优化：避免强制布局、使用 transform 替代       │
  │                                                 │
  │  情况 C：JS 和 Layout 都长                       │
  │  ┌──────────────────────────────────────┐       │
  │  │ ██████████████████████████████████   │       │
  │  │ █ JS ████ Layout ████ Paint ██████   │       │
  │  │ ██████████████████████████████████   │       │
  │  └──────────────────────────────────────┘       │
  │  → 两个环节都有问题                              │
  │  → 优化：先修 React 渲染，再修 DOM 操作         │
  └─────────────────────────────────────────────────┘

  步骤 3：交叉验证
  ┌─────────────────────────────────────────────────┐
  │  • React Profiler 显示组件渲染 < 5ms             │
  │    → 但 Chrome Performance 显示总耗时 > 100ms     │
  │    → 瓶颈在 DOM 更新，不在 React                 │
  │                                                 │
  │  • React Profiler 显示某组件渲染 > 50ms          │
  │    → 瓶颈在 React 渲染逻辑                       │
  │    → 用 memo / 拆分组件 / 虚拟列表               │
  └─────────────────────────────────────────────────┘
```

#### Performance 面板与 React Profiler 的配合使用

```
配合使用的最佳实践：

  ┌─────────────────────────────────────────────────────┐
  │  React Profiler 擅长：                              │
  │  ✅ 识别哪些组件渲染太慢                            │
  │  ✅ 识别哪些组件渲染太频繁                          │
  │  ✅ 查看 "Why did this render?"                    │
  │  ✅ 对比优化前后的组件级性能                        │
  │                                                     │
  │  Chrome Performance 擅长：                          │
  │  ✅ 分析整体页面加载性能                            │
  │  ✅ 识别 Long Tasks 和主线程阻塞                    │
  │  ✅ 分析 Layout / Paint 开销                       │
  │  ✅ 检查网络请求瀑布流                              │
  │  ✅ 测量 Core Web Vitals                           │
  │                                                     │
  │  📋 推荐的组合工作流：                              │
  │                                                     │
  │  1. Chrome Performance → 整体诊断（发现卡顿帧）     │
  │  2. React Profiler → 定位到具体组件                  │
  │  3. Chrome Performance → 确认优化效果               │
  │  4. React Profiler → 验证渲染次数减少              │
  └─────────────────────────────────────────────────────┘
```

---

### 3. 常见性能问题排查手册

#### 问题 1："页面打开很慢"

```
📊 症状：用户访问页面后白屏时间长（> 3 秒才有内容）

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. 打开 Chrome DevTools → Network 标签             │
  │     查看 Waterfall（瀑布流）图                       │
  │     ⚠️ 看有没有特别大的 JS/CSS 文件（> 500KB）       │
  │                                                     │
  │  2. 打开 Lighthouse → Performance 审计               │
  │     关注 FCP / LCP / TBT 指标                       │
  │                                                     │
  │  3. 打开 Coverage 标签                               │
  │     看 JavaScript 的使用率                           │
  │     ⚠️ 如果 < 50%，说明打包了太多用不到的代码        │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) 分析打包体积                                    │
  │     使用 webpack-bundle-analyzer 或                  │
  │     vite-plugin-visualizer 分析                      │
  │                                                     │
  │  b) 代码分割                                        │
  │     路由级别：React.lazy + Suspense                  │
  │     组件级别：按需加载重型组件                        │
  │                                                     │
  │  c) 图片优化                                        │
  │     使用 WebP/AVIF 格式                              │
  │     添加 width/height 防止布局偏移                   │
  │     使用 <img loading="lazy">                        │
  │                                                     │
  │  d) 关键资源预加载                                  │
  │     <link rel="preload" href="critical.css">         │
  │     <link rel="preconnect" href="https://api.com">  │
  │                                                     │
  │  e) 优化前后对比：                                  │
  │     优化前：FCP 3.2s / LCP 5.8s / TBT 1200ms       │
  │     优化后：FCP 1.1s / LCP 2.3s / TBT 150ms        │
  │     📈 改善 65% ~ 87%                               │
  └─────────────────────────────────────────────────────┘
```

#### 问题 2："滚动时卡顿"

```
📊 症状：页面滚动时明显掉帧，感觉不流畅

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. Chrome Performance 录制滚动过程                 │
  │     查看 FPS 面板是否频繁低于 60fps                  │
  │                                                     │
  │  2. 检查 Main Thread 是否有 Long Task               │
  │     特别关注 scroll 事件处理器                       │
  │                                                     │
  │  3. Elements 面板查看 DOM 节点数量                  │
  │     ⚠️ 如果 > 1500 个节点，可能有过度渲染问题       │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) 长列表 → 虚拟滚动                               │
  │                                                     │
  │  ❌ 优化前：渲染 10000 个 DOM 节点                   │
  │     滚动 FPS: 15-25fps                              │
  │                                                     │
  │  ✅ 优化后：使用 react-window                        │
  │     只渲染 20 个 DOM 节点                            │
  │     滚动 FPS: 55-60fps                              │
  │     📈 性能提升 200%+                                │
  │                                                     │
  │  b) scroll 事件防抖/节流                            │
  │                                                     │
  │  ❌ 优化前：                                       │
  │     window.addEventListener('scroll', heavyCalc);   │
  │     // 每帧都执行，卡顿                             │
  │                                                     │
  │  ✅ 优化后：                                       │
  │     const onScroll = throttle(heavyCalc, 100);     │
  │     window.addEventListener('scroll', onScroll);   │
  │                                                     │
  │  c) 使用 CSS contain 属性                            │
  │     .virtual-list { contain: strict; }              │
  │     告诉浏览器该元素的渲染不影响外部                 │
  └─────────────────────────────────────────────────────┘
```

#### 问题 3："输入框打字卡顿"

```
📊 症状：在 <input> 中打字时明显延迟，体验差

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. React Profiler → 录制输入操作                    │
  │     观察每次击键触发了多少组件重渲染                  │
  │                                                     │
  │  2. Chrome Performance → 查看 Event Handler 耗时     │
  │     每个 input 事件的处理不应超过 16ms               │
  │                                                     │
  │  3. 检查 onChange 回调中是否有                       │
  │     昂贵的计算或网络请求                             │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) 受控组件优化                                     │
  │                                                     │
  │  ❌ 优化前：每次击键触发全组件树重渲染               │
  │     function SearchPage() {                         │
  │       const [query, setQuery] = useState('');       │
  │       const results = expensiveFilter(data, query); │
  │       // query 每次变化都触发所有子组件渲染          │
  │     }                                               │
  │     击键延迟: 200-500ms                              │
  │                                                     │
  │  ✅ 优化后：用 useDeferredValue 延迟过滤             │
  │     function SearchPage() {                         │
  │       const [query, setQuery] = useState('');       │
  │       const deferredQuery = useDeferredValue(query);│
  │       const results = useMemo(                     │
  │         () => expensiveFilter(data, deferredQuery), │
  │         [data, deferredQuery]                       │
  │       );                                            │
  │     }                                               │
  │     击键延迟: < 16ms (几乎感觉不到)                 │
  │     📈 响应速度提升 90%+                             │
  │                                                     │
  │  b) onChange 防抖处理                               │
  │                                                     │
  │  ✅ 优化后：对非即时搜索使用防抖                     │
  │     const debouncedSearch = useCallback(            │
  │       debounce(query => searchAPI(query), 300),    │
  │       []                                            │
  │     );                                              │
  └─────────────────────────────────────────────────────┘
```

#### 问题 4："页面切换时白屏太久"

```
📊 症状：点击导航切换页面后，出现长时间白屏

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. Network 面板 → 查看切换时的请求                  │
  │     是否有大 chunk 文件需要下载？                    │
  │                                                     │
  │  2. Performance 面板 → 录制切换过程                  │
  │     白屏期间主线程在做什么？                         │
  │                                                     │
  │  3. React Suspense 的 fallback 是否显示及时？        │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) 代码分割 + Suspense + Skeleton                  │
  │                                                     │
  │  ❌ 优化前：所有页面打包到一个 JS 文件               │
  │     切换时无加载提示，白屏 2-3 秒                    │
  │                                                     │
  │  ✅ 优化后：                                       │
  │     const Settings = lazy(() => import('./Settings'));│
  │                                                     │
  │     <Suspense fallback={<SettingsSkeleton />}>      │
  │       <Settings />                                  │
  │     </Suspense>                                     │
  │     切换时立即显示骨架屏，无白屏感                   │
  │     📈 感知速度提升 80%+                             │
  │                                                     │
  │  b) 预加载策略                                      │
  │                                                     │
  │  // 鼠标悬停在导航链接时预加载                      │
  │  <Link                                              │
  │    to="/settings"                                   │
  │    onMouseEnter={() =>                              │
  │      import('./pages/Settings')                     │
  │    }                                                │
  │  >Settings</Link>                                   │
  └─────────────────────────────────────────────────────┘
```

#### 问题 5："内存持续增长"

```
📊 症状：使用一段时间后页面越来越卡，最终崩溃

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. Chrome DevTools → Memory 标签                    │
  │                                                     │
  │  2. 采取"快照对比法"：                               │
  │     ① 打开页面，取 Heap Snapshot #1                 │
  │     ② 执行一些操作（打开弹窗、切换 Tab 等）          │
  │     ③ 关闭弹窗 / 回到原来的 Tab                     │
  │     ④ 取 Heap Snapshot #2                           │
  │     ⑤ 重复步骤 ②-④ 三次，取 Snapshot #3            │
  │     ⑥ 对比 #1 和 #3，查看 Detached DOM 节点        │
  │                                                     │
  │  3. 或者使用 Allocation Timeline（分配时间线）      │
  │     录制操作过程，查看哪些对象持续增长               │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) useEffect 缺少清理函数                           │
  │                                                     │
  │  ❌ 泄漏：                                         │
  │     useEffect(() => {                               │
  │       window.addEventListener('resize', handler);   │
  │       const timer = setInterval(fn, 1000);          │
  │       // 没有清理！组件卸载后监听器仍在运行          │
  │     }, []);                                         │
  │                                                     │
  │  ✅ 修复：                                         │
  │     useEffect(() => {                               │
  │       window.addEventListener('resize', handler);   │
  │       const timer = setInterval(fn, 1000);          │
  │       return () => {                                │
  │         window.removeEventListener('resize', handler);│
  │         clearInterval(timer);                       │
  │       };                                            │
  │     }, []);                                         │
  │                                                     │
  │  b) 闭包导致的引用未释放                            │
  │                                                     │
  │  ❌ 泄漏：                                         │
  │     const cache = new Map();                         │
  │     // 永远不清理，数据越积越多                      │
  │                                                     │
  │  ✅ 修复：使用 LRU 缓存或 WeakMap                   │
  │     const cache = useRef(new Map());                │
  │     // 设置最大容量并定期清理                        │
  │                                                     │
  │  优化前后对比：                                     │
  │  优化前：操作 50 次后内存从 80MB 增长到 350MB       │
  │  优化后：操作 50 次后内存稳定在 85MB 左右            │
  │  📈 内存泄漏修复，增长降低 93%                       │
  └─────────────────────────────────────────────────────┘
```

#### 问题 6："Tab 切换回来时重新渲染"

```
📊 症状：切换到其他 Tab 再切回来，页面重新渲染闪烁

🔍 诊断方法：
  ┌─────────────────────────────────────────────────────┐
  │  1. 确认是否有 visibilitychange 事件监听              │
  │     document.addEventListener('visibilitychange', fn)│
  │                                                     │
  │  2. 检查定时器是否在 Tab 不可见时仍在触发             │
  │     setInterval 即使 Tab 不可见也可能触发            │
  │                                                     │
  │  3. 检查是否有轮询 API 请求在后台运行                │
  └─────────────────────────────────────────────────────┘

🛠️ 解决方案：
  ┌─────────────────────────────────────────────────────┐
  │  a) Tab 可见时才执行定时更新                         │
  │                                                     │
  │  ❌ 优化前：                                       │
  │     useEffect(() => {                               │
  │       const timer = setInterval(fetchData, 5000);   │
  │       return () => clearInterval(timer);            │
  │     }, []);                                         │
  │     // Tab 不可见时也在请求，浪费资源并可能卡顿      │
  │                                                     │
  │  ✅ 优化后：                                       │
  │     useEffect(() => {                               │
  │       const timer = setInterval(() => {             │
  │         if (document.visibilityState === 'visible') {│
  │           fetchData();                              │
  │         }                                           │
  │       }, 5000);                                     │
  │       return () => clearInterval(timer);            │
  │     }, []);                                         │
  │                                                     │
  │  b) 使用 visibilitychange 暂停/恢复动画              │
  │                                                     │
  │  useEffect(() => {                                   │
  │     const handleVisibility = () => {                 │
  │       if (document.hidden) {                         │
  │         animation.pause();  // Tab 切走时暂停       │
  │       } else {                                       │
  │         animation.play();   // Tab 切回时恢复       │
  │       }                                              │
  │     };                                               │
  │     document.addEventListener(                       │
  │       'visibilitychange', handleVisibility           │
  │     );                                               │
  │     return () => document.removeEventListener(        │
  │       'visibilitychange', handleVisibility           │
  │     );                                               │
  │  }, []);                                             │
  └─────────────────────────────────────────────────────┘
```

---

### 4. 打包体积分析与优化

#### webpack-bundle-analyzer 使用教程

```bash
# 安装
npm install --save-dev webpack-bundle-analyzer

# 或者用 Vite（需要不同方式）
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// webpack.config.js — 配置
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',     // 生成静态 HTML 报告
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,        // 不自动打开浏览器
      generateStatsFile: true,    // 同时生成 stats.json
    }),
  ],
};

// 运行构建后查看报告
// npx webpack --profile --json > stats.json
// 然后打开 bundle-report.html
```

```
📊 报告解读：

  ┌──────────────────────────────────────────────────┐
  │  bundle-report.html 界面：                        │
  │                                                   │
  │  ┌────────────────────────────────────────────┐   │
  │  │ ████████████████████████████████████████   │   │
  │  │ ██ lodash (78KB) ██████████████████████████ │   │
  │  │ ██ moment.js (68KB) █████████████████████  │   │
  │  │ ██ react (42KB) ██████████████████         │   │
  │  │ ██ antd (156KB) ████████████████████████████│   │  ⚠️ 最大！
  │  │ ██ 你的代码 (45KB) ████████████████████    │   │
  │  │ ██ 其他 (23KB) ████████████                │   │
  │  └────────────────────────────────────────────┘   │
  │                                                   │
  │  💡 方块越大 = 体积越大 = 越应该优化              │
  │  💡 可以看到哪些依赖占了大量空间                  │
  └──────────────────────────────────────────────────┘
```

#### vite-plugin-visualizer 使用教程

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './stats.html',     // 输出文件
      open: true,                   // 构建后自动打开
      gzipSize: true,               // 同时显示 gzip 后大小
      brotliSize: true,             // 同时显示 brotli 后大小
    }),
  ],
});

// 运行构建
// npm run build
// 自动生成并打开 stats.html
```

#### 如何识别"该优化的包"

```
📦 优化优先级判断：

  ┌────────────────────────────────────────────────────────┐
  │  包大小（gzip 后）     优先级     建议操作             │
  │  ─────────────────────────────────────────────────     │
  │  > 100KB               🔴 高      必须优化             │
  │  50KB - 100KB          🟡 中      建议优化             │
  │  10KB - 50KB           🟢 低      可选优化             │
  │  < 10KB                ⚪ 忽略    无需优化             │
  └────────────────────────────────────────────────────────┘

  常见"大包"及替代方案：
  ┌────────────────────────────────────────────────────────┐
  │  ❌ moment.js (68KB gzip)                              │
  │  ✅ date-fns (6KB gzip) — 按需引入                     │
  │  ✅ dayjs (2KB gzip) — API 兼容 moment.js              │
  │                                                        │
  │  ❌ lodash (72KB gzip)                                 │
  │  ✅ lodash-es — 支持 Tree Shaking                      │
  │  ✅ 或者直接用原生方法 / 专用小库                      │
  │                                                        │
  │  ❌ antd (156KB gzip，全量引入)                         │
  │  ✅ 按需引入 babel-plugin-import                       │
  │  ✅ 或者使用 @ant-design/cssinjs                       │
  │                                                        │
  │  ❌ @ant-design/icons (100KB+ gzip)                    │
  │  ✅ @ant-design/icons-svg 按需引入                     │
  └────────────────────────────────────────────────────────┘
```

#### Tree Shaking 原理和最佳实践

```
🌳 Tree Shaking 的工作原理：

  构建工具（Webpack / Vite / Rollup）在打包时，
  会分析模块的 ES Module 导入导出关系，
  移除那些"导出了但从未被使用"的代码。

  ┌─────────────────────────────────────────────────────┐
  │  utils.js:                                         │
  │  export function add(a, b) { return a + b; }       │
  │  export function subtract(a, b) { return a - b; }  │
  │  export function multiply(a, b) { return a * b; }  │  ← 未被使用
  │  export function heavyTask() { /* 500 行代码 */ }   │  ← 未被使用
  │                                                     │
  │  main.js:                                           │
  │  import { add } from './utils.js';                  │  ← 只用了 add
  │                                                     │
  │  打包结果：                                         │
  │  ✅ 只保留 add 函数                                 │
  │  ❌ subtract / multiply / heavyTask 全部被移除       │
  └─────────────────────────────────────────────────────┘

  ⚠️ Tree Shaking 的前提条件：
  ┌─────────────────────────────────────────────────────┐
  │  ✅ 必须使用 ES Module (import/export)              │
  │  ❌ CommonJS (require/module.exports) 无法 Tree Shake│
  │                                                     │
  │  ✅ package.json 必须设置 "sideEffects": false      │
  │     或者指定哪些文件有副作用：                        │
  │     "sideEffects": ["*.css", "*.global.js"]         │
  │                                                     │
  │  ✅ 不要在模块顶层执行有副作用的代码                  │
  │     如：修改全局变量、polyfill 注入                  │
  └─────────────────────────────────────────────────────┘
```

#### 动态 import() 的正确用法

```jsx
// ✅ 路由级别代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// ✅ 组件级别按需加载
function ChartPanel({ showChart }) {
  return (
    <Suspense fallback={<div>图表加载中...</div>}>
      {showChart && <LazyChart />}
    </Suspense>
  );
}
const LazyChart = lazy(() => import('./components/HeavyChart'));

// ✅ 基于用户交互的预加载
function Navigation() {
  const preloadDashboard = () => {
    // 鼠标悬停时预加载，但不立即渲染
    import('./pages/Dashboard');
  };

  return (
    <nav>
      <Link to="/dashboard" onMouseEnter={preloadDashboard}>
        Dashboard
      </Link>
    </nav>
  );
}

// ❌ 不要在循环或条件判断中过度使用
// 每个动态 import 都会产生一个 chunk 文件
```

#### externals 和 CDN 策略

```javascript
// vite.config.js — 外部化大型依赖
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react', 'react-dom', 'lodash'],
    },
  },
});

// 或者只在外部化生产依赖
export default defineConfig(({ command }) => ({
  build: command === 'build' ? {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  } : {},
}));
```

```html
<!-- index.html — 从 CDN 加载外部化依赖 -->
<head>
  <!-- 使用 CDN 加载 React，利用浏览器缓存 -->
  <script crossorigin
    src="https://unpkg.com/react@18/umd/react.production.min.js">
  </script>
  <script crossorigin
    src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js">
  </script>
</head>
```

```
📦 优化前后对比：

  不使用 externals：
  ┌─────────────────────────────────────┐
  │  app.js  = 245KB (gzip: 82KB)      │
  │  总计传输: 82KB                     │
  └─────────────────────────────────────┘

  使用 externals (React + ReactDOM 通过 CDN)：
  ┌─────────────────────────────────────┐
  │  app.js  = 135KB (gzip: 45KB)      │
  │  CDN 缓存: React (已被其他网站缓存) │
  │  总计传输: 45KB (省 37KB)           │
  └─────────────────────────────────────┘
  📈 传输体积减少 45%
```

#### gzip / brotli 压缩配置

```javascript
// vite.config.js — 启用 gzip 和 brotli 压缩
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    // gzip 压缩
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,       // 大于 1KB 才压缩
      deleteOriginFile: false,
    }),
    // brotli 压缩（压缩率更高，但兼容性稍差）
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
});
```

```
📊 压缩效果对比：

  文件              原始大小    gzip       brotli    压缩率
  ───────────────────────────────────────────────────────
  app.js           245KB      78KB       68KB      72%
  vendor.js        520KB      160KB      138KB     73%
  main.css         85KB       18KB       15KB      82%
  ───────────────────────────────────────────────────────
  总计             850KB      256KB      221KB     74%

  💡 brotli 比 gzip 多省 14% 带宽
  💡 现代浏览器（Chrome / Firefox / Edge）都支持 brotli
  ⚠️ Nginx 需要配置支持 .br 文件的 Content-Encoding
```

---

### 5. Core Web Vitals 优化实战

#### 指标概览和目标值

```
📊 Core Web Vitals 评分标准：

  ┌───────────────────────────────────────────────────────┐
  │  指标        含义                 好   需改进  差    │
  │  ─────────────────────────────────────────────────── │
  │  LCP         最大内容绘制          ≤2.5s ≤4.0s >4.0s │
  │  INP         交互到下一次绘制      ≤200ms ≤500ms >500ms│
  │  CLS         累积布局偏移          ≤0.1  ≤0.25  >0.25 │
  └───────────────────────────────────────────────────────┘

  💡 LCP (Largest Contentful Paint)
     页面上最大的可见内容元素渲染完成的时间
     通常是大图、大标题或大型文本块

  💡 INP (Interaction to Next Paint)
     用户交互后到页面给出视觉反馈的时间
     取代了旧的 FID（First Input Delay）

  💡 CLS (Cumulative Layout Shift)
     页面生命周期内所有意外布局偏移的总和
     评分范围 0 ~ 1+，越低越好
```

#### LCP 优化：图片优化 / SSR / 预加载

```
🛠️ LCP 优化策略：

  ┌─────────────────────────────────────────────────────┐
  │  策略 1：优化 LCP 元素（通常是图片）                 │
  │                                                     │
  │  ❌ 优化前：                                        │
  │  <img src="hero.jpg">                               │
  │  LCP: 4.2s                                          │
  │                                                     │
  │  ✅ 优化后：                                        │
  │  <img                                               │
  │    src="hero.webp"           // 使用 WebP 格式      │
  │    srcSet="hero-480.webp 480w,                     │
  │           hero-800.webp 800w,                      │
  │           hero-1200.webp 1200w"                    │
  │    sizes="(max-width: 768px) 100vw, 800px"         │
  │    width="800" height="600"   // 防止 CLS          │
  │    fetchPriority="high"       // 高优先级加载       │
  │    decoding="async"                                 │
  │  >                                                  │
  │  LCP: 1.8s  📈 改善 57%                             │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 2：预加载关键资源                              │
  │                                                     │
  │  <link rel="preload" as="image" href="hero.webp">   │
  │  <link rel="preload" as="font" href="font.woff2"    │
  │    crossorigin>                                       │
  │  <link rel="preconnect" href="https://cdn.example.com">│
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 3：服务端渲染 (SSR)                            │
  │                                                     │
  │  ❌ CSR: 浏览器先下载 JS → 执行 JS → 请求 API       │
  │         → 渲染 HTML → LCP = 4.5s                    │
  │                                                     │
  │  ✅ SSR: 服务器直接返回渲染好的 HTML                 │
  │         → 浏览器直接显示内容 → LCP = 1.2s           │
  │         📈 改善 73%                                  │
  └─────────────────────────────────────────────────────┘
```

#### INP 优化：减少主线程阻塞

```
🛠️ INP 优化策略：

  ┌─────────────────────────────────────────────────────┐
  │  策略 1：拆分 Long Tasks                             │
  │                                                     │
  │  ❌ 优化前：点击按钮后执行 300ms 的计算              │
  │     INP: 350ms (差)                                 │
  │                                                     │
  │  ✅ 优化后：使用 scheduler.yield() 拆分              │
  │     async function handleClick() {                   │
  │       // 先执行一部分，让出主线程                    │
  │       part1();                                      │
  │       await scheduler.yield();                      │
  │       part2();                                      │
  │       await scheduler.yield();                      │
  │       part3();                                      │
  │     }                                               │
  │     INP: 80ms (好)  📈 改善 77%                     │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 2：使用 Web Worker 处理重计算                   │
  │                                                     │
  │  // 将 CPU 密集型任务移到 Worker                    │
  │  const worker = new Worker('/workers/heavy-task.js');│
  │                                                     │
  │  button.addEventListener('click', () => {            │
  │    worker.postMessage(data);  // 不阻塞主线程       │
  │  });                                                │
  │                                                     │
  │  worker.onmessage = (e) => {                        │
  │    updateUI(e.data);  // 收到结果后更新 UI           │
  │  };                                                 │
  │  INP: 30ms (好)                                     │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 3：React 18 的 useTransition                   │
  │                                                     │
  │  const [isPending, startTransition] = useTransition();│
  │                                                     │
  │  <input                                              │
  │    onChange={(e) => {                                │
  │      setInputValue(e.target.value);  // 紧急：立即   │
  │      startTransition(() => {          // 非紧急：延迟 │
  │        setSearchQuery(e.target.value);               │
  │      });                                            │
  │    }}                                               │
  │  />                                                 │
  └─────────────────────────────────────────────────────┘
```

#### CLS 优化：图片占位 / 字体加载 / 骨架屏

```
🛠️ CLS 优化策略：

  ┌─────────────────────────────────────────────────────┐
  │  策略 1：为图片和媒体设置明确的尺寸                  │
  │                                                     │
  │  ❌ 优化前（CLS: 0.35 — 差）：                       │
  │  <img src="photo.jpg">                              │
  │  <!-- 浏览器不知道图片尺寸，先用 0x0 占位            │
  │       图片加载后突然撑开，文字被挤下去 -->           │
  │                                                     │
  │  ✅ 优化后（CLS: 0.02 — 好）：                       │
  │  <img                                               │
  │    src="photo.jpg"                                  │
  │    width="800" height="600"     // 预留空间         │
  │    style={{ aspectRatio: '4/3' }} // 或用 CSS       │
  │  >                                                  │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 2：字体加载优化（防止 FOIT/FOUT）              │
  │                                                     │
  │  ❌ 优化前：字体下载完成前文字不可见（FOIT）          │
  │     或 字体下载完成后文字跳动（FOUT）                │
  │     CLS 贡献: 0.15                                  │
  │                                                     │
  │  ✅ 优化后：使用 font-display + 预加载               │
  │                                                     │
  │  /* CSS 中设置 */                                   │
  │  @font-face {                                       │
  │    font-family: 'CustomFont';                       │
  │    src: url('/fonts/custom.woff2') format('woff2'); │
  │    font-display: swap;    /* 先用系统字体，后替换 */ │
  │  }                                                  │
  │                                                     │
  │  /* HTML 中预加载字体 */                             │
  │  <link rel="preload" as="font" type="font/woff2"    │
  │    href="/fonts/custom.woff2" crossorigin>          │
  │                                                     │
  │  /* 用 size-adjust 消除替换时的跳动 */               │
  │  @font-face {                                       │
  │    font-family: 'CustomFont';                       │
  │    size-adjust: 105.2%;  /* 微调匹配系统字体大小 */ │
  │  }                                                  │
  │  CLS 贡献: 0.01  📈 改善 93%                        │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │  策略 3：使用骨架屏（Skeleton）                      │
  │                                                     │
  │  ✅ 用灰色块预先占据真实内容的布局                   │
  │                                                     │
  │  function ProductCardSkeleton() {                   │
  │    return (                                          │
  │      <div className="skeleton-card">                │
  │        {/* 图片占位 */}                              │
  │        <div style={{                                │
  │          width: '100%',                              │
  │          height: 200,                                │
  │          backgroundColor: '#eee',                    │
  │        }} />                                        │
  │        {/* 标题占位 */}                              │
  │        <div style={{                                │
  │          width: '70%',                               │
  │          height: 20,                                 │
  │          backgroundColor: '#eee',                    │
  │          marginTop: 12,                              │
  │        }} />                                        │
  │      </div>                                          │
  │    );                                                │
  │  }                                                   │
  └─────────────────────────────────────────────────────┘
```

#### 如何在 CI 中自动检测 Core Web Vitals

```javascript
// 使用 web-vitals 库在真实用户中收集数据
// npm install web-vitals
import { onLCP, onINP, onCLS } from 'web-vitals';

function reportToAnalytics(metric) {
  // 上报到你的分析服务
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,    // 'good' | 'needs-improvement' | 'poor'
    navigationType: metric.navigationType,
  });

  // 使用 sendBeacon，不会影响页面卸载
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', body);
  } else {
    fetch('/api/vitals', { body, method: 'POST', keepalive: true });
  }
}

onLCP(reportToAnalytics);
onINP(reportToAnalytics);
onCLS(reportToAnalytics);
```

```yaml
# GitHub Actions — CI 中自动检测（使用 Lighthouse CI）
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lighthouse Check
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/dashboard
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

```json
// lighthouse-budget.json — 性能预算配置
[{
  "path": "/*",
  "options": { "preset": "desktop" },
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 200 },   // JS < 200KB
        { "resourceType": "stylesheet", "budget": 50 },  // CSS < 50KB
        { "resourceType": "image", "budget": 300 },      // 图片 < 300KB
        { "resourceType": "total", "budget": 600 }        // 总计 < 600KB
      ],
      "resourceCounts": [
        { "resourceType": "third-party", "budget": 10 }  // 第三方请求 ≤ 10
      ]
    }
  ]
}]
```

```
📈 CI 检测的工作流程：

  开发者提交代码
       ↓
  GitHub Actions 触发 Lighthouse CI
       ↓
  启动预览服务器 → Lighthouse 审计
       ↓
  ┌──────────────────────────────────────────────┐
  │  审计结果检查：                                │
  │                                               │
  │  LCP: 1.8s  ✅ (预算 ≤ 2.5s)                │
  │  INP: 120ms ✅ (预算 ≤ 200ms)               │
  │  CLS: 0.05  ✅ (预算 ≤ 0.1)                 │
  │  JS 体积: 180KB ✅ (预算 ≤ 200KB)            │
  │  总体积: 520KB ✅ (预算 ≤ 600KB)              │
  │                                               │
  │  ✅ 所有指标通过 → PR 可以合并                │
  │  ❌ 有指标超标 → PR 被阻止，显示详情          │
  └──────────────────────────────────────────────┘
```

---

[← 14 - 状态管理进阶](../14-state-management/) | [→ 16 - TypeScript 与 React](../16-typescript-react/)
