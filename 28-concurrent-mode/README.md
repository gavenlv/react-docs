# 28 - Concurrent Features (并发特性)

## 🎯 本节目标
- 深入理解 React 18 的并发渲染机制
- 掌握 Transitions、Suspense 和流式 SSR
- 学会在实际项目中正确使用并发特性
- 理解并发模式对应用架构的影响

---

## 📖 什么是并发（Concurrency）？

### 定义

**并发 ≠ 并行（Concurrency != Parallelism）**

```
并行（Parallelism）：同时做多件事
┌─────────────────────────────────────┐
│ CPU 核心 1: ████████████           │
│ CPU 核心 2: ████████████           │
└─────────────────────────────────────┘

并发（Concurrency）：同时处理多件事（交替执行）
┌─────────────────────────────────────┐
│ Task A: ██░░░░████░░░░████░░       │
│ Task B: ░░░███░░░░░░███░░░░░       │
│ Task C: ░░░░░░██░░░░░░░░███       │
└─────────────────────────────────────┘
         主线程（单线程）
```

### React 并发的核心能力

1. **可中断渲染**: 渲染过程可以被中断和恢复
2. **优先级调度**: 重要更新优先处理
3. **并发组件**: 允许组件声明性地指定更新优先级

---

## 🚀 React 18 并发特性一览

| 特性 | API | 用途 |
|------|-----|------|
| **自动批处理** | Automatic | 合并多次 setState |
| **Transitions** | `startTransition` | 区分紧急和非紧急更新 |
| **Suspense for Data Fetching** | `<Suspense>` | 声明式加载状态 |
| **流式 SSR** | `renderToPipeableStream` | 流式服务端渲染 |
| **useDeferredValue** | Hook | 延迟非紧急的部分更新 |
| **useTransition** | Hook | 带加载状态的 transition |
| **useId** | Hook | 服务端客户端一致的 ID |

---

## 🔄 自动批处理（Automatic Batching）

### React 17 vs React 18

**React 17 及以前：**
```jsx
// 只有 React 事件处理器内的 setState 会批处理
function handleClick() {
  setCount(c => c + 1);  // 批处理
  setFlag(f => !f);      // 批处理
  // 只触发一次 re-render
}

// 异步回调中的 setState 不会批处理
fetchData().then(() => {
  setCount(c => c + 1);  // 立即 re-render
  setFlag(f => !f);      // 再次 re-render
  // 触发两次 re-render！
});

// setTimeout、Promise、native event handler 都不受批处理保护
setTimeout(() => {
  setCount(c => c + 1);  // 立即 re-render
});
```

**React 18（全部自动批处理）：**
```jsx
// 无论在哪里调用 setState，都会自动批处理
function handleClick() {
  fetch('/api/data').then(() => {
    setCount(c => c + 1);  // ✅ 自动批处理
    setFlag(f => !f);      // ✅ 自动批处理
    // 只触发一次 re-render！
  });
}

setTimeout(() => {
  setCount(c => c + 1);  // ✅ 自动批处理
}, 0);

element.addEventListener('click', () => {
  setCount(c => c + 1);  // ✅ 自动批处理
});
```

### 如何退出批处理？（如果确实需要）

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  // 强制同步刷新（立即 re-render）
  flushSync(() => {
    setCounter(c => c + 1);
  });
  // 此时 DOM 已经更新
  
  // 第二次更新会单独触发 re-render
  flushSync(() => {
    setFlag(f => !f);
  });
  // DOM 再次更新
}
```

⚠️ **注意**: `flushSync` 可能会导致性能问题和布局抖动（layout thrashing），谨慎使用。

---

## 🌊 Transitions（过渡更新）

### 核心概念

区分两种更新类型：

| 类型 | 示例 | 特性 |
|------|------|------|
| **紧急更新（Urgent）** | 输入文字、点击按钮 | 需要立即响应用户交互 |
| **过渡更新（Transition）** | 搜索结果过滤、页面导航 | 可以稍后延迟处理 |

### startTransition API

```jsx
import { startTransition } from 'react';

function SearchComponent() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // 紧急更新：立即响应输入（保持输入框响应）
    setInputValue(value);
    
    // 过渡更新：搜索过滤（可以延迟）
    startTransition(() => {
      setSearchQuery(value);  // 这个更新会被标记为低优先级
    });
  };

  // 监听 searchQuery 变化来获取数据
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // 由于是 transition，React 可能会在获取数据前取消这次渲染
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      try {
        const results = await searchAPI(searchQuery);
        if (!cancelled) {
          setSearchResults(results);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;  // cleanup
    };
  }, [searchQuery]);

  return (
    <div className="search">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="搜索..."
      />
      
      {isLoading && <Spinner />}
      
      <SearchResults results={searchResults} />
    </div>
  );
}
```

### useTransition Hook

提供更细粒度的控制和 loading 状态：

```jsx
import { useTransition } from 'react';

function TabSwitcher() {
  const [tab, setTab] = useState('home');
  const [content, setContent] = useState(null);
  
  // isPending: 是否有待完成的 transition
  // startTransition: 用于包装低优先级更新的函数
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);  // 低优先级更新
      
      // 加载新 tab 内容
      loadContentForTab(nextTab).then(data => {
        setContent(data);
      });
    });
  }

  return (
    <div>
      <nav>
        {['home', 'posts', 'about'].map(t => (
          <button 
            key={t}
            onClick={() => selectTab(t)}
            style={{
              opacity: t === tab || isPending ? 1 : 0.6
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>
      
      <main className={`tab-content ${isPending ? 'loading' : ''}`}>
        {tab === 'home' && <Home />}
        {tab === 'posts' && <Posts />}
        {tab === 'about' && <About />}
      </main>
    </div>
  );
}
```

### useDeferredValue

延迟值的更新，类似于防抖但由 React 控制：

```jsx
import { useDeferredValue, useState } from 'react';

function SearchWithDeferredValue() {
  const [query, setQuery] = useState('');
  
  // deferredQuery 是 query 的“延迟版本”
  // 在紧急更新期间，deferredQuery 保持旧值
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      {/* 输入框始终即时响应 */}
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        placeholder="Type to search..."
      />
      
      {/* 列表使用 deferred 值，可能暂时显示旧结果 */}
      <SearchResults query={deferredQuery} />
    </div>
  );
}

// SearchResults 组件
function SearchResults({ query }) {
  // 大量数据的复杂渲染...
  const results = useMemo(() => {
    return filterHugeDataset(query);
  }, [query]);
  
  return <ResultList items={results} />;
}
```

---

## ⏳ Suspense（悬念/挂起）

### 概念

Suspense 允许组件在等待异步操作（通常是数据获取）“挂起”时显示 fallback UI。

### 基本用法

```jsx
import { Suspense } from 'react';
import { Profile } from './Profile';  // 假设内部使用了数据请求

function UserProfilePage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <Profile userId="123" />
    </Suspense>
  );
}
```

### 嵌套 Suspense

```jsx
function Dashboard() {
  return (
    <Suspense fallback={<GlobalSpinner />}>
      <Sidebar />
      
      <MainContent>
        <Suspense fallback={<CardSkeleton count={3} />}>
          <StatsCards />
        </Suspense>
        
        <Suspense fallback={<TableSkeleton />}>
          <DataTable />
        </Suspense>
        
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart />
        </Suspense>
      </MainContent>
    </Suspense>
  );
}
```

**瀑布效应（Waterfall）问题的缓解：**

```jsx
// ❌ 传统方式：串行加载
function SequentialLoading() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    getUser().then(u => {  // 第1个请求
      setUser(u);
      getPosts(u.id).then(p => {  // 等第1个完成后才开始第2个
        setPosts(p);
      });
    });
  }, []);
  
  // ...
}

// ✅ Suspense + 并行预加载
// Profile 和 PostsList 可以并行请求数据
function ParallelLoading() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Profile />  {/* 内部触发 getUser() */}
      <PostsList />  {/* 内部独立触发 getPosts() */}
    </Suspense>
  );
}
```

### ErrorBoundary + Suspense

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorMessage error={this.state.error} />;
    }
    return this.props.children;
  }
}

function RobustComponent() {
  return (
    <ErrorBoundary fallback={<ErrorDisplay onRetry={() => window.location.reload()} />}>
      <Suspense fallback={<LoadingIndicator />}>
        <UnstableComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 🌊 流式 SSR（Streaming Server-Side Rendering）

### React 18 的流式渲染

允许服务端**渐进式**发送 HTML，而不是一次性生成完整的页面：

```
传统 SSR（全量渲染后发送）:
[等待...等待...等待...] → 发送完整HTML → 页面显示

流式SSR（边渲染边发送）:
[骨架屏] → [头部] → [主要内容] → [评论区] → [完成]
  ↓         ↓          ↓           ↓         ↓
 显示     显示      显示        显示     显示
```

### 实现方式

```jsx
// server.js (Node.js)
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

function handleRequest(req, res) {
  const stream = renderToPipeableStream(<App />, {
    bootstrapScripts: ['/main.js'],
    
    onShellReady() {
      // Shell（骨架）准备就绪，开始传输
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      stream.pipe(res);  // 开始流式输出
    },
    
    onShellError(error) {
      // Shell 渲染出错
      res.statusCode = 500;
      res.send('<h1>Something went wrong</h1>');
    },
    
    onAllReady() {
      // 全部渲染完成（可选，用于统计/Crawlers）
      // stream 已经结束
    },
    
    onError(err) {
      console.error(err);
    }
  });
}
```

### 结合 Suspense 的流式渲染

```jsx
// App.jsx
function App() {
  return (
    <html>
      <body>
        <Suspense fallback={<NavSkeleton />}>
          <Navigation />
        </Suspense>
        
        <main>
          <Suspense fallback={<ArticleSkeleton />}>
            <Article />
          </Suspense>
          
          <Suspense fallback={<CommentsSkeleton />}>
            <Comments />  {/* 评论可能较晚加载 */}
          </Suspense>
          
          <Suspense fallback={<RecommendationsSkeleton />}>
            <Recommendations />  {/* 推荐内容最后加载 */}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
```

**输出的 HTML 顺序：**
```html
<!DOCTYPE html>
<html>
<body>
  <!-- Navigation 先到达 -->
  <nav>...</nav>
  
  <!-- 文章主体接着到达 -->
  <article>...</article>
  
  <!-- 评论稍后到达 -->
  <section class="comments">...</section>
  
  <!-- 推荐内容最后到达 -->
  <aside class="recommendations">...</aside>
  
  <!-- React hydration scripts -->
  <script src="/main.js"></script>
</body>
</html>
```

---

## 🎯 实际应用场景与最佳实践

### 场景一：大型列表搜索过滤

```jsx
function ProductCatalog() {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);
  const [products] = useProducts(deferredFilter);
  
  return (
    <>
      <SearchBar 
        value={filter} 
        onChange={setFilter}  // 即时更新
      />
      
      <ProductGrid 
        products={products} 
        isStale={filter !== deferredFilter}  // 显示是否过期
      />
    </>
  );
}
```

### 场景二：路由切换

```jsx
function AppRoutes() {
  return (
    <Suspense fallback={<PageTransition />}>
      <Routes>
        <Route path="/dashboard" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardPage />
          </Suspense>
        } />
        <Route path="/settings" element={
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsPage />
          </Suspense>
        } />
      </Routes>
    </Suspense>
  );
}
```

### 场景三：分页和数据加载

```jsx
function InfiniteScroll() {
  return (
    <div>
      <Suspense fallback={<InitialLoader />}>
        <PostList page={currentPage} />
        
        <Suspense fallback={<LoadMoreSpinner />}>
          <LoadMoreTrigger onLoadNext={loadNextPage} />
        </Suspense>
      </Suspense>
    </div>
  );
}
```

---

## ⚠️ 注意事项与常见陷阱

### 1. Transition 不是魔法

```jsx
// ❌ 错误认知：transition 会让慢操作变快
startTransition(() => {
  // 这里的代码仍然一样慢！
  // 只是它的优先级降低了
});

// ✅ 正确理解：transition 让紧急操作不被阻塞
startTransition(() => {
  // 非紧急更新可以稍后处理
  // 给用户交互留出响应空间
});
```

### 2. Suspense 需要 Data Fetching 库支持

原生 Suspense 目前主要用于：
- React.lazy（代码分割）
- 配合 Relay、SWR、React Query 等库的数据获取

```jsx
// 使用 SWR + Suspense
import useSWR from 'swr';

function Profile({ userId }) {
  const { data: user } = useSWR(`/api/user/${userId}`, fetcher, {
    suspense: true  // 启用 Suspense 模式
  });

  return <UserCard user={user} />;
}
```

### 3. 不要滥用 flushSync

```jsx
// ❌ 避免：频繁使用 flushSync 导致性能问题
function BadExample() {
  const handleClick = () => {
    flushSync(() => setValue1(1));  // re-render
    flushSync(() => setValue2(2));  // re-render
    flushSync(() => setValue3(3));  // re-render
    // 3 次 re-render!
  };
}
```

### 4. useId 的用途

用于服务端和客户端生成一致的唯一 ID：

```jsx
function CheckboxGroup({ label, children }) {
  const id = useId();
  
  return (
    <fieldset>
      <legend>{label}</legend>
      {Children.map(children, (child, index) => (
        <label key={`${id}-${index}`}>
          <input id={`${id}-${index}`} name={id} type="checkbox" />
          {child}
        </label>
      ))}
    </fieldset>
  );
}
```

---

## 📈 性能对比与测量

### 使用 React DevTools Profiler

开启 **"Record why each component rendered while profiling"** 可以看到：

1. 哪些渲染是由 **Urgent** 更新触发的
2. 哪些渲染是由 **Transition** 更新触发的
3. 是否发生了 **Reverted**（因更高优先级更新而撤销）

### 自定义性能监控

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id, phase, actualDuration, baseDuration, 
  startTime, commitTime, interactions
) {
  console.table({
    component: id,
    phase,  // mount or update
    duration: `${actualDuration.toFixed(2)}ms`,
    base: `${baseDuration.toFixed(2)}ms`,
  });
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComplexComponent />
</Profiler>
```

---

## 🔮 未来方向

React 团队持续改进并发特性：

1. **Server Components (RSC)**: 客户端/服务端混合渲染
2. **Offscreen**: 组件的预渲染和缓存（类似 keep-alive）
3. **Selectable Hydration**: 选择性激活部分组件
4. **React Cache**: 原生的数据缓存 API

---

## ✅ 阶段检查清单

- [ ] 理解并发和并行的区别
- [ ] 掌握 React 18 自动批处理的改进
- [ ] 能熟练使用 startTransition 和 useTransition
- [ ] 理解 Suspense 的各种使用场景
- [ ] 了解流式 SSR 的原理和实现
- [ ] 能在实际项目中正确应用并发特性

---

## 📝 练习任务

1. **优化搜索体验**: 为现有的搜索功能添加 transition 改善响应性
2. **实现流式页面**: 使用 Suspense + Skeleton 实现渐进式内容加载
3. **迁移项目**: 将现有 React 17 项目升级到 React 18 并利用并发特性

---

## 🔬 并发模式的底层实现原理

### 1. Suspense 的完整工作原理

#### Suspense 如何"暂停"渲染？（throw Promise 机制）

💡 **大白话——一个神奇的 try-catch：**

想象你在读一本书，读到某一章时发现少了一页（数据还没加载完）。你不会把整本书扔掉，而是：
1. 在缺少的那一页放一个书签（记住当前进度）
2. 先去看其他章节
3. 等缺的那一页送到了，从书签处继续读

Suspense 就是这个"书签机制"——它利用 JavaScript 异常处理机制来"暂停"渲染。

```javascript
// ========== Suspense 的核心机制：throw Promise ==========

// 1. 子组件"抛出"一个 Promise
function UserProfile({ userId }) {
  // 这个 hook 内部会"throw"一个 Promise
  const user = use(fetchUser(userId));
  //                          ↑
  // 如果数据还没准备好，这里会 throw 一个 Promise（不是 Error！）

  return <h1>{user.name}</h1>;
}

// 2. use hook 的简化实现（模拟 React 内部逻辑）
function use(promise) {
  if (promise.status === 'fulfilled') {
    return promise.value;  // 数据已就绪，直接返回
  }

  if (promise.status === 'pending') {
    // 🔑 关键！抛出 Promise，而不是 return
    throw promise;  // ← 这是一个 Promise，不是 Error
    // React 会捕获这个 Promise 并暂停渲染
  }

  // 第一次遇到这个 promise，挂载 then 回调
  promise.status = 'pending';
  promise.then(
    result => {
      promise.status = 'fulfilled';
      promise.value = result;
      // 唤醒 React 重新渲染
      scheduleUpdate();
    },
    error => {
      promise.status = 'rejected';
      promise.value = error;
      scheduleUpdate();
    }
  );
  throw promise;  // 抛出，触发 Suspense
}

// 3. Suspense 组件"捕获"这个 Promise
// React 内部的渲染逻辑（高度简化）
function renderWithSuspense(element, fallback) {
  try {
    return render(element);  // 正常渲染
  } catch (thrownValue) {
    if (isPromise(thrownValue)) {
      // 🔑 这是一个 Promise！说明组件需要等待异步数据
      // 记住这个 Promise，等它完成后重新渲染
      const thenable = thrownValue;
      thenable.then(() => {
        retry();  // 重新渲染
      });

      // 立即返回 fallback UI
      return fallback;
    }
    // 如果是真正的 Error，继续抛出
    throw thrownValue;
  }
}
```

#### Suspense 的嵌套和嵌套 fallback

```
嵌套 Suspense 的工作方式：

<Suspense fallback={<PageSpinner />}>          ← 外层 fallback
  <Header />                                   ← 已就绪，直接渲染
  <Suspense fallback={<ContentSkeleton />}>    ← 内层 fallback
    <Article />                                ← 需要等待数据
    <Comments />                               ← 需要等待数据
  </Suspense>
  <Footer />                                   ← 已就绪，直接渲染
</Suspense>

渲染流程：

阶段1（首次渲染）：
┌─────────────────────────────────────────┐
│  <PageSpinner />                         │  ← 外层 fallback
│  （Article 和 Comments 都 throw Promise） │
│  最近的 Suspense 捕获 → 显示外层 fallback  │
└─────────────────────────────────────────┘

⚠️ 等等！React 实际上会找"最近的" Suspense，
但内层 Suspense 会优先捕获自己子树的 Promise。

修正后的流程：

阶段1（Article 先加载完成）：
┌─────────────────────────────────────────┐
│  <Header />                              │
│  <Article />                             │  ← Article 就绪！
│  <ContentSkeleton />                     │  ← 内层 fallback（Comments 还没好）
│  <Footer />                              │
└─────────────────────────────────────────┘

阶段2（Comments 也加载完成）：
┌─────────────────────────────────────────┐
│  <Header />                              │
│  <Article />                             │
│  <Comments />                            │  ← 全部就绪！
│  <Footer />                              │
└─────────────────────────────────────────┘
```

#### 用代码模拟 Suspense 的核心实现

```javascript
// 🎮 简化版 Suspense 实现（帮助你理解原理）
// ⚠️ 这不是 React 源码，是教学用的简化版

// 1. 全局的"正在等待的 Promise"列表
const suspendedPromises = new Set();

// 2. Suspense 组件
function Suspense({ fallback, children }) {
  try {
    return children;  // 尝试渲染子组件
  } catch (thrownValue) {
    if (isPromise(thrownValue)) {
      // 子组件 throw 了一个 Promise
      // 注册回调：Promise 完成后重新渲染
      if (!suspendedPromises.has(thrownValue)) {
        suspendedPromises.add(thrownValue);
        thrownValue.then(() => {
          suspendedPromises.delete(thrownValue);
          forceUpdate();  // 触发重新渲染
        });
      }
      // 返回 fallback
      return fallback;
    }
    // 真正的错误，继续抛出
    throw thrownValue;
  }
}

// 3. 带数据获取的资源
function createResource(fetchFn) {
  let result;
  let error;
  let promise;

  return {
    read() {
      if (error) throw error;
      if (result !== undefined) return result;

      if (!promise) {
        promise = fetchFn().then(
          data => { result = data; },
          err => { error = err; }
        );
      }

      throw promise;  // ← 核心！抛出 Promise 让 Suspense 捕获
    }
  };
}

// 4. 使用
const userResource = createResource(() => fetch('/api/user').then(r => r.json()));

function UserProfile() {
  const user = userResource.read();  // 如果数据没好，会 throw Promise
  return <h1>{user.name}</h1>;
}

// 最终使用
<Suspense fallback={<Spinner />}>
  <UserProfile />
</Suspense>
```

#### Suspense for Data Fetching vs Suspense for Code Splitting

| 对比 | Suspense for Data Fetching | Suspense for Code Splitting |
|------|--------------------------|---------------------------|
| **触发方式** | 组件内 `throw Promise`（数据请求） | `React.lazy()` 自动 throw |
| **Promise 来源** | 你自己创建的数据请求 | `import()` 动态导入 |
| **使用 API** | `use(fetchPromise)` 或自定义 Hook | `React.lazy(() => import(...))` |
| **状态** | 目前仍属于实验性功能 | 已稳定 |
| **fallback 时机** | 数据请求 pending 时 | 模块加载中 |
| **示例** | `<Suspense><Profile /></Suspense>` | `<Suspense><LazyChart /></Suspense>` |

```javascript
// Suspense for Code Splitting（已稳定）
const LazyChart = React.lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyChart />  {/* import() 返回 Promise，React.lazy 自动 throw */}
    </Suspense>
  );
}

// Suspense for Data Fetching（实验性）
function Profile() {
  // use() hook 内部 throw Promise
  const user = use(fetchUser(userId));
  return <div>{user.name}</div>;
}
```

---

### 2. useTransition 和 startTransition 的原理

#### transition 的优先级标记机制

💡 **大白话——给更新贴标签：**

想象你在快递站工作，每件包裹上都有标签：
- 🚨 **紧急件**（红色标签）：VIP 客户的包裹，必须马上处理
- 📦 **普通件**（蓝色标签）：普通包裹，有空就处理

`startTransition` 就是让你能**自己决定**哪个更新贴红色标签、哪个贴蓝色标签。

```javascript
// startTransition 的核心实现（简化版）
let currentPriority = DefaultLane;  // 默认优先级

function startTransition(callback) {
  // 1. 降低优先级
  const previousPriority = currentPriority;
  currentPriority = TransitionLane;  // ← 切换到低优先级

  try {
    // 2. 执行回调，里面的 setState 都会被标记为 TransitionLane
    callback();
  } finally {
    // 3. 恢复优先级
    currentPriority = previousPriority;
  }
}

// 调用 setState 时
function setState(newValue) {
  const lane = currentPriority;  // ← 获取当前优先级标签
  const update = {
    payload: newValue,
    lane: lane,  // ← 把优先级标签贴到更新上
  };
  enqueueUpdate(fiber, update);  // 入队
}
```

```
优先级标记的过程：

setInputValue(e.target.value)
  │
  └─ currentPriority = SyncLane（默认/事件处理器中）
     │
     └─ Update { payload: 'hello', lane: SyncLane }  ← 紧急更新 🔴

startTransition(() => {
  setSearchQuery('hello')
    │
    └─ currentPriority = TransitionLane（在 transition 内）
       │
       └─ Update { payload: 'hello', lane: TransitionLane }  ← 过渡更新 🔵
})
```

#### 过渡期间如果又有新的紧急更新怎么办？

```
场景：用户在搜索框快速输入 "abc"

时间 ──────────────────────────────────────────────────────────────────▶

用户输入 "a"：
  ├─ setInputValue("a")  → 🔴 SyncLane（紧急，立即执行）
  └─ setSearchQuery("a") → 🔵 TransitionLane（低优先级，排到后面）

用户输入 "ab"（在 "a" 的 transition 还没完成时）：
  ├─ setInputValue("ab") → 🔴 SyncLane（紧急，立即执行）
  └─ setSearchQuery("ab") → 🔵 TransitionLane（新 transition）

处理顺序：
  1. ✅ inputValue = "a"（紧急，立即显示）
  2. ✅ inputValue = "ab"（紧急，立即显示）
  3. ⏳ searchQuery 的 transition 被打断
  4. 🔄 从头开始新的 transition：searchQuery = "ab"

💡 关键理解：
- 输入框始终即时响应（紧急更新不被打断）
- 搜索结果可能跳过中间状态（"a" 的搜索被跳过，直接搜 "ab"）
- 这就是为什么 startTransition 能保持输入流畅！
```

```javascript
// React 内部的过渡打断逻辑（简化版）
function processTransition(transition) {
  // 检查是否有更高优先级的更新
  if (hasHigherPriorityWork()) {
    // 有更高优先级的更新，让出
    // transition 的进度保存在 Fiber 树中
    // 高优先级任务完成后，检查 transition 是否还有效

    // 如果 transition 被新的 transition 替代了
    if (transition.isStale) {
      // 丢弃旧的 transition，用新的从头开始
      discardWorkInProgress(transition);
      return;
    }
  }

  // 没有更高优先级的更新，继续执行
  continueTransition(transition);
}
```

#### useTransition vs setTimeout 的本质区别

| 对比维度 | `setTimeout(fn, 0)` | `useTransition` |
|---------|---------------------|-----------------|
| **执行时机** | 放到宏任务队列末尾 | 在当前渲染周期的空闲时间执行 |
| **是否参与渲染** | ❌ 完全脱离 React 渲染周期 | ✅ 是 React 渲染的一部分 |
| **是否可中断** | ❌ 一旦放入队列，无法取消 | ✅ 高优先级任务可以打断 |
| **是否可见中间状态** | ✅ 可能看到"不一致"的中间状态 | ✅ React 保证一致性 |
| **isPending 状态** | ❌ 没有内置状态指示 | ✅ 提供 isPending |
| **批处理** | ❌ 不参与 React 批处理 | ✅ 参与 React 批处理 |

```javascript
// setTimeout 的问题
function SearchBad() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);  // 渲染1：显示 "a"

    // ⚠️ 问题：setTimeout 会导致不一致的状态
    setTimeout(() => {
      setResults(filterData(value));  // 渲染2：keyword 可能已经变了！
      // 如果用户在这期间又输入了 "b"，这里用的还是 "a"
      // keyword="ab" 但 results 是 "a" 的结果 → 不一致！
    }, 0);
  };
}

// useTransition 的优势
function SearchGood() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);  // 紧急更新：立即显示

    startTransition(() => {
      // transition 内的所有 setState 都用同一个快照
      setResults(filterData(value));
      // ✅ 如果用户快速输入 "ab"，旧的 transition 被丢弃
      // 新的 transition 从头开始，使用最新的 keyword
      // 结果始终与 keyword 一致！
    });
  };
}
```

#### 并发渲染中的"可中断"是如何实现的？

```javascript
// 可中断渲染的核心：workLoopConcurrent
function workLoopConcurrent() {
  // 只要还有工作，且还没到截止时间
  while (workInProgress !== null && !shouldYieldToHost()) {
    // 处理一个 Fiber 单元
    workInProgress = performUnitOfWork(workInProgress);
  }

  // shouldYield() 返回 true → 中断
  // workInProgress 指向下一个待处理的 Fiber
  // 整个 workInProgress 树的状态完整保存在内存中

  // 下次调度恢复时，从 workInProgress 继续执行
  // 不需要从头开始！（因为状态已经保存在 Fiber 节点中）
}

// 💡 类比——拼图游戏：
// 你在拼一个 1000 块的拼图：
// - 同步模式 = 你一口气拼完 1000 块，中间不吃饭不喝水
// - 并发模式 = 你每拼 50 块就休息一下，去倒杯水
//   每次休息时，已拼好的部分保留在桌面上
//   回来后从上次停下的地方继续
//   如果有人叫你帮忙（高优先级任务），你可以先去帮忙，回来再继续拼图
```

---

### 3. useDeferredValue 的原理

#### useDeferredValue vs useTransition 的区别和使用场景

```
两者实现相似的目的，但思路不同：

useTransition：控制"触发更新的动作"
  "我要延迟执行这个 setState"

useDeferredValue：控制"使用的值"
  "我要延迟使用这个值"

┌──────────────────────────────────────────────────────────────┐
│                    useTransition                             │
│                                                              │
│  const [isPending, startTransition] = useTransition();       │
│                                                              │
│  startTransition(() => {                                      │
│    setSearchQuery(value);  // ← 控制哪个更新是低优先级        │
│  });                                                         │
│                                                              │
│  适用场景：你控制状态更新（自己调用 setState）                  │
├──────────────────────────────────────────────────────────────┤
│                    useDeferredValue                          │
│                                                              │
│  const deferredQuery = useDeferredValue(query);              │
│  // deferredQuery 是 query 的"延迟版本"                       │
│                                                              │
│  适用场景：你接收一个 prop，想延迟使用它                       │
│  （比如：你写了一个组件，别人传入的 prop 变化太频繁）            │
└──────────────────────────────────────────────────────────────┘
```

| 对比 | useTransition | useDeferredValue |
|------|--------------|-----------------|
| **控制方** | 你控制更新源 | 你控制值的消费 |
| **isPending** | ✅ 有（可显示 loading） | ❌ 没有直接的 isPending |
| **使用场景** | 自己触发状态更新 | 消费来自外部的高频值 |
| **API** | `const [isPending, start] = useTransition()` | `const deferred = useDeferredValue(value)` |
| **代码量** | 稍多（需要包一层 startTransition） | 简单（一行代码） |

#### 内部的延迟更新实现

```javascript
// useDeferredValue 的简化实现
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);

  // useEffect 在 commit 阶段后异步执行
  // 这意味着它不会阻塞当前的渲染
  useEffect(() => {
    // 使用 startTransition 来延迟更新
    const id = startTransition(() => {
      setDeferredValue(value);  // 低优先级更新
    });

    return () => cancelTransition(id);
  }, [value]);

  return deferredValue;
}

// 实际上 React 内部更高效：
// 它不会创建额外的 state，而是利用 Lane 优先级系统
// 直接在渲染时检查当前优先级来决定是否使用新值
function useDeferredValueInternal(value) {
  const hook = updateWorkInProgressHook();
  const prevValue = hook.memoizedState;

  if (currentTransition !== null) {
    // 如果当前在 transition 中，使用新值
    hook.memoizedState = value;
  } else if (Object.is(prevValue, value)) {
    // 值没变，不更新
    return prevValue;
  } else {
    // 值变了但不在 transition 中
    // 重新调度一个 transition 来更新
    scheduleTransition(() => {
      hook.memoizedState = value;
    });
    return prevValue;  // 暂时返回旧值！
  }

  return value;
}
```

#### 与防抖（debounce）的区别

```
时间线对比：

用户快速输入 "abcdef"：

=== debounce（固定延迟 300ms） ===
输入: a b c d e f
      │ │ │ │ │ │
时间: 0 1 2 3 4 5 (秒)
            ↑
         等待 300ms
            │
            └── 触发搜索 "f"
结果: 每次输入后固定等待 300ms，不管 React 在忙什么

=== useDeferredValue ===
输入: a b c d e f
      │ │ │ │ │ │
时间: 0 1 2 3 4 5 (秒)
      ↑ ↑ ↑ ↑ ↑ ↑
      │ │ │ │ │ └── transition "f"（最终执行）
      │ │ │ │ └──── transition "e"（被 "f" 打断并丢弃）
      │ │ │ └────── transition "d"（被丢弃）
      │ │ └──────── transition "c"（被丢弃）
      │ └────────── transition "b"（被丢弃）
      └──────────── transition "a"（被丢弃）
      █           █
  紧急更新：      低优先级 transition：空闲时执行
  输入框即时响应   但只在有空间时才执行
```

| 对比 | debounce | useDeferredValue |
|------|----------|-----------------|
| **延迟策略** | 固定时间延迟（如 300ms） | 动态延迟（看 React 有没有空闲） |
| **丢弃策略** | 每次重置计时器 | 新 transition 自动替代旧的 |
| **是否延迟首次** | ✅ 首次也延迟 | ❌ 首次不延迟（如果没有更高优先级任务） |
| **与 React 集成** | ❌ 独立于 React 渲染 | ✅ 深度集成 React 调度 |
| **可能出现的问题** | 固定延迟太长/太短 | 无需手动调参 |

> 💡 **选择建议**：如果你只需要简单的"延迟处理"，debounce 就够了。但如果你想让界面在繁忙时自动调整响应速度（没有空闲时间就多等等，有空闲就马上更新），useDeferredValue 是更好的选择。

---

### 4. Server Components 的原理

#### RSC 是什么？与 SSR 的区别

💡 **大白话——外卖 vs 餐厅堂食：**

- **SSR（服务端渲染）** = 你在家点了外卖。厨房（服务器）把菜做好打包（生成 HTML），送到你家（浏览器）。但打开包装后，你的浏览器还需要重新加热（Hydration：绑定事件、初始化状态）。
- **RSC（服务端组件）** = 厨房直接在你家厨房做好了菜。不需要打包、不需要送、不需要重新加热。菜做好了就直接吃（零客户端 JS 开销）。

```
SSR vs RSC 流程对比：

=== 传统 SSR ===
┌──────────┐    HTML     ┌──────────┐   下载 JS   ┌──────────┐  Hydration  ┌──────────┐
│  服务器   │───────────▶│  浏览器   │───────────▶│  浏览器   │──────────▶│  浏览器   │
│          │           │  显示HTML  │            │  下载JS   │            │  可交互   │
│ 渲染组件  │           │  (静态的)  │            │  代码     │            │           │
│ 生成HTML  │           │           │            │           │            │  绑定事件  │
└──────────┘           └──────────┘            └──────────┘            └──────────┘
                                                                 ↑
                                                            需要下载完整 JS

=== Server Components (RSC) ===
┌──────────┐    HTML+RSC Payload    ┌──────────┐   仅下载   ┌──────────┐
│  服务器   │───────────────────────▶│  浏览器   │──────────▶│  浏览器   │
│          │                        │  显示HTML  │            │  可交互   │
│ Server   │                        │  (几乎)   │            │           │
│ Component│                        │  即刻可用  │            │ 仅需 Client│
│ 生成HTML  │                        │           │            │ Component │
└──────────┘                        └──────────┘            └──────────┘
                                                              ↑
                                                       大部分JS不需要下载！
```

#### Server Components 如何实现"零客户端 JS"？

```javascript
// ========== Server Component ==========
// 这个组件只在服务器上运行，不会发送到客户端！

// server-component.js
// "use server" 放在文件顶部（或者由框架自动标记）
async function BlogPost({ id }) {
  // ✅ 可以直接访问数据库
  const post = await db.posts.findOne({ id });

  // ✅ 可以直接读文件系统
  const content = await fs.readFile(post.filePath, 'utf-8');

  // ✅ 可以使用 Node.js 的任何 API
  const relatedPosts = await db.posts.find({ tags: post.tags });

  // ❌ 不能使用 useState、useEffect、onClick 等
  // ❌ 不能使用浏览器 API（window, document 等）

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <RelatedPosts posts={relatedPosts} />
      <LikeButton postId={id} />  {/* 这是一个 Client Component */}
    </article>
  );
}
// 这个组件的 JS 代码永远不会被发送到浏览器！
// 浏览器只收到它渲染出的 HTML。

// ========== Client Component ==========
// 这个组件会在浏览器中运行

// client-component.js
"use client";  // ← 声明这是一个客户端组件

import { useState } from 'react';

function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);

  // ✅ 可以使用所有 React Hooks
  // ✅ 可以绑定事件处理
  // ✅ 可以使用浏览器 API

  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'} 点赞
    </button>
  );
}
```

#### "Use Server" 和 "Use Client" 指令的含义

```
组件边界的划分：

┌─────────────────────────────────────────────────┐
│              Server Component                    │
│              (服务器上执行)                       │
│                                                  │
│  可以做的事：                                     │
│  ✅ 访问数据库                                   │
│  ✅ 读写文件系统                                 │
│  ✅ 使用密钥/环境变量（不暴露给客户端）            │
│  ✅ 嵌套其他 Server Component                    │
│  ✅ 渲染 Client Component（作为子组件）            │
│                                                  │
│  不能做的事：                                     │
│  ❌ useState / useEffect / useReducer             │
│  ❌ onClick / onChange 等事件处理                 │
│  ❌ 浏览器 API (window, document)                │
│  ❌ 自定义 Hook（如果内部用了客户端 API）          │
├─────────────────────────────────────────────────┤
│              Client Component                    │
│              (浏览器中执行)                        │
│                                                  │
│  可以做的事：                                     │
│  ✅ 所有 React Hooks                             │
│  ✅ 事件处理 (onClick 等)                        │
│  ✅ 浏览器 API                                  │
│  ✅ 状态管理                                     │
│                                                  │
│  不能做的事：                                     │
│  ❌ 直接访问数据库                               │
│  ❌ 直接读文件系统                                │
│  ❌ 使用服务端密钥                                │
└─────────────────────────────────────────────────┘

搭配使用：
┌─────────────────────────────────────┐
│  Server Component: Page             │
│  ┌────────────────────────────────┐ │
│  │  Server Component: BlogList    │ │
│  │  ┌──────────────────────────┐  │ │
│  │  │  Server Component: Post  │  │ │
│  │  │  ┌────────────────────┐  │  │ │
│  │  │  │Client: LikeButton  │  │  │ │
│  │  │  └────────────────────┘  │  │ │
│  │  └──────────────────────────┘  │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Server Components 的序列化机制

```
RSC Payload 的序列化过程：

服务器渲染 Server Component 后，生成一个特殊的"RSC Payload"：

1. Server Component 渲染为类似 JSX 的树形结构
2. Client Component 的引用保留（不执行，只标记位置）
3. 整个结构被序列化为 JSON-like 格式发送给浏览器

RSC Payload 示例（简化版）：
{
  "type": "div",
  "children": [
    {
      "type": "h1",
      "children": "我的博客"
    },
    {
      "type": "BlogList",
      "children": [
        {
          "type": "Post",
          "props": { "title": "React RSC", "content": "..." }
        },
        {
          "type": "Post",
          "props": { "title": "Next.js 14", "content": "..." }
        },
        {
          "type": "module",
          // ← Client Component 的引用！
          "module_id": "./LikeButton.js",
          "module_name": "default",
          "props": { "postId": "123" }
        }
      ]
    }
  ]
}

浏览器收到后的处理：
1. 解析 RSC Payload
2. 对于 Server Component 的内容：直接作为 HTML 显示
3. 对于 Client Component 的引用：
   a. 下载对应的 JS 模块
   b. 使用 React.createElement() 创建实例
   c. 将 Props 传给客户端组件
   d. 执行 Hydration（仅针对 Client Component）
```

---

### 5. React 编译器（React Compiler）原理

#### React Forget / React Compiler 做了什么？

💡 **大白话——自动化的"手艺人"：**

以前，React 开发者需要手动使用 `useMemo`、`useCallback`、`React.memo` 等工具来优化性能。就像一个老练的手艺人，你要自己判断哪里需要优化、哪些值需要缓存。

React Compiler（代号 React Forget）就是一个**自动化工具**——它分析你的代码，自动帮你加上所有需要的缓存和优化。你不需要写 `useMemo` 和 `useCallback`，编译器帮你处理。

```
编译前（你写的代码）：
function SearchResults({ items, filter }) {
  const filtered = items.filter(item =>
    item.name.includes(filter)
  );
  return <List items={filtered} />;
}

编译后（React Compiler 自动优化）：
function SearchResults({ items, filter }) {
  // 🔑 编译器自动添加了 useMemo！
  const filtered = useMemo(() =>
    items.filter(item => item.name.includes(filter)),
    [items, filter]  // 自动分析出依赖
  );
  return <List items={filtered} />;
}
```

#### 自动记忆化（Auto-memoization）的原理

```javascript
// React Compiler 的核心分析流程：

// 第1步：分析函数组件
function MyComponent({ items, sortBy, onItemClick }) {
  const sorted = items.sort((a, b) => a[sortBy] - b[sortBy]);
  const handleClick = (id) => onItemClick(id);

  return (
    <List items={sorted} onItemClick={handleClick} />
  );
}

// 第2步：识别可优化的值
// 编译器扫描代码，发现：
// - sorted: 根据 items 和 sortBy 计算 → 可以缓存 → 添加 useMemo
// - handleClick: 依赖 onItemClick → 可以缓存 → 添加 useCallback

// 第3步：分析依赖关系
// 编译器跟踪变量的来源：
// - items 来自 props → 外部变量，是依赖
// - sortBy 来自 props → 外部变量，是依赖
// - onItemClick 来自 props → 外部变量，是依赖

// 第4步：生成优化后的代码
function MyComponent(props) {
  const { items, sortBy, onItemClick } = props;

  // 自动添加的 useMemo
  const $sorted = useMemo(
    () => items.sort((a, b) => a[sortBy] - b[sortBy]),
    [items, sortBy]
  );

  // 自动添加的 useCallback
  const $handleClick = useCallback(
    (id) => onItemClick(id),
    [onItemClick]
  );

  return (
    <List items={$sorted} onItemClick={$handleClick} />
  );
}
```

#### 编译器如何分析依赖关系

```
React Compiler 的分析策略：

1. 作用域分析（Scope Analysis）
   ┌─────────────────────────────────────────┐
   │ function MyComponent({ count, name }) { │
   │   // count: 来自外部（props）→ 依赖      │
   │   // name: 来自外部（props）→ 依赖       │
   │                                          │
   │   const doubled = count * 2;             │
   │   // doubled: 依赖 count → 需要缓存      │
   │                                          │
   │   const greeting = `Hello ${name}`;      │
   │   // greeting: 依赖 name → 需要缓存      │
   │                                          │
   │   if (count > 0) {                       │
   │     const extra = count + 10;            │
   │     // extra: 依赖 count → 需要缓存      │
   │   }                                      │
   │ }                                        │
   └─────────────────────────────────────────┘

2. 闭包捕获分析（Closure Analysis）
   ┌─────────────────────────────────────────┐
   │ function Component({ items }) {          │
   │   // items: 外部依赖                     │
   │                                          │
   │   const handleClick = (id) => {          │
   │     // 这个函数捕获了 items               │
   │     const item = items.find(i => i.id === id); │
   │     console.log(item);                   │
   │   };                                     │
   │   // handleClick 依赖 items → useCallback │
   │                                          │
   │   const memoizedValue = expensiveCalc(items); │
   │   // memoizedValue 依赖 items → useMemo  │
   │ }                                        │
   └─────────────────────────────────────────┘

3. 引用透明性分析（Referential Transparency）
   ┌─────────────────────────────────────────┐
   │ // 纯函数 → 输出只依赖输入 → 可以缓存     │
   │ function sortItems(items, key) {         │
   │   return [...items].sort((a, b) =>       │
   │     a[key] > b[key] ? 1 : -1             │
   │   );                                     │
   │ }                                        │
   │                                          │
   │ // 不纯函数 → 有副作用 → 不能缓存         │
   │ function logAndSort(items, key) {         │
   │   console.log('sorting...');  // 副作用！ │
   │   return [...items].sort(...);           │
   │ }                                        │
   │ // 编译器能检测到 console.log 是副作用    │
   │ // 但仍然可以安全地缓存（因为 console.log │
   │ // 的副作用是可接受的）                    │
   └─────────────────────────────────────────┘
```

#### 与手动 useMemo/useCallback 的关系

| 对比维度 | 手动优化 | React Compiler |
|---------|---------|---------------|
| **开发者工作量** | 大（每次都要手动加） | 零（自动处理） |
| **遗漏风险** | 高（容易忘记） | 无（编译器全面分析） |
| **过度优化** | 常见（不必要的 memo） | 编译器判断是否值得 |
| **依赖数组维护** | 手动维护（容易出错） | 自动分析（不会遗漏） |
| **调试难度** | 低（能看到代码） | 较高（编译产物不同于源码） |
| **运行时开销** | useMemo/useCallback 有微小开销 | 同样的开销，但自动管理 |
| **React 19+** | 仍然有效 | 推荐使用编译器替代 |

```javascript
// 手动优化 vs 编译器优化对比

// ========== 手动优化（以前的方式）==========
function ProductList({ products, category, onSelect }) {
  // 需要手动判断每个值是否需要缓存
  const filtered = useMemo(() => {
    return products.filter(p => p.category === category);
  }, [products, category]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => b.price - a.price);
  }, [filtered]);  // ← 依赖 filtered

  const handleClick = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);  // ← 依赖 onSelect

  return <List items={sorted} onClick={handleClick} />;
}

// ========== 编译器优化（React 19+ 的方式）==========
function ProductList({ products, category, onSelect }) {
  // 不需要任何 useMemo/useCallback！
  // 编译器自动分析并添加优化
  const filtered = products.filter(p => p.category === category);
  const sorted = [...filtered].sort((a, b) => b.price - a.price);
  const handleClick = (id) => onSelect(id);

  return <List items={sorted} onClick={handleClick} />;
}
// 编译器输出（等价于上面手动优化的版本）

⚠️ 注意事项：
// 编译器也有一些限制：
// 1. 某些模式可能无法正确分析（如高阶函数、动态依赖）
// 2. 如果你使用了一些"逃逸分析"无法追踪的模式，需要手动加 // eslint-disable-next-line
// 3. 编译器仍处于积极开发中，建议关注官方文档
```

> 💡 **总结**：React Compiler 是 React 团队的长期愿景——让开发者完全不需要思考性能优化，专注于业务逻辑。就像现代 JavaScript 引擎（V8）让你不需要手写优化的机器码一样，React Compiler 让你不需要手写 `useMemo` 和 `useCallback`。

---

## 🔗 下一步

[→ 29 - Server Components](../29-server-components/)
