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

## 🏋️ 性能极限优化实战案例

### 1. 从 3 秒到 1 秒：首屏加载优化完整案例

#### 用 Lighthouse 评估当前状态

```
🏎️ 优化前基线评估：

  Lighthouse Performance 评分：42/100（差）

  ┌─────────────────────────────────────────────────────┐
  │  指标                  数值       评分               │
  │  ─────────────────────────────────────               │
  │  FCP                   3.2s       🔴 差              │
  │  LCP                   5.8s       🔴 差              │
  │  TBT                   1200ms     🔴 差              │
  │  CLS                   0.32       🔴 差              │
  │  Speed Index           4.5s       🔴 差              │
  │                                                     │
  │  📦 JS 总体积: 1.2MB (gzip: 380KB)                  │
  │  🖼️ 图片总体积: 2.8MB                               │
  │  📋 DOM 节点数: 1850                                 │
  │  🔗 网络请求数: 48                                   │
  └─────────────────────────────────────────────────────┘
```

#### 分析瀑布流请求图

```
Network 瀑布流分析（优化前）：

  时间 →  0ms     500ms    1000ms   1500ms   2000ms   3000ms
         ├────────┼────────┼────────┼────────┼────────┤
  HTML    ████████                                        (HTML 下载+解析)
  JS      ░░░░░░░░████████████████████                    (JS 下载 1.2MB)
  CSS     ░░░░░░░░░░░░████████                            (CSS 下载 85KB)
  Font    ░░░░░░░░░░░░░░░░░░░░████████████               (字体 150KB)
  API     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████████████ (API 等待 JS 执行)
  Image   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████ (图片最后才加载)

  问题分析：
  1. JS 太大（1.2MB），阻塞了 HTML 解析和首屏渲染
  2. 字体加载太晚，导致 FOUT（文字闪烁）
  3. API 请求被 JS 执行延迟
  4. 关键图片没有预加载，LCP 很高
```

#### 逐步优化与量化对比

```
🔧 Step 1：代码分割（React.lazy + Suspense）

  操作：
  • 路由级别分割：Home / Dashboard / Settings / Admin
  • 第三方库分割：图表库 / 富文本编辑器 / 日期选择器

  效果：
  ┌─────────────────────────────────────────────────┐
  │  指标        优化前      Step 1      改善       │
  │  JS 体积     1.2MB      350KB       ⬇ 71%     │
  │  FCP         3.2s       2.1s        ⬇ 34%     │
  │  LCP         5.8s       4.2s        ⬇ 28%     │
  │  TBT         1200ms     600ms       ⬇ 50%     │
  │  Lighthouse  42         58          ⬆ 16分    │
  └─────────────────────────────────────────────────┘
```

```
🔧 Step 2：图片优化

  操作：
  • PNG → WebP（体积减少 60-70%）
  • 添加 width/height 属性防止 CLS
  • 关键图片设置 fetchPriority="high"
  • 非首屏图片设置 loading="lazy"

  效果：
  ┌─────────────────────────────────────────────────┐
  │  指标        Step 1      Step 2      改善       │
  │  图片体积    2.8MB      680KB       ⬇ 76%     │
  │  LCP         4.2s       2.8s        ⬇ 33%     │
  │  CLS         0.32       0.12        ⬇ 63%     │
  │  Lighthouse  58         72          ⬆ 14分    │
  └─────────────────────────────────────────────────┘
```

```
🔧 Step 3：关键 CSS 内联 + 字体优化

  操作：
  • 首屏关键 CSS 内联到 HTML <head> 中
  • 非关键 CSS 异步加载
  • 字体 preconnect + font-display: swap

  效果：
  ┌─────────────────────────────────────────────────┐
  │  指标        Step 2      Step 3      改善       │
  │  FCP         2.1s       1.4s        ⬇ 33%     │
  │  LCP         2.8s       2.2s        ⬇ 21%     │
  │  CLS         0.12       0.04        ⬇ 67%     │
  │  Lighthouse  72         84          ⬆ 12分    │
  └─────────────────────────────────────────────────┘
```

```
🔧 Step 4：预加载关键资源

  操作：
  • <link rel="preload"> 首屏图片
  • <link rel="preconnect"> API 域名
  • <link rel="dns-prefetch"> 第三方域名
  • Link hover 时预加载下一页 chunk

  效果：
  ┌─────────────────────────────────────────────────┐
  │  指标        Step 3      Step 4      改善       │
  │  FCP         1.4s       1.1s        ⬇ 21%     │
  │  LCP         2.2s       1.6s        ⬇ 27%     │
  │  TBT         350ms      200ms       ⬇ 43%     │
  │  Lighthouse  84         92          ⬆ 8分     │
  └─────────────────────────────────────────────────┘
```

```
🔧 Step 5：SSR / SSG（可选，视架构而定）

  操作：
  • 首页使用 SSG（静态生成）
  • 列表页使用 ISR（增量静态再生成）
  • 详情页使用 SSR

  最终效果：
  ┌─────────────────────────────────────────────────────┐
  │  指标        初始基线    最终优化     总改善          │
  │  ─────────────────────────────────────────────       │
  │  FCP         3.2s        0.8s        ⬇ 75%          │
  │  LCP         5.8s        1.3s        ⬇ 78%          │
  │  TBT         1200ms      80ms        ⬇ 93%          │
  │  CLS         0.32        0.02        ⬇ 94%          │
  │  Speed Index 4.5s        1.1s        ⬇ 76%          │
  │  Lighthouse  42          97          ⬆ 55分         │
  │  JS 体积     1.2MB       180KB       ⬇ 85%          │
  └─────────────────────────────────────────────────────┘
  🎉 从 3 秒到 1 秒以内，Lighthouse 从 42 分提升到 97 分
```

---

### 2. 复杂表单性能优化实战

#### 场景：100+ 字段的大型表单

```
❌ 优化前的问题：

  function HugeForm({ onSubmit }) {
    // 100+ 个 useState！
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    // ... 98 more ...
    const [field100, setField100] = useState('');

    // 任何字段变化 → 整个组件重渲染
    // 包括 100 个输入框、验证提示、提交按钮等
    // 渲染时间: 45ms (超过 16ms，会掉帧！)

    return (
      <form>
        <input value={field1} onChange={e => setField1(e.target.value)} />
        {/* ... 98 more inputs ... */}
        <button onSubmit={handleSubmit}>提交</button>
      </form>
    );
  }

  输入延迟: 150-200ms（打字明显卡顿）
```

#### 字段级 memo 和分区渲染

```jsx
// ✅ 优化方案一：分区渲染 + React.memo

// 每个表单分区独立管理自己的状态
const PersonalInfoSection = memo(function PersonalInfoSection({ data, onChange }) {
  return (
    <fieldset>
      <legend>个人信息</legend>
      <FormInput label="姓名" value={data.name}
        onChange={val => onChange('name', val)} />
      <FormInput label="电话" value={data.phone}
        onChange={val => onChange('phone', val)} />
      <FormInput label="邮箱" value={data.email}
        onChange={val => onChange('email', val)} />
    </fieldset>
  );
});

const WorkInfoSection = memo(function WorkInfoSection({ data, onChange }) {
  return (
    <fieldset>
      <legend>工作信息</legend>
      <FormInput label="公司" value={data.company}
        onChange={val => onChange('company', val)} />
      <FormInput label="职位" value={data.position}
        onChange={val => onChange('position', val)} />
    </fieldset>
  );
});

// 每个输入框用 memo 包裹
const FormInput = memo(function FormInput({ label, value, onChange }) {
  // console.log(`渲染: ${label}`); // 验证只有当前字段重渲染
  return (
    <div style={{ marginBottom: 8 }}>
      <label>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
});
```

```
📊 优化效果对比：

  ┌─────────────────────────────────────────────────────┐
  │  方案              每次输入渲染的组件数   渲染耗时   │
  │  ─────────────────────────────────────────────       │
  │  ❌ 单一组件       100+ 个              45ms       │
  │  ✅ 分区 + memo     3 个（分区+输入框+表单）3ms     │
  │                                                   │
  │  输入延迟: 150ms → < 16ms  📈 响应速度提升 90%+    │
  └─────────────────────────────────────────────────────┘
```

#### 虚拟化表单（只渲染可视区域的字段）

```jsx
// ✅ 优化方案二：表单字段虚拟化
import { VariableSizeList as List } from 'react-window';

function VirtualizedForm({ fields }) {
  // 使用 useReducer 统一管理所有字段
  const [formData, dispatch] = useReducer(formReducer, initialFormData);

  // 每个字段的高度
  const getItemSize = (index) => {
    const field = fields[index];
    if (field.type === 'textarea') return 120;
    if (field.type === 'select') return 80;
    return 60;  // 默认输入框高度
  };

  return (
    <List
      height={600}
      itemCount={fields.length}
      itemSize={getItemSize}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <FormField
            key={fields[index].name}
            field={fields[index]}
            value={formData[fields[index].name]}
            onChange={(name, value) => dispatch({
              type: 'UPDATE_FIELD',
              payload: { name, value },
            })}
          />
        </div>
      )}
    </List>
  );
}

// 100 个字段只渲染约 10 个 DOM 节点
// 渲染时间: 2ms，滚动完全流畅
```

#### 表单验证的防抖处理

```jsx
// ✅ 实时验证 + 防抖
import { useMemo, useCallback } from 'react';
import { debounce } from 'lodash-es';

function useFormValidation(rules) {
  const [errors, setErrors] = useState({});
  const validateRef = useRef(null);

  // 创建防抖验证函数（只在创建时生成一次）
  if (!validateRef.current) {
    validateRef.current = debounce((field, value, allRules) => {
      const rule = allRules[field];
      if (!rule) return;

      // 执行验证逻辑
      const error = rule.validate ? rule.validate(value) : null;
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }, 300);  // 用户停止输入 300ms 后验证
  }

  // 清理防抖函数
  useEffect(() => {
    return () => validateRef.current.cancel();
  }, []);

  const validateField = useCallback((field, value) => {
    // 立即清除旧的错误（视觉反馈）
    setErrors(prev => ({ ...prev, [field]: undefined }));
    // 防抖执行实际验证
    validateRef.current(field, value, rules);
  }, [rules]);

  return { errors, validateField };
}

// 优化前后对比：
// 优化前：每次击键都执行验证 → 渲染 45ms
// 优化后：防抖 300ms 后验证 → 渲染 2ms
```

#### 联动字段的优化

```jsx
// ✅ 联动字段优化：避免循环渲染

function AddressForm() {
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');

  // 城市列表依赖省份 —— 用 useMemo 缓存
  const cities = useMemo(() => {
    if (!province) return [];
    return getCitiesByProvince(province);
  }, [province]);

  // 区县列表依赖城市 —— 用 useMemo 缓存
  const districts = useMemo(() => {
    if (!city) return [];
    return getDistrictsByCity(city);
  }, [city]);

  // 省份变化时清空城市和区县
  const handleProvinceChange = useCallback((value) => {
    setProvince(value);
    setCity('');       // 级联清空
    setDistrict('');   // 级联清空
  }, []);

  // 城市变化时清空区县
  const handleCityChange = useCallback((value) => {
    setCity(value);
    setDistrict('');   // 级联清空
  }, []);

  return (
    <>
      <Select value={province} onChange={handleProvinceChange}
        options={provinces} />
      <Select value={city} onChange={handleCityChange}
        options={cities} disabled={!province} />
      <Select value={district} onChange={setDistrict}
        options={districts} disabled={!city} />
    </>
  );
}
```

---

### 3. 大数据表格性能优化

#### 万级数据表格的渲染优化

```
❌ 优化前的问题：

  function DataTable({ data }) {
    // data 有 50000 条记录
    return (
      <table>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.status}</td>
              {/* ... 10 个列 ... */}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  问题：
  • DOM 节点数: 50000 × 12 = 600,000 个节点 💀
  • 首次渲染: 3000ms+
  • 滚动: 5-10fps（几乎不可用）
  • 内存占用: 800MB+
```

#### 虚拟滚动 + 固定列 + 排序/筛选

```jsx
// ✅ 完整的高性能数据表格
import { useCallback, useMemo, useState } from 'react';
import { useVirtual } from '@tanstack/react-virtual';

function HighPerformanceTable({ data: rawData, columns }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filterText, setFilterText] = useState('');
  const parentRef = useRef(null);

  // ⚡ 排序 + 筛选 — 用 useMemo 缓存
  const processedData = useMemo(() => {
    let result = rawData;

    // 筛选
    if (filterText) {
      const keyword = filterText.toLowerCase();
      result = result.filter(row =>
        columns.some(col =>
          String(row[col.key]).toLowerCase().includes(keyword)
        )
      );
    }

    // 排序
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawData, filterText, sortKey, sortDir, columns]);

  // ⚡ 虚拟滚动
  const rowVirtualizer = useVirtual({
    size: processedData.length,
    parentRef,
    estimateSize: useCallback(() => 48, []),  // 每行高度 48px
    overscan: 10,  // 上下各多渲染 10 行作为缓冲
  });

  // 排序回调
  const handleSort = useCallback((key) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  // 筛选防抖
  const handleFilter = useMemo(
    () => debounce(e => setFilterText(e.target.value), 200),
    []
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 工具栏 */}
      <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
        <input placeholder="搜索..." onChange={handleFilter} />
      </div>

      {/* 表头（固定） */}
      <div style={{ display: 'flex', height: 40, fontWeight: 'bold' }}>
        {columns.map(col => (
          <div key={col.key} style={{ flex: 1, padding: '0 12px' }}
            onClick={() => handleSort(col.key)}>
            {col.title}
            {sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
          </div>
        ))}
      </div>

      {/* 虚拟滚动列表 */}
      <div ref={parentRef}
        style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          height: rowVirtualizer.totalSize,
          width: '100%',
          position: 'relative',
        }}>
          {rowVirtualizer.virtualItems.map(virtualRow => {
            const row = processedData[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div style={{ display: 'flex', height: 48, alignItems: 'center' }}>
                  {columns.map(col => (
                    <div key={col.key} style={{ flex: 1, padding: '0 12px' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部信息 */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid #eee' }}>
        共 {processedData.length} 条记录
      </div>
    </div>
  );
}
```

#### Web Worker 处理大数据计算

```javascript
// worker.js — 在 Web Worker 中处理排序/筛选/计算
self.onmessage = function(e) {
  const { type, data, sortKey, sortDir, filterText, columns } = e.data;

  let result = data;

  if (type === 'process') {
    // 筛选
    if (filterText) {
      const keyword = filterText.toLowerCase();
      result = result.filter(row =>
        columns.some(col =>
          String(row[col.key]).toLowerCase().includes(keyword)
        )
      );
    }

    // 排序（大数据用 TypedArray 优化）
    if (sortKey) {
      result = result.slice().sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // 返回处理后的数据
    self.postMessage({ type: 'result', data: result });
  }
};
```

```jsx
// 在 React 中使用 Web Worker
function useWorkerProcessor(workerUrl) {
  const workerRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    workerRef.current = new Worker(workerUrl);
    return () => workerRef.current?.terminate();
  }, [workerUrl]);

  const process = useCallback((data, options) => {
    return new Promise((resolve) => {
      setIsProcessing(true);
      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'result') {
          setIsProcessing(false);
          resolve(e.data.data);
        }
      };
      workerRef.current.postMessage({ type: 'process', data, ...options });
    });
  }, []);

  return { process, isProcessing };
}
```

#### 分页 vs 无限滚动 vs 虚拟列表的选型

```
📊 三种方案对比：

  ┌─────────────────────────────────────────────────────────────┐
  │  特性            分页        无限滚动      虚拟列表         │
  │  ─────────────────────────────────────────────────────      │
  │  DOM 节点数       ~50          ~200         ~30             │
  │  内存占用         低           中（累积）     低（按需）     │
  │  滚动性能         ⭐⭐⭐⭐⭐    ⭐⭐⭐        ⭐⭐⭐⭐⭐      │
  │  数据定位         容易（页码）  困难          困难           │
  │  SEO 友好         ✅           ❌            ❌              │
  │  跳转到特定行     ✅ 页码跳转  ❌            ❌              │
  │  总数据量感知     ✅（总页数）  ❌            ❌              │
  │  实现复杂度       低           中            高              │
  │  适用场景         后台管理      社交 Feed     大数据表格     │
  │                  报表          商品列表      日志查看器     │
  └─────────────────────────────────────────────────────────────┘

  💡 选型建议：
  • 数据 < 1000 条 → 直接渲染，无需特殊优化
  • 数据 1000-10000 条 → 分页或虚拟列表
  • 数据 > 10000 条 → 虚拟列表（必须）
  • 用户需要"浏览全部" → 无限滚动
  • 用户需要"精确定位" → 分页 + 搜索
```

---

### 4. 动画性能优化实战

#### 60fps 动画的基本要求

```
🎯 60fps 意味着什么？

  每帧预算 = 1000ms / 60fps = 16.67ms

  在这 16.67ms 内浏览器需要完成：
  ┌────────────────────────────────────────────┐
  │  JavaScript 执行    │    ≤ 10ms            │
  │  样式计算            │    ≤ 2ms             │
  │  布局计算            │    ≤ 2ms             │
  │  绘制                │    ≤ 2ms             │
  │  合成                │    ≤ 0.67ms          │
  │  ───────────────────────────────────────    │
  │  总计                │    ≤ 16.67ms         │
  └────────────────────────────────────────────┘

  ⚠️ 如果 JS 执行超过 10ms，就无法维持 60fps
  ⚠️ 如果触发 Layout（回流），整个流程重新开始
```

#### will-change 的正确使用

```css
/* ✅ 正确用法：在动画即将开始前设置 */
.animate-in {
  will-change: transform, opacity;
  animation: slideIn 0.3s ease-out forwards;
}

/* ❌ 错误用法 1：滥用在静态元素上 */
.static-card {
  will-change: transform;  /* 没有动画，白白浪费内存！ */
}

/* ❌ 错误用法 2：用在太多元素上 */
.list-item:nth-child(n) {
  will-change: transform;  /* 1000 个元素 = 1000 个 GPU 图层！ */
}

/* ✅ 动态添加和移除 */
.modal-enter {
  will-change: transform, opacity;
}
.modal-enter-active {
  transform: translateX(0);
  opacity: 1;
}
.modal-enter-done {
  will-change: auto;  /* 动画结束后移除！ */
}
```

```
⚠️ will-change 使用规则：

  1. 不要把它当作性能优化的"万能药"
  2. 只在确实有动画/过渡的元素上使用
  3. 动画结束后及时移除（will-change: auto）
  4. 不要同时给超过 10 个元素添加
  5. 使用它做"预告"——在动画开始前 100-200ms 添加

  优化前后对比：
  ┌──────────────────────────────────────────────┐
  │  场景              FPS                        │
  │  ❌ 无 will-change   30-40fps（有时卡顿）     │
  │  ✅ 正确使用          55-60fps（流畅）         │
  │  ❌ 滥用（100+元素）  15-25fps（更卡了！）     │
  └──────────────────────────────────────────────┘
```

#### GPU 加速原理（transform / opacity）

```
🖥️ GPU 加速原理：

  浏览器的合成层模型：

  不使用 GPU 加速：
  ┌─────────────────────────────────────────────┐
  │  每次动画帧都需要：                           │
  │  Layout → Paint → Composite                   │
  │  （全部在 CPU 上完成，很慢）                   │
  │                                              │
  │  修改 left/top → Layout → Paint → Composite  │
  │  修改 width/height → Layout → Paint → Composite│
  └─────────────────────────────────────────────┘

  使用 GPU 加速（transform / opacity）：
  ┌─────────────────────────────────────────────┐
  │  元素被提升为独立的合成层（GPU 图层）         │
  │                                              │
  │  只需要：Composite（在 GPU 上完成，极快）     │
  │                                              │
  │  修改 transform → 只 Composite ✅             │
  │  修改 opacity → 只 Composite ✅               │
  └─────────────────────────────────────────────┘

  💡 为什么 transform/opacity 这么快？
  • 它们不影响文档流（不会触发 Layout）
  • 它们有自己的合成层（不触发 Paint）
  • GPU 天生擅长矩阵变换和透明度混合
```

#### 用 Chrome DevTools 检测动画帧率

```
📈 检测动画帧率的方法：

  方法 1：Performance 面板的 FPS 图表
  ┌─────────────────────────────────────────────┐
  │  Performance → 录制动画 → 查看 FPS 图表      │
  │                                              │
  │  FPS ────                                    │
  │  60 ├████████████████████████████████████    │
  │  45 ├                                 ████  │
  │  30 ├                              ██████   │
  │   0 └──────────────────────────────────      │
  │      时间 ──────────────────────────────→    │
  │                                              │
  │  ⚠️ 绿色 = 60fps（流畅）                     │
  │  🟡 黄色 = 30-59fps（可感知的卡顿）           │
  │  🔴 红色 = < 30fps（严重卡顿）               │
  └─────────────────────────────────────────────┘

  方法 2：Rendering 面板中的 Frame Rendering Stats
  ┌─────────────────────────────────────────────┐
  │  DevTools → ⋮ → More tools → Rendering      │
  │  勾选 "Frame Rendering Stats"                │
  │  页面右上角会显示实时 FPS                     │
  └─────────────────────────────────────────────┘

  方法 3：JavaScript 精确测量
  ┌─────────────────────────────────────────────┐
  │  let lastTime = performance.now();           │
  │  let frameCount = 0;                         │
  │  function measureFPS() {                     │
  │    frameCount++;                             │
  │    const now = performance.now();            │
  │    if (now - lastTime >= 1000) {             │
  │      console.log(`FPS: ${frameCount}`);      │
  │      frameCount = 0;                         │
  │      lastTime = now;                         │
  │    }                                         │
  │    requestAnimationFrame(measureFPS);        │
  │  }                                           │
  └─────────────────────────────────────────────┘
```

#### React Spring / Framer Motion 的性能对比

```
📊 动画库性能对比：

  测试场景：100 个列表项同时做入场动画

  ┌─────────────────────────────────────────────────────┐
  │  库                   包体积     FPS      首帧延迟    │
  │  ─────────────────────────────────────────────       │
  │  CSS Animation          0KB       60fps    0ms      │
  │  Framer Motion         30KB       58fps    5ms      │
  │  React Spring          25KB       56fps    8ms      │
  │  GSAP (React)          25KB       60fps    2ms      │
  │  原生 requestAnimFrame  0KB       60fps    1ms      │
  └─────────────────────────────────────────────────────┘

  💡 选型建议：
  • 简单入场/退出 → CSS Animation / Framer Motion
  • 物理弹簧效果 → React Spring
  • 复杂时间线动画 → GSAP
  • 追求极致性能 → CSS Animation + GPU 属性
```

#### 列表动画的批量优化

```jsx
// ❌ 优化前：每个列表项独立动画
// 100 个项目 = 100 个独立的 CSS transition
function BadListAnimation({ items }) {
  return items.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {item.text}
    </motion.div>
  ));
}
// 结果：500ms 后最后一个元素才开始动画，体验差

// ✅ 优化后：FLIP 动画技术
function OptimizedListAnimation({ items }) {
  const listRef = useRef(null);

  useEffect(() => {
    // FLIP: First, Last, Invert, Play
    const items = listRef.current.children;
    const firstRects = Array.from(items).map(el =>
      el.getBoundingClientRect()
    );

    // 触发 DOM 变化后...
    requestAnimationFrame(() => {
      Array.from(items).forEach((el, i) => {
        const lastRect = el.getBoundingClientRect();
        const deltaX = firstRects[i].left - lastRect.left;
        const deltaY = firstRects[i].top - lastRect.top;

        // Invert
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'none';

        // Play
        requestAnimationFrame(() => {
          el.style.transition = 'transform 300ms ease-out';
          el.style.transform = '';
        });
      });
    });
  }, [items]);

  return (
    <div ref={listRef}>
      {items.map(item => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  );
}

// ✅ 更简单的方案：CSS 动画 + stagger
// 一次性设置 CSS，让浏览器批量处理
function CSSListAnimation({ items }) {
  return (
    <div className="list-container">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="list-item"
          style={{
            animation: 'fadeIn 0.3s ease-out forwards',
            animationDelay: `${Math.min(index, 10) * 30}ms`,  // 最多延迟 300ms
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
```

---

### 5. 内存优化实战

#### React 组件卸载时的清理

```jsx
// ✅ 完整的资源清理检查清单

function ResourceHeavyComponent({ apiUrl, userId }) {
  const subscriptionRef = useRef(null);
  const timerRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // 1. 事件监听器
    const handleResize = () => { /* ... */ };
    const handleScroll = () => { /* ... */ };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    // 2. 定时器
    timerRef.current = setInterval(() => { /* ... */ }, 5000);

    // 3. WebSocket / SSE 订阅
    const ws = new WebSocket('wss://api.example.com/realtime');
    ws.onmessage = (e) => { /* ... */ };

    // 4. Intersection Observer
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { /* ... */ });
    });
    observerRef.current = observer;

    // 5. AbortController（取消网络请求）
    const controller = new AbortController();

    async function fetchData() {
      const res = await fetch(apiUrl, { signal: controller.signal });
      const data = await res.json();
      /* ... */
    }
    fetchData();

    // 🧹 统一清理（一个 return 搞定所有）
    return () => {
      // 清理事件监听器
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);

      // 清理定时器
      if (timerRef.current) clearInterval(timerRef.current);

      // 关闭 WebSocket
      if (ws.readyState === WebSocket.OPEN) ws.close();

      // 断开 Observer
      observer.disconnect();

      // 取消网络请求
      controller.abort();
    };
  }, [apiUrl, userId]);

  return <div>内容</div>;
}
```

#### 事件监听器泄漏的检测和修复

```jsx
// 🔍 检测工具：开发环境自动检测未清理的监听器
function useDebugEventListeners() {
  if (process.env.NODE_ENV !== 'development') return;

  useEffect(() => {
    // 覆写 addEventListener 记录调用栈
    const originalAdd = EventTarget.prototype.addEventListener;
    const listeners = new Map();

    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (!listeners.has(this)) listeners.set(this, []);
      listeners.get(this).push({
        type, listener, stack: new Error().stack,
      });
      return originalAdd.call(this, type, listener, options);
    };

    // 在控制台输出所有监听器
    window.__debugListeners = () => {
      console.table(
        Array.from(listeners.entries()).flatMap(([target, list]) =>
          list.map(l => ({
            target: target.constructor.name,
            type: l.type,
            stack: l.stack?.split('\n')[2],
          }))
        )
      );
    };

    return () => {
      EventTarget.prototype.addEventListener = originalAdd;
    };
  }, []);
}
```

#### 大列表数据的清理策略

```jsx
// ✅ 分页 + 内存回收策略
function LargeDataGrid({ fetchUrl }) {
  const [pages, setPages] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const MAX_CACHED_PAGES = 3;  // 最多缓存 3 页数据

  const loadPage = useCallback(async (page) => {
    if (pages[page]) return;  // 已缓存

    const res = await fetch(`${fetchUrl}?page=${page}&size=100`);
    const data = await res.json();

    setPages(prev => {
      const next = { ...prev, [page]: data };
      // 如果缓存页数超过上限，清理最早的页面
      const pageKeys = Object.keys(next).map(Number).sort((a, b) => a - b);
      while (pageKeys.length > MAX_CACHED_PAGES) {
        const oldestPage = pageKeys.shift();
        delete next[oldestPage];  // 释放不再需要的数据引用
      }
      return next;
    });
  }, [fetchUrl, pages]);

  useEffect(() => {
    loadPage(currentPage);
    // 预加载相邻页
    loadPage(currentPage + 1);
  }, [currentPage, loadPage]);

  return (
    <div>
      <Table data={pages[currentPage] || []} />
      <Pagination current={currentPage} onChange={setCurrentPage} />
    </div>
  );
}
```

#### Chrome Memory 面板使用教程

```
🧠 Chrome Memory 面板使用指南：

  面板 1：Heap Snapshot（堆快照）
  ┌─────────────────────────────────────────────────────┐
  │  用途：拍摄某个时刻的内存快照，分析对象分布         │
  │                                                     │
  │  操作步骤：                                         │
  │  ① 打开 Memory → 选择 "Heap snapshot"               │
  │  ② 点击 "Take snapshot" → 等待完成                   │
  │  ③ 查看 Summary 视图（按构造函数分组）              │
  │  ④ 点击 "Comparison" 对比两次快照                   │
  │                                                     │
  │  关键列说明：                                       │
  │  • Constructor — 对象类型                           │
  │  • Distance — 到 GC Root 的距离                     │
  │  • Shallow Size — 对象自身大小                      │
  │  • Retained Size — 对象及其引用的所有对象大小        │
  │                                                     │
  │  🔍 重点排查：                                      │
  │  • Detached DOM tree — 已从 DOM 移除但仍被 JS 引用  │
  │  • (closure) — 闭包持有的变量                       │
  │  • (array) — 数组持有的元素                         │
  │  • (string) — 重复的字符串                          │
  └─────────────────────────────────────────────────────┘

  面板 2：Allocation Timeline（分配时间线）
  ┌─────────────────────────────────────────────────────┐
  │  用途：录制一段时间内的内存分配情况                   │
  │                                                     │
  │  操作步骤：                                         │
  │  ① 选择 "Allocation instrumentation on timeline"     │
  │  ② 点击 Record → 执行操作 → Stop                    │
  │  ③ 查看蓝色柱状图（每次分配）                       │
  │  ④ 向上拖动蓝色区域，过滤特定时间段的分配           │
  │                                                     │
  │  💡 找持续增长的构造函数                            │
  │  如果某个函数的蓝色柱在持续变高                     │
  │  → 说明每次操作都在创建新对象，没有释放              │
  └─────────────────────────────────────────────────────┘

  面板 3：Allocation Sampling（采样分配）
  ┌─────────────────────────────────────────────────────┐
  │  用途：低开销地采样 JS 函数的内存分配               │
  │                                                     │
  │  适合长时间录制的场景（开销比 Timeline 小得多）      │
  │  可以快速定位哪些函数分配了最多内存                 │
  └─────────────────────────────────────────────────────┘

  排查内存泄漏的标准流程：
  ┌─────────────────────────────────────────────────────┐
  │  1. 取 Snapshot #1（基准）                          │
  │  2. 执行操作（打开弹窗、切换 Tab、滚动列表）        │
  │  3. 回到初始状态（关闭弹窗、切回 Tab）              │
  │  4. 取 Snapshot #2                                  │
  │  5. 重复步骤 2-4 两次，取 Snapshot #3、#4           │
  │  6. 对比 #1 和 #4（Comparison 视图）               │
  │  7. 找到 Delta（增长量）最大的对象                  │
  │  8. 检查 Retainers（谁持有了这个引用）              │
  └─────────────────────────────────────────────────────┘
```

#### WeakRef / FinalizationRegistry 的高级应用

```jsx
// ✅ 使用 WeakRef 实现自动清理的缓存

class AutoCleanCache {
  constructor() {
    this.cache = new Map();
    this.registry = new FinalizationRegistry((key) => {
      // 当 key 对象被 GC 回收时，自动清除缓存
      this.cache.delete(key);
      console.log(`[Cache] 自动清理了 key: ${key}`);
    });
  }

  get(keyObj) {
    const weakRef = this.cache.get(keyObj);
    if (!weakRef) return undefined;

    const value = weakRef.deref();
    if (value === undefined) {
      // WeakRef 的目标已被 GC 回收
      this.cache.delete(keyObj);
      return undefined;
    }
    return value;
  }

  set(keyObj, value) {
    const weakRef = new WeakRef(value);
    this.cache.set(keyObj, weakRef);

    // 注册回调：当 keyObj 被 GC 时自动清理
    this.registry.register(keyObj, keyObj, keyObj);
  }

  clear() {
    this.cache.clear();
    this.registry.unregister?.();
  }
}

// 使用场景：组件级缓存，组件卸载后自动释放
function useComponentCache() {
  const cacheRef = useRef(null);

  if (!cacheRef.current) {
    cacheRef.current = new AutoCleanCache();
  }

  return cacheRef.current;
}

// 在列表项中使用
function ListItem({ item }) {
  const cache = useComponentCache();

  const cachedResult = cache.get(item);
  const result = cachedResult ?? expensiveCompute(item);

  if (!cachedResult) {
    cache.set(item, result);
  }

  return <div>{result}</div>;
}
// 💡 当 item 对象不再被引用时，缓存自动释放
// 💡 不会造成内存泄漏
```

---

### 6. 服务端性能优化

#### SSR 缓存策略

```javascript
// ✅ Next.js 中实现 SSR 缓存

// 方案 1：使用 unstable_cache（App Router）
import { unstable_cache } from 'next/cache';

async function getProductList() {
  const data = unstable_cache(
    async () => {
      const res = await fetch('https://api.example.com/products', {
        next: { revalidate: 300 },  // 缓存 5 分钟
      });
      return res.json();
    },
    ['product-list'],           // 缓存 key
    { revalidate: 300, tags: ['products'] }  // 重新验证设置
  );
  return data;
}

// 方案 2：自定义内存缓存
const ssrCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;  // 5 分钟

async function cachedFetch(url, options = {}) {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const cached = ssrCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;  // 命中缓存
  }

  const data = await fetch(url, options).then(r => r.json());
  ssrCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

#### ISR（增量静态再生成）配置

```javascript
// ✅ Next.js ISR 配置
// pages/products/[id].js

export async function getStaticProps({ params }) {
  const product = await fetch(
    `https://api.example.com/products/${params.id}`
  ).then(r => r.json());

  return {
    props: { product },
    // 增量再生成：首次请求后，最多 60 秒更新一次
    revalidate: 60,
  };
}

// 生成静态页面时预先生成热门产品
export async function getStaticPaths() {
  const popularProducts = await fetch(
    'https://api.example.com/products/popular'
  ).then(r => r.json());

  return {
    paths: popularProducts.map(p => ({ params: { id: p.id } })),
    fallback: 'blocking',  // 未预生成的页面在请求时生成
  };
}
```

```
📊 ISR 性能对比：

  ┌─────────────────────────────────────────────────────┐
  │  方案          首次请求    后续请求    数据新鲜度     │
  │  ─────────────────────────────────────────────       │
  │  纯 SSR        500-2000ms  500-2000ms  ✅ 实时       │
  │  纯 SSG        50ms        50ms        ❌ 构建时固定 │
  │  ISR 60s       50-500ms    50ms        ⚠️ 最多延迟60s│
  │  ISR on-demand 50ms        50ms        ✅ 按需更新   │
  └─────────────────────────────────────────────────────┘

  💡 ISR 的优势：
  • 首次请求返回缓存的静态页面（极快）
  • 后台重新生成页面（数据保持新鲜）
  • 用户不需要等待服务端渲染
```

#### Edge Computing 在 React 中的应用

```
🌍 Edge Computing（边缘计算）：

  传统架构：
  ┌─────────────────────────────────────────────────────┐
  │  用户（北京）→ 美国服务器（200ms 延迟）→ 返回页面    │
  │  用户（上海）→ 美国服务器（250ms 延迟）→ 返回页面    │
  │  用户（广州）→ 美国服务器（220ms 延迟）→ 返回页面    │
  └─────────────────────────────────────────────────────┘

  Edge 架构：
  ┌─────────────────────────────────────────────────────┐
  │  用户（北京）→ 北京 Edge 节点（5ms）→ 返回页面       │
  │  用户（上海）→ 上海 Edge 节点（3ms）→ 返回页面       │
  │  用户（广州）→ 广州 Edge 节点（4ms）→ 返回页面       │
  └─────────────────────────────────────────────────────┘

  React 中的 Edge 方案：
  ┌─────────────────────────────────────────────────────┐
  │  框架           Edge 支持            配置方式         │
  │  ─────────────────────────────────────────────       │
  │  Next.js        Edge Runtime        export const     │
  │                                     runtime='edge'  │
  │  Vite           Vercel Edge         vercel.json      │
  │  Remix          Cloudflare Workers  wrangler.toml    │
  │  Astro          多种 Edge           astro.config     │
  └─────────────────────────────────────────────────────┘
```

```javascript
// Next.js Edge Runtime 示例
// app/api/hello/route.js

export const runtime = 'edge';

export async function GET(request) {
  // 在 Edge 节点上执行
  const url = new URL(request.url);
  const country = request.headers.get('x-vercel-ip-country');

  return new Response(JSON.stringify({
    message: `Hello from Edge!`,
    country,
    timestamp: Date.now(),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

#### CDN 缓存策略

```
📦 CDN 缓存层次：

  ┌─────────────────────────────────────────────────────┐
  │                                                     │
  │  浏览器缓存 ──→ CDN 边缘缓存 ──→ 源服务器           │
  │  (本地)        (全球分布)        (原始数据)          │
  │                                                     │
  │  缓存命中顺序：                                     │
  │  1. 浏览器本地缓存（最快，0ms）                     │
  │  2. CDN 边缘节点缓存（快，5-20ms）                 │
  │  3. 源服务器（慢，100-500ms）                       │
  │                                                     │
  └─────────────────────────────────────────────────────┘

  缓存策略配置：
  ┌─────────────────────────────────────────────────────┐
  │  资源类型         Cache-Control              max-age  │
  │  ─────────────────────────────────────────────       │
  │  HTML             no-cache                    0       │
  │  JS/CSS（带hash） immutable                  365天    │
  │  图片             public, max-age=31536000   365天    │
  │  API 数据         s-maxage=60, stale-while-  60s+    │
  │                   revalidate=86400                    │
  │  字体             public, max-age=31536000   365天    │
  └─────────────────────────────────────────────────────┘
```

#### API 响应缓存（Cache-Control / ETag）

```javascript
// ✅ 服务端 API 缓存策略

// 1. Cache-Control：控制缓存行为
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  // s-maxage=60: CDN 缓存 60 秒
  // stale-while-revalidate=86400: 60 秒后返回旧数据，后台更新
  // 效果：用户始终能快速拿到响应

  res.json(products);
});

// 2. ETag：条件请求，避免重复传输
app.get('/api/user/:id', async (req, res) => {
  const user = await getUser(req.params.id);

  // 生成 ETag（基于内容的哈希）
  const etag = crypto
    .createHash('md5')
    .update(JSON.stringify(user))
    .digest('hex');

  // 检查 If-None-Match 头
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();  // 内容未变，不传输数据
  }

  res.set('ETag', etag);
  res.json(user);
});

// 优化前后对比：
// 优化前：每次请求传输 5KB JSON，200ms
// 优化后：304 响应只传 200B，50ms
// 📈 带宽节省 96%，延迟降低 75%
```

---

[← 15 - 性能优化](../15-performance-optimization/) | [→ 22 - React动画](../22-animation/)
