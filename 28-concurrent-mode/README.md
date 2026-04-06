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

[→ 29 - Server Components](../29-server-components/)
