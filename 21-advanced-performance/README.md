# 21 - 深度性能优化实战

## 🎯 本节目标
- 掌握 React 性能优化的高级技巧
- 深入理解渲染优化、网络优化、内存管理
- 学会构建生产级的高性能 React 应用

---

## 📖 高级渲染优化

### 1. 状态提升与降低的艺术

```jsx
// ❌ 错误:状态放在错误的层级导致不必要的重渲染
function App() {
  const [theme, setTheme] = useState('light');
  const [globalFilter, setGlobalFilter] = useState('');
  
  // theme变化导致整个应用重渲染!
  return (
    <div className={theme}>
      <Header onThemeChange={setTheme} />
      <MainContent filter={globalFilter} />
      <Footer />
    </div>
  );
}

// ✅ 正确:将不常变的状态隔离到Context或独立组件
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  // 使用useMemo避免重新创建context value
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 在组件树中按需消费
function ThemedComponent() {
  // 只有这个组件会在theme变化时重渲染
  const { theme } = useContext(ThemeContext);
  return <div className={theme}>...</div>;
}
```

### 2. 列表优化进阶

```jsx
import { useMemo } from 'react';

// ✅ 完整的列表优化方案
function OptimizedList({ items, onSelect }) {
  // 1. 过滤+排序使用useMemo
  const processedItems = useMemo(() => {
    return items
      .filter(item => item.visible)
      .sort((a, b) => a.order - b.order);
  }, [items]);

  // 2. 回调函数使用useCallback
  const handleSelect = useCallback((id) => {
    onSelect(id);
  }, [onSelect]);

  // 3. 虚拟化长列表
  if (processedItems.length > 100) {
    return (
      <VirtualList
        items={processedItems}
        onItemClick={handleSelect}
      />
    );
  }

  // 4. 短列表直接渲染,每个item用memo包装
  return (
    <ul>
      {processedItems.map(item => (
        <MemoizedListItem
          key={item.id}
          item={item}
          onClick={handleSelect}
        />
      ))}
    </ul>
  );
}

const MemoizedListItem = memo(function ListItem({ item, onClick }) {
  console.log(`Rendering ${item.id}`);
  return (
    <li onClick={() => onClick(item.id)}>
      {item.name}
    </li>
  );
});
```

### 3. Context 性能优化策略

```jsx
// ❌ 问题:任何state变化都会导致所有消费者重渲染
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  // user更新时,只用到theme的组件也会重渲染!
  const value = { user, setUser, theme, setTheme, notifications, setNotifications };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ✅ 解决方案一:拆分多个Context
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 组合使用
function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

// ✅ 解决方案二:状态选择器模式
function App() {
  // 只订阅需要的部分,其他state变化不会触发重渲染
  const user = useAppSelector(state => state.user);
  const theme = useAppSelector(state => state.theme);
  
  return <div className={theme}>Welcome, {user?.name}</div>;
}

// 实现useAppSelector Hook
function useAppSelector(selector) {
  const context = useContext(AppContext);
  const selectedValue = selector(context);
  
  // 使用useMemo缓存选择结果
  return useMemo(() => selectedValue, [selectedValue]);
}
```

### 4. 批量更新与FlushSync

```jsx
import { useState, useCallback, flushSync } from 'react-dom';

// ❌ 多次setState导致多次渲染
function BadExample() {
  const [count, setCount] = React.useState(0);
  const [flag, setFlag] = React.useState(false);

  function handleClick() {
    // React 18之前:每次调用都会触发一次渲染
    setCount(c => c + 1);  // 渲染1
    setFlag(f => !f);       // 渲染2
  }

  // ✅ React 18自动批处理(包括异步操作!)
  function handleClickOptimized() {
    // 这些会被批量处理成一次渲染
    fetch('/api/data').then(() => {
      setCount(c => c + 1);  // 不立即渲染
      setFlag(f => !f);      // 合并后一起渲染
    });
  }
}

// ✅ 强制同步更新(DOM测量等场景)
function MeasureExample() {
  const [height, setHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  function toggle() {
    // 需要在DOM更新后立即读取高度
    flushSync(() => {
      setIsExpanded(prev => !prev);
    });
    
    // 此时DOM已经更新,可以正确获取高度
    const newHeight = ref.current.offsetHeight;
    setHeight(newHeight);
  }
}
```

### 5. useTransition用于非紧急更新

```jsx
import { useState, useTransition, startTransition } from 'react';

function SearchExample() {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;
    
    // 紧急更新:输入框立即响应
    setInputValue(value);
    
    // 非紧急更新:搜索结果可以延迟
    startTransition(() => {
      setSearchQuery(value);  // 标记为低优先级
    });
  }

  return (
    <div>
      <input 
        value={inputValue} 
        onChange={handleChange} 
        style={{ opacity: isPending ? 0.7 : 1 }}
      />
      
      {/* isPending为true时显示过渡状态 */}
      {isPending && <Spinner />}
      
      {/* 搜索结果 */}
      <Results query={searchQuery} />
    </div>
  );
}

// 适用场景:
// - 搜索过滤(输入即时响应,结果延迟加载)
// - 大型列表导航
// - 复杂表单的实时验证
// - 数据可视化中的数据切换
```

### 6. Deferred Value 延迟非关键部分

```jsx
import { useState, useDeferredValue } from 'react';

function ProductList({ products }) {
  const [filter, setFilter] = useState('');
  
  // 将filter标记为可延迟更新的值
  const deferredFilter = useDeferredValue(filter);

  // 即时显示输入值
  // deferredFilter可能还是旧值,但不会阻塞UI
  return (
    <div>
      <input 
        value={filter} 
        onChange={e => setFilter(e.target.value)} 
      />
      
      {/* 使用deferredFilter进行过滤 */}
      <SlowList items={products} filter={deferredFilter} />
    </div>
  );
}

function SlowList({ items, filter }) {
  const filtered = useMemo(() => {
    // 昂贵的过滤操作
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // 渲染10000个item...
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {filtered.map(item => (
        <li key={item.id} style={{ height: 30 }}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🚀 网络性能优化

### 1. 数据请求优化

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// ✅ 带有缓存的智能数据请求Hook
function useData(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cache = useRef(new Map());

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // 检查缓存
      if (cache.current.has(url)) {
        setData(cache.current.get(url));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(url);
        
        if (!cancelled) {
          cache.current.set(url, response.data);
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // 提供清除缓存的方法
  const invalidateCache = useCallback(() => {
    cache.current.delete(url);
  }, [url]);

  return { data, loading, error, invalidateCache };
}

// 使用
function UserProfile({ userId }) {
  const { data: user, loading, error } = useData(`/api/users/${userId}`);

  if (loading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return <UserCard user={user} />;
}
```

### 2. 请求去重与竞态处理

```jsx
import { useRef, useCallback } from 'react';

// ✅ 请求去重Hook
function useDeduplicatedRequest(requestFn) {
  const pendingRequests = useRef(new Map());

  const execute = useCallback(async (...args) => {
    const key = JSON.stringify(args);
    
    // 如果已有相同请求在进行中,复用它
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key);
    }

    const promise = requestFn(...args)
      .finally(() => {
        pendingRequests.current.delete(key);
      });

    pendingRequests.current.set(key, promise);
    return promise;
  }, [requestFn]);

  return execute;
}

// ✅ 自动取消前一次请求
function useLatestRequest(fetcher) {
  const controllerRef = useRef();

  const execute = useCallback(async (...args) => {
    // 取消上一次未完成的请求
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const result = await fetcher(...args, { signal: controller.signal });
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;  // 只抛出真正的错误
      }
    }
  }, [fetcher]);

  return execute;
}
```

### 3. 预加载与预取

```jsx
import { useEffect, useRef } from 'react';

// ✅ 预加载下一页数据
function PaginatedList({ fetchData }) {
  const [page, setPage] = useState(1);
  const observerTarget = useRef(null);

  // Intersection Observer实现无限滚动预加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 用户快滚动到底部了,预加载下一页
          preloadNextPage();
        }
      },
      { rootMargin: '200px' }  // 提前200px触发
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, []);

  const preloadNextPage = () => {
    // 预取但不显示
    fetchData(page + 1).then(data => {
      // 缓存到内存,用户翻页时立即可用
      cache.set(page + 1, data);
    });
  };

  return (
    <div>
      {/* 当前页面数据 */}
      <List data={currentPageData} />
      
      {/* 观察目标 */}
      <div ref={observerTarget} style={{ height: 10 }} />
    </div>
  );
}

// ✅ 链接预取(鼠标hover时预加载)
function PrefetchLink({ href, children, prefetch = true }) {
  const handleMouseEnter = () => {
    if (prefetch) {
      // 预加载页面资源
      prefetchPage(href);
    }
  };

  return (
    <Link 
      to={href}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}
```

### 4. 图片优化策略

```jsx
import { useState, useRef, useEffect } from 'react';

// ✅ 完整的图片懒加载+渐进式加载组件
function OptimizedImage({
  src,
  alt,
  placeholder,
  blurDataURL,
  width,
  height,
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(placeholder || blurDataURL);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer实现视口检测
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();  // 只需要触发一次
        }
      },
      { rootMargin: '50px' }  // 提前50px开始加载
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 进入视口后加载真实图片
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
      // 可以设置fallback图片
    };
  }, [isInView, src]);

  return (
    <div 
      ref={imgRef}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden'
      }}
      {...props}
    >
      {/* 占位符/模糊效果 */}
      {isLoading && blurDataURL && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.1)',  // 避免模糊边缘
          }}
        />
      )}

      {/* 真实图片 */}
      <img
        src={imageSrc}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: isLoading ? 'opacity 0.3s' : 'none',
          opacity: isLoading ? 0 : 1,
        }}
        loading="lazy"  // 浏览器原生懒加载
        decoding="async"  // 异步解码
      />

      {/* 加载指示器 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}

// 使用示例
<ProductCard
  image={
    <OptimizedImage
      src="/images/product.jpg"
      alt="Product"
      width={300}
      height={400}
      placeholder="/images/placeholder.jpg"
      blurDataURL="/images/product-small-blur.jpg"
    />
  }
/>
```

### 5. Web Worker离线计算

```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

// ✅ 使用Web Worker进行CPU密集型计算
function HeavyComputationWorker() {
  const [result, setResult] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // 创建Web Worker
    workerRef.current = new Worker('/workers/heavy-computation.js');

    // 监听worker消息
    workerRef.current.onmessage = (e) => {
      setResult(e.data);
    };

    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error);
    };

    return () => {
      // 清理worker
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const compute = useCallback((data) => {
    if (workerRef.current) {
      // 发送数据给worker,主线程不会被阻塞
      workerRef.current.postMessage(data);
    }
  }, []);

  // 发送计算任务
  useEffect(() => {
    compute(largeDataset);
  }, []);

  return (
    <div>
      {result ? (
        <Visualization data={result} />
      ) : (
        <LoadingMessage>正在后台计算中...</LoadingMessage>
      )}
    </div>
  );
}

/* heavy-computation.js */
self.onmessage = function(e) {
  const data = e.data;
  
  // CPU密集型操作,不会阻塞UI
  const result = performHeavyCalculation(data);
  
  // 返回结果给主线程
  self.postMessage(result);
};

function performHeavyCalculation(data) {
  // 例如:复杂的数据分析、图像处理、加密解密等
  return data.map(item => ({
    ...item,
    computed: complexAlgorithm(item),
  }));
}
```

---

## 💾 内存优化

### 1. 防止内存泄漏

```jsx
import { useEffect, useRef } from 'react';

// ✅ 完整的资源清理模式
function ResourceIntensiveComponent({ dataSource }) {
  const intervalRef = useRef(null);
  const eventListenerCleanup = useRef(null);

  useEffect(() => {
    // 设置定时器
    intervalRef.current = setInterval(() => {
      updateData();
    }, 5000);

    // 添加事件监听
    const handleResize = debounce(handleWindowResize, 300);
    window.addEventListener('resize', handleResize);
    eventListenerCleanup.current = () => {
      window.removeEventListener('resize', handleResize);
    };

    // 订阅外部数据源
    const subscription = dataSource.subscribe(handleNewData);

    // 清理函数:组件卸载时执行
    return () => {
      // 清理定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // 移除事件监听
      if (eventListenerCleanup.current) {
        eventListenerCleanup.current();
      }

      // 取消订阅
      subscription.unsubscribe();
    };
  }, [dataSource]);

  // ...
}
```

### 2. 大数据集的内存管理

```jsx
import { useState, useCallback, useMemo } from 'react';

// ✅ 分页/虚拟化 + 内存清理
function LargeDatasetViewer({ dataset }) {
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 100;

  // 只保留当前页的数据在内存中
  const currentPageData = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    
    return dataset.slice(start, end);
  }, [dataset, currentPage]);

  // 当离开当前页时,释放不再使用的引用
  const handlePageChange = useCallback((newPage) => {
    // 触发垃圾回收提示(现代浏览器会自动优化)
    setCurrentPage(newPage);
  }, []);

  return (
    <div>
      <Table data={currentPageData} />
      
      <Pagination
        total={Math.ceil(dataset.length / PAGE_SIZE)}
        current={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// ✅ 使用WeakMap存储临时数据
function ComponentWithTemporaryCache() {
  // WeakMap允许GC回收key对象时自动清除对应value
  const cache = useRef(new WeakMap());

  const processItem = useCallback((item) => {
    // 检查缓存
    if (cache.current.has(item)) {
      return cache.current.get(item);
    }

    // 计算并缓存
    const result = expensiveOperation(item);
    cache.current.set(item, result);
    
    return result;
  }, []);
}
```

### 3. 组件卸载后的异步操作处理

```jsx
import { useEffect, useRef, useState } from 'react';

// ✅ 安全处理异步操作的组件卸载场景
function AsyncDataComponent({ apiUrl }) {
  const [data, setData] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // 标记组件已挂载
    mountedRef.current = true;

    async function loadData() {
      try {
        const response = await fetch(apiUrl);
        const json = await response.json();
        
        // 只有组件仍然挂载时才更新状态
        if (mountedRef.current) {
          setData(json);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.error(error);
        }
      }
    }

    loadData();

    return () => {
      // 标记组件已卸载
      mountedRef.current = false;
    };
  }, [apiUrl]);

  // 或者使用AbortController
  useEffect(() => {
    const abortController = new AbortController();

    fetch(apiUrl, { signal: abortController.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });

    return () => {
      abortController.abort();  // 取消进行中的请求
    };
  }, [apiUrl]);

  return data ? <Display data={data} /> : null;
}
```

---

## 📦 打包与构建优化

### 1. 动态导入策略

```jsx
import { lazy, Suspense } from 'react';

// ✅ 基于路由的代码分割
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// ✅ 基于条件的动态导入
function ConditionalLoader({ featureFlag, isAdmin }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {featureFlag === 'new-dashboard' ? (
        <NewDashboard />  // 新功能的独立chunk
      ) : (
        <Dashboard />
      )}
      
      {isAdmin && <AdminPanel />}  // 管理功能按需加载
    </Suspense>
  );
}

// ✅ 预加载策略
function Navigation() {
  const navigate = useNavigate();

  const handleMouseEnter = (path) => {
    // 鼠标悬停时预加载对应组件
    switch(path) {
      case '/dashboard':
        import('./pages/Dashboard');  // 触发prefetch
        break;
      case '/settings':
        import('./pages/Settings');
        break;
    }
  };

  return (
    <nav>
      <Link 
        to="/dashboard" 
        onMouseEnter={() => handleMouseEnter('/dashboard')}
      >
        Dashboard
      </Link>
      <Link 
        to="/settings" 
        onMouseEnter={() => handleMouseEnter('/settings')}
      >
        Settings
      </Link>
    </nav>
  );
}
```

### 2. Tree Shaking优化

```javascript
// vite.config.js 或 webpack.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关依赖分离到单独的chunk
          'vendor-react': ['react', 'react-dom'],
          
          // UI库单独打包
          'vendor-ui': ['@mui/material', '@mui/icons-material'],
          
          // 工具库
          'vendor-utils': ['lodash', 'date-fns', 'axios'],
          
          // 路由相关
          'vendor-router': ['react-router-dom'],
        },
      },
    },
  },
};

// ✅ 使用ESM模块确保Tree Shaking生效
// ❌ CommonJS无法Tree Shake
import _ from 'lodash';  // 引入整个lodash!

// ✅ ESM模块支持Tree Shaking
import debounce from 'lodash/debounce';  // 只引入debounce
import { format, parseISO } from 'date-fns';  // 只引入需要的函数
```

### 3. Bundle分析与监控

```jsx
// ✅ 生产环境Bundle大小监控组件
function BundleMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // 监测首次内容绘制时间
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          // 上报到监控系统
          analytics.track('LCP', {
            value: entry.startTime,
          });
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    // 监控首屏渲染完成
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        analytics.track('PerformanceMetrics', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.startTime,
          loadComplete: perfData.loadEventEnd - perfTime.startTime,
          firstPaint: perfData.responseStart - perfData.requestStart,
        });
      }, 0);
    });

    return () => observer.disconnect();
  }, []);

  return null;  // 不渲染任何内容
}
```

---

## 🎨 渲染层优化

### 1. CSS-in-JS性能

```jsx
// ✅ 使用CSS变量替代运行时的样式计算
function ThemedButton({ variant = 'primary' }) {
  // ❌ 每次渲染都创建新样式对象
  // const styles = { backgroundColor: theme.colors.primary };

  // ✅ 使用CSS类名或CSS变量
  return (
    <button className={`btn btn-${variant}`}>
      Click me
    </button>
  );
}

/* global.css */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --spacing-sm: 8px;
  --radius-md: 6px;
}

.btn-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}
```

### 2. 减少DOM节点数量

```jsx
// ❌ 过多的嵌套层级
<div>
  <div>
    <div>
      <span>
        <strong>{text}</strong>
      </span>
    </div>
  </div>
</div>

// ✅ 扁平化结构
<strong className="text-wrapper">{text}</strong>

// ✅ 使用CSS伪元素代替额外的DOM节点
function Card({ title, content }) {
  return (
    <article className="card">
      <h3 className="card__title">{title}</h3>
      <p className="card__content">{content}</p>
      
      {/* 用CSS ::after实现装饰元素,而不是额外div */}
    </article>
  );
}

.card::before {
  /* 装饰性背景 */
}

.card::after {
  /* 装饰性边框 */
}
```

### 3. will-change与GPU加速

```jsx
// ✅ 对频繁动画的元素使用will-change
function AnimatedModal({ isOpen, onClose, children }) {
  return (
    <>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{
            // 提示浏览器提前优化
            willChange: 'opacity',
          }}
          onClick={onClose}
        >
          <div
            className="modal-content"
            style={{
              willChange: 'transform, opacity',
              transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}  // 阻止事件冒泡
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}

/* 注意事项:
- 不要过度使用will-change
- 在动画完成后移除will-change
- 对于transform/opacity,浏览器通常会自动GPU加速
- 避免在大量元素上同时使用
*/
```

---

## 🔧 性能监控体系

### 1. 自定义性能指标收集

```jsx
import { useEffect, useRef } from 'react';

// ✅ Core Web Vitals监控
function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 收集FID(First Input Delay)
    const measureFID = () => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          reportMetric('FID', entry.processingStart - entry.startTime);
        }
      }).observe({ type: 'first-input', buffered: true });
    };

    // 收集CLS(Cumulative Layout Shift)
    const measureCLS = () => {
      let clsValue = 0;
      
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        reportMetric('CLS', clsValue);
      }).observe({ type: 'layout-shift', buffered: true });
    };

    // 收集LCP(Largest Contentful Paint)
    const measureLCP = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        reportMetric('LCP', lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    };

    measureFID();
    measureCLS();
    measureLCP();
  }, []);

  function reportMetric(name, value) {
    // 上报到监控系统
    if (navigator.sendBeacon) {
      const data = JSON.stringify({ name, value, url: location.href, timestamp: Date.now() });
      navigator.sendBeacon('/api/metrics', data);
    }
  }

  return null;
}

// 在App根组件使用
function App({ children }) {
  return (
    <>
      <PerformanceMonitor />
      {children}
    </>
  );
}
```

### 2. React Profiler集成

```jsx
import { Profiler } from 'react';

// ✅ 收集组件级性能数据
function ProfiledApp({ children }) {
  const onRenderCallback = (
    id,              // Profiler id
    phase,           // "mount" | "update"
    actualDuration,  // 实际渲染耗时
    baseDuration,    // 无优化的预计耗时
    startTime,       // 开始时间戳
    commitTime,      // 提交时间戳
    interactions     // 交互集合
  ) => {
    // 只记录慢渲染(超过16ms)
    if (actualDuration > 16) {
      logToAnalyticsService({
        componentName: id,
        phase,
        actualDuration,
        baseDuration,
        timestamp: Date.now(),
      });
    }
  };

  return (
    <Profiler id="App" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}
```

### 3. 用户感知性能指标

```jsx
import { useState, useEffect } from 'react';

// ✅ 显示实际的用户体验指标
function UserPerceptionMetrics() {
  const metrics = useState({
    interactiveTime: null,
    contentVisibleTime: null,
  });

  useEffect(() => {
    // TTI(Time to Interactive)
    const checkInteractive = () => {
      if (document.readyState === 'complete') {
        const tti = performance.now();
        updateMetric('interactiveTime', tti);
      }
    };

    document.addEventListener('readystatechange', checkInteractive);

    return () => {
      document.removeEventListener('readystatechange', checkInteractive);
    };
  }, []);

  // 开发环境显示性能面板
  if (process.env.NODE_ENV === 'development') {
    return (
      <DevToolsPanel position="bottom-right">
        <h4>Performance Metrics</h4>
        <ul>
          <li>TTI: {metrics.interactiveTime?.toFixed(0)}ms</li>
        </ul>
      </DevToolsPanel>
    );
  }

  return null;
}
```

---

## 📋 性能优化检查清单(完整版)

### 🔄 渲染性能
- [ ] 使用React.memo包装大型子组件
- [ ] 复杂计算使用useMemo缓存
- [ ] 传递给memo组件的回调使用useCallback
- [ ] 避免内联对象/数组作为props
- [ ] 合理拆分组件,隔离频繁更新的状态
- [ ] 使用useTransition/useDeferredValue标记非紧急更新
- [ ] 利用React 18的自动批处理特性

### 🌐 网络优化
- [ ] 路由级别代码分割(lazy + Suspense)
- [ ] 图片懒加载+响应式图片
- [ ] API请求防抖节流
- [ ] 实现请求缓存与去重
- [ ] 关键路径资源预加载(preload/prefetch)
- [ ] 使用CDN加速静态资源
- [ ] 启用Gzip/Brotli压缩

### 💾 内存管理
- [ ] 清理定时器、事件监听器、订阅
- [ ] 处理组件卸载后的异步操作(AbortController)
- [ ] 大数据集分页或虚拟化处理
- [ ] 避免在state中存储大对象
- [ ] 及时释放不再需要的引用

### 🎨 DOM/CSS优化
- [ ] 减少DOM节点数量和嵌套层级
- [ ] CSS动画优先于JS动画
- [ ] 谨慎使用will-change
- [ ] 长列表使用虚拟滚动(react-window/react-virtualized)
- [ ] 避免强制同步布局(Force synchronous layout)

### 📦 构建优化
- [ ] 配置合理的代码分割策略
- [ ] 确保Tree Shaking正常工作(使用ESM)
- [ ] 第三方库提取到vendor chunk
- [ ] 分析并优化Bundle体积
- [ ] 使用最新稳定版的构建工具(Vite/Webpack 5)

### 📊 监控告警
- [ ] 收集Core Web Vitals(FID/LCP/CLS)
- [ ] 集成React Profiler监控慢组件
- [ ] 设定性能预算(Bundle Size/Load Time)
- [ ] 建立性能回归预警机制
- [ ] 定期审查性能报告

---

## ⚠️ 反模式警告

```jsx
// ❌ 反模式1:过早优化
// 不要在没有性能问题时就到处加memo/useMemo
// 先测量,再优化!

// ❌ 反模式2:滥用useMemo
function BadUseMemo() {
  // 这种简单计算不需要缓存
  const doubled = useMemo(() => count * 2, [count]);  // 直接写 count * 2
  
  // 这种字符串拼接不需要缓存
  const fullName = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);
}

// ❌ 反模式3:过度拆分组件
// 拆分成太多小组件会增加复杂度和管理成本
// 只有当某个部分确实需要独立更新时才考虑拆分

// ❌ 反模式4:忽略算法复杂度
// 再多的React优化也救不了O(n²)的算法
function BadAlgorithm({ items }) {
  return items.map(item => (
    items.map(otherItem => (  // O(n²)!
      <Pair key={`${item.id}-${otherItem.id}`} {...} />
    ))
  ));
}

// ✅ 正确做法:先优化算法和数据结构
function GoodAlgorithm({ items }) {
  const pairs = useMemo(() => {
    return generatePairs(items);  // O(n)或更优
  }, [items]);
  
  return pairs.map(pair => <Pair key={pair.id} {...} />);
}
```

---

## 🎯 实战案例:优化一个真实的仪表盘

### 场景描述
一个包含以下功能的实时数据仪表盘:
- 实时更新的KPI卡片(每5秒)
- 大型数据表格(1000+行)
- 图表可视化
- 侧边栏导航
- 用户偏好设置

### 优化步骤

```jsx
function OptimizedDashboard({ initialData }) {
  return (
    <DashboardLayout>
      {/* 1. KPI卡片区域:使用useTransition避免阻塞 */}
      <KPICardsSection />
      
      {/* 2. 表格区域:虚拟化+独立状态管理 */}
      <VirtualizedDataTable />
      
      {/* 3. 图表区域:懒加载+Web Worker计算 */}
      <Suspense fallback={<ChartSkeleton />}>
        <LazyChartSection />
      </Suspense>
      
      {/* 4. 导航栏:完全静态,用React.memo固定 */}
      <MemoizedSidebar />
    </DashboardLayout>
  );
}

// KPI卡片:使用transition标记非紧急更新
function KPICardsSection() {
  const [kpis, setKpis] = useState(initialKpis);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/kpis/latest')
        .then(res => res.json())
        .then(data => {
          startTransition(() => {
            setKpis(data);  // 低优先级更新
          });
        });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ opacity: isPending ? 0.7 : 1 }}>
      {kpis.map(kpi => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </section>
  );
}

// 表格:完整的虚拟化实现
function VirtualizedDataTable({ columns, data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filter, setFilter] = useState('');
  
  // 过滤+排序使用useMemo
  const processedData = useMemo(() => {
    let filtered = data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(filter.toLowerCase())
      )
    );
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [data, filter, sortConfig]);

  return (
    <TableContainer>
      <TableToolbar>
        <SearchInput
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </TableToolbar>
      
      {/* 使用react-window虚拟化 */}
      <FixedSizeList
        height={600}
        itemCount={processedData.length}
        itemSize={48}
        width="100%"
      >
        {({ index, style }) => (
          <TableRow
            style={style}
            row={processedData[index]}
            columns={columns}
          />
        )}
      </FixedSizeList>
    </TableContainer>
  );
}
```

---

## 📝 练习任务

### 任务1:性能审计与修复
提供一个存在严重性能问题的组件(包含上述所有反模式),要求:
1. 使用React DevTools Profiler识别问题
2. 应用本章节学到的技术进行优化
3. 量化优化效果(渲染次数、耗时等)

### 任务2:构建高性能表格组件
实现一个具备以下特性的数据表格:
- 支持排序、筛选、分页
- 虚拟滚动(10000+行数据流畅滚动)
- 行内编辑
- 可选列
- 导出功能
- 性能监控面板

### 任务3:Core Web Vitals优化项目
针对一个真实网页,优化到以下标准:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- 并建立持续的性能监控体系

---

## 🔗 相关资源

- [React官方文档 - 性能优化](https://react.dev/reference/react/memo)
- [web.dev/Core-Vitals](https://web.dev/vitals/)
- [React Profiler API](https://react.dev/reference/react/Profiler)
- [react-window文档](https://github.com/bvaughn/react-window)
- [Vite构建优化指南](https://vitejs.dev/guide/build.html)

---

[← 15 - 性能优化](../15-performance-optimization/) | [→ 22 - React动画](../22-animation/)
