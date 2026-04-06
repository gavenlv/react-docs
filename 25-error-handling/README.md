# 25 - 错误处理与日志系统

## 🎯 本节目标
- 构建健壮的错误处理机制
- 实现完善的日志收集与分析系统
- 学会优雅地降级和恢复

---

## 📖 错误类型分类

### 1. 可预期的错误
- 表单验证失败
- 网络请求超时
- 用户权限不足
- 数据格式异常

### 2. 不可预期的错误
- JavaScript运行时错误
- 第三方库抛出的异常
- 内存溢出
- 未捕获的Promise rejection

### 3. 外部依赖故障
- API服务不可用
- CDN资源加载失败
- 第三方脚本错误

---

## 🛡️ React错误边界(Error Boundaries)

### 基础Error Boundary

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新state使下一次渲染能显示fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({ error, errorInfo });
    
    // 上报错误到日志服务
    logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // 可选:重新尝试渲染子组件
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // 自定义fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback" role="alert">
          <h2>出了点问题</h2>
          <p>抱歉,页面遇到了意外错误。我们已经记录了这个问题。</p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
              <summary>错误详情(仅开发环境)</summary>
              <p>{this.state.error?.toString()}</p>
              <pre>{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          
          <button onClick={this.handleReset}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <ErrorBoundary>
        <MainContent />  {/* 独立的错误边界 */}
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

### 2. 函数式Error Boundary Hook(实验性)

```jsx
import { useState, useEffect } from 'react';

// 注意:目前React还没有原生Hook版本的Error Boundary
// 但可以使用react-error-boundary库
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>出现了一些问题:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </div>
  );
}

function MyComponent() {
  const [data, setData] = useState(null);

  // 可以在组件内部抛出错误
  if (!data) {
    throw new Promise(resolve => setTimeout(() => resolve(setData({})), 1000));
  }

  return <div>{/* 渲染数据 */}</div>;
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      resetKeys={['someKey']}  // 当这些值变化时自动重置
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### 3. 分级错误处理

```jsx
// 全局错误边界 - 捕获任何未处理的错误
class GlobalErrorBoundary extends Component {
  state = { eventId: null };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 上报严重错误
    const eventId = captureException(error, { contexts: { react: errorInfo } });
    this.setState({ eventId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="global-error">
          <h1>应用程序遇到错误</h1>
          <p>错误ID: {this.state.eventId}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
          <button onClick={() => window.history.back()}>
            返回上一页
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 页面级别错误边界 - 整个页面出错时显示友好提示
class PageErrorBoundary extends Component {
  // ...
  render() {
    if (this.state.hasError) {
      return (
        <PageContainer>
          <Sidebar />
          <ContentArea>
            <ErrorDisplay
              title="此页面无法正常显示"
              suggestion="您可以尝试刷新或返回其他页面"
              onRetry={() => this.handleReset()}
              onHome={() => navigate('/')}
            />
          </ContentArea>
        </PageContainer>
      );
    }
    return this.props.children;
  }
}

// 组件级别错误边界 - 小部件出错时不影响其他部分
class WidgetErrorBoundary extends Component {
  render() {
    if (this.state.hasError) {
      // 显示一个可折叠的小型错误卡片
      return (
        <Card collapsible>
          <CardHeader icon="warning">组件加载失败</CardHeader>
          <CardContent collapsed>
            <details>
              <summary>技术细节</summary>
              <code>{this.state.error?.message}</code>
            </details>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}
```

---

## 🌐 异步错误处理

### 1. 全局事件监听

```javascript
// index.js 或 App.js顶层
if (typeof window !== 'undefined') {
  // 捕获未处理的Promise rejection
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // 上报错误
    logError({
      type: 'unhandledrejection',
      reason: event.reason,
    });

    // 阻止默认控制台输出(可选)
    // event.preventDefault();
  });

  // 捕获全局JavaScript错误
  window.addEventListener('error', event => {
    console.error('Global error:', event.message);

    logError({
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // 捕获资源加载错误(图片、脚本等)
  window.addEventListener('error', event => {
    if (event.target !== window) {  // 区分资源加载错误
      console.error('Resource failed to load:', event.target.src || event.target.href);
      
      logError({
        type: 'resource_error',
        tagName: event.target.tagName,
        src: event.target.src || event.target.href,
      });

      // 可以显示一个替代内容或占位符
      showPlaceholder(event.target);
    }
  }, true);  // 使用capture阶段
}
```

### 2. 异步操作错误处理Hook

```jsx
import { useState, useCallback } from 'react';

// ✅ 通用的异步操作Hook
function useAsync(asyncFunction, immediate = false) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;  // 让调用者也能catch
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction]);

  // 重试机制
  const retry = useCallback(() => {
    setRetryCount(c => c + 1);
    execute();  // 重新执行上一次的操作
  }, [execute]);

  // 初始执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, retryCount]);

  return { data, error, isLoading, execute, retry };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, error, isLoading, retry } = useAsync(
    () => fetchUser(userId),
    true  // 组件挂载后立即执行
  );

  if (isLoading) return <UserSkeleton />;
  
  if (error) {
    return (
      <ErrorMessage
        title="无法加载用户信息"
        message={error.message}
        onRetry={retry}
        errorCode={error.status}
      />
    );
  }

  return <UserCard user={user} />;
}
```

### 3. 请求重试策略

```jsx
// ✅ 带指数退避的重试Hook
function useRetryableRequest(requestFn, options = {}) {
  const {
    maxRetries = 3,             // 最大重试次数
    baseDelay = 1000,           // 基础延迟(ms)
    maxDelay = 30000,           // 最大延迟(ms)
    retryCondition = (error) => {  // 自定义是否应该重试的条件
      // 默认只在网络错误或5xx时重试,不重试4xx
      return !error.response || error.response.status >= 500;
    },
  } = options;

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = useCallback(async (...args) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn(...args);
      } catch (error) {
        lastError = error;

        // 检查是否应该重试
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        // 计算延迟时间(指数退避+随机抖动)
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay
        ) * (0.8 + Math.random() * 0.4);  // ±20%抖动

        console.log(`Retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries})`);
        
        await sleep(delay);
      }
    }

    throw lastError;
  }, [requestFn, maxRetries, baseDelay, maxDelay, retryCondition]);

  return { executeWithRetry };
}

// 使用
function DataFetcher({ endpoint }) {
  const { executeWithRetry } = useRetryableRequest(
    (url) => fetch(url).then(res => res.json()),
    { maxRetries: 3, baseDelay: 1000 }
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    executeWithRetry(endpoint)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [endpoint, executeWithRetry]);

  if (loading) return <Loader />;
  if (error) return <ErrorDisplay error={error} />;
  return <DataView data={data} />;
}
```

---

## 📊 日志系统设计

### 1. 日志等级定义

```javascript
// utils/logger.js
const LOG_LEVELS = {
  DEBUG: 0,    // 调试信息,仅开发环境
  INFO: 1,     // 一般信息
  WARN: 2,     // 警告
  ERROR: 3,    // 错误
  FATAL: 4,    // 致命错误
};

const LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.FATAL]: 'FATAL',
};
```

### 2. 客户端Logger实现

```javascript
class Logger {
  constructor(options = {}) {
    this.level = options.level || LOG_LEVELS.INFO;
    this.remoteUrl = options.remoteUrl;  // 远程日志服务器地址
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 5000;  // ms
    this.queue = [];
    this.timer = null;
    
    // 用户标识
    this.userId = options.userId || null;
    this.sessionId = this.generateSessionId();
    
    // 启动定时发送
    if (this.remoteUrl) {
      this.startBatchFlush();
    }
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _log(level, message, context = {}) {
    if (level < this.level) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: LEVEL_NAMES[level],
      message: typeof message === 'string' ? message : message.message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // 控制台输出
    const consoleMethod = {
      [LOG_LEVELS.DEBUG]: 'debug',
      [LOG_LEVELS.INFO]: 'info',
      [LOG_LEVELS.WARN]: 'warn',
      [LOG_LEVELS.ERROR]: 'error',
      [LOG_LEVELS.FATAL]: 'error',
    }[level];

    console[consoleMethod](`[${entry.level}] ${entry.message}`, context);

    // 加入批量队列
    if (level >= LOG_LEVELS.ERROR && this.remoteUrl) {
      this.addToQueue(entry);
    }
  }

  addToQueue(entry) {
    this.queue.push(entry);

    if (this.queue.length >= this.batchSize) {
      this.flush();  // 达到批次大小立即发送
    }
  }

  startBatchFlush() {
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      // 使用sendBeacon确保即使页面关闭也能发送
      if (navigator.sendBeacon) {
        const data = JSON.stringify(batch);
        navigator.sendBeacon(this.remoteUrl, data);
      } else {
        // Fallback:普通fetch请求
        await fetch(this.remoteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
          keepalive: true,
        });
      }
    } catch (err) {
      // 发送失败,重新放回队列(但防止无限增长)
      if (this.queue.length < 50) {
        this.queue.unshift(...batch);
      }
      console.error('Failed to send logs:', err);
    }
  }

  debug(message, context) { this._log(LOG_LEVELS.DEBUG, message, context); }
  info(message, context) { this._log(LOG_LEVELS.INFO, message, context); }
  warn(message, context) { this._log(LOG_LEVELS.WARN, message, context); }
  error(message, context) { this._log(LOG_LEVELS.ERROR, message, context); }
  fatal(message, context) { this._log(LOG_LEVELS.FATAL, message, context); }

  // 设置用户上下文
  setUserId(userId) {
    this.userId = userId;
  }

  // 清理定时器
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.flush();  // 最后一次发送
    }
  }
}

// 创建全局实例
const logger = new Logger({
  level: process.env.NODE_ENV === 'development' 
    ? LOG_LEVELS.DEBUG 
    : LOG_LEVELS.INFO,
  remoteUrl: process.env.REACT_APP_LOG_ENDPOINT,
});

export default logger;
export { Logger, LOG_LEVELS };
```

### 3. 在React中使用Logger

```jsx
import logger from './utils/logger';

function DataFetchingComponent({ apiEndpoint }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        logger.debug('开始请求数据', { endpoint: apiEndpoint });
        
        const startTime = performance.now();
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const json = await response.json();
        const duration = performance.now() - startTime;

        if (!cancelled) {
          setData(json);
          logger.info('数据加载成功', { 
            endpoint: apiEndpoint, 
            duration: `${duration.toFixed(0)}ms`,
            recordCount: json.length,
          });
        }
      } catch (error) {
        if (!cancelled) {
          logger.error('数据加载失败', { 
            endpoint: apiEndpoint, 
            errorMessage: error.message,
          });
          
          // 可以根据错误类型做特殊处理
          if (error.message.includes('401')) {
            logger.warn('用户认证已过期,即将跳转到登录页');
            redirectToLogin();
          }
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [apiEndpoint]);

  // 性能监控
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          logger.info('LCP指标', { 
            value: entry.startTime,
            url: window.location.pathname,
          });
        }
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    
    return () => observer.disconnect();
  }, []);

  return data ? <DataView data={data} /> : null;
}
```

---

## 🔄 优雅降级与恢复

### 1. 功能降级策略

```jsx
// ✅ 渐进增强:核心功能优先,增强功能可选
function EnhancedFeature({ basicMode, featureFlags }) {
  const [enhancedFeatureAvailable, setEnhancedFeatureAvailable] = useState(true);

  return (
    <div>
      {/* 核心功能 - 始终可用 */}
      <BasicFunctionality />

      {/* 增强功能 - 可能因各种原因不可用 */}
      <ErrorBoundary
        fallback={
          <div className="degraded-mode">
            <p>高级功能暂不可用,正在使用基础模式</p>
            <button onClick={() => setEnhancedFeatureAvailable(true)}>
              尝试重新启用
            </button>
          </div>
        }
      >
        {enhancedFeatureAvailable && !basicMode && featureFlags.advanced && (
          <AdvancedFeatures />
        )}
      </ErrorBoundary>
    </div>
  );
}

// 具体场景:实时协作功能降级
function DocumentEditor({ docId }) {
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    // 监测WebSocket连接状态
    const ws = new WebSocket(`wss://api.example.com/ws/${docId}`);

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      logger.warn('WebSocket连接断开,切换到离线模式');
    };

    ws.onerror = () => {
      setRealtimeEnabled(false);  // 降级到轮询模式
      setConnectionStatus('error');
    };

    return () => ws.close();
  }, [docId]);

  return (
    <EditorContainer>
      <Toolbar>
        <SaveButton />
        
        {/* 连接状态指示器 */}
        <ConnectionIndicator status={connectionStatus}>
          {!realtimeEnabled && '(离线模式)'}
        </ConnectionIndicator>
      </Toolbar>

      <EditorCore />

      {/* 实时协作者光标 - 连接失败时隐藏 */}
      {realtimeEnabled && <CollaboratorCursors />}

      {/* 评论功能 - 即使连接断开也可以本地编辑 */}
      <CommentsPanel offlineSupport />
    </EditorContainer>
  );
}
```

### 2. 服务端降级响应

```javascript
// API层统一处理降级
async function fetchWithFallback(primaryUrl, fallbackUrls = [], options = {}) {
  let lastError;

  // 尝试主API
  try {
    return await fetchWithErrorHandling(primaryUrl, options);
  } catch (primaryError) {
    logger.warn('主API失败,尝试备用方案', { 
      primaryUrl, 
      error: primaryError.message,
    });
    lastError = primaryError;
  }

  // 尝试备用API
  for (const fallbackUrl of fallbackUrls) {
    try {
      logger.info('使用备用API', { url: fallbackUrl });
      return await fetchWithErrorHandling(fallbackUrl, options);
    } catch (fallbackError) {
      logger.warn('备用API也失败了', { url: fallbackUrl });
      lastError = fallbackError;
    }
  }

  // 所有方案都失败,返回缓存的旧数据
  try {
    const cached = localStorage.getItem(`cache:${primaryUrl}`);
    if (cached) {
      logger.info('使用缓存数据', { url: primaryUrl });
      return {
        ok: true,
        data: JSON.parse(cached),
        fromCache: true,
        cachedAt: localStorage.getItem(`cache_time:${primaryUrl}`),
      };
    }
  } catch (cacheError) {
    logger.error('读取缓存失败', cacheError);
  }

  // 最终抛出错误
  throw lastError;
}
```

### 3. 用户友好的错误展示

```jsx
// ✅ 错误组件集合
function ErrorMessage({ 
  error, 
  onRetry, 
  title = '出现了问题',
  showDetails = process.env.NODE_ENV === 'development',
}) {
  const isNetworkError = !navigator.onLine;
  const isTimeoutError = error.code === 'ECONNABORTED' || error.message.includes('timeout');
  const isAuthError = error.response?.status === 401;
  const isServerError = error.response?.status >= 500;

  let suggestion = '';
  let actionButton = null;

  if (isNetworkError) {
    suggestion = '请检查您的网络连接';
    actionButton = <button onClick={() => window.location.reload()}>刷新页面</button>;
  } else if (isTimeoutError) {
    suggestion = '服务器响应超时,请稍后再试';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  } else if (isAuthError) {
    suggestion = '您的登录已过期';
    actionButton = <button onClick={() => redirectToLogin()}>重新登录</button>;
  } else if (isServerError) {
    suggestion = '服务器遇到了问题,我们的工程师正在修复';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  } else {
    suggestion = '发生了未知错误';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  }

  return (
    <div className="error-message" role="alert">
      <div className="error-icon">
        {isNetworkError ? <WifiOffIcon /> : <AlertTriangleIcon />}
      </div>
      
      <h3 className="error-title">{title}</h3>
      <p className="error-suggestion">{suggestion}</p>

      {actionButton && <div className="error-action">{actionButton}</div>}

      {/* 技术详情 - 仅开发环境或用户主动展开时显示 */}
      {(showDetails || error.showDetails) && (
        <details className="error-details">
          <summary>技术详情</summary>
          <code>
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </details>
      )}

      {/* 反馈渠道 */}
      <a href={`mailto:support@example.com?subject=错误报告&body=错误信息: ${encodeURIComponent(error.message)}`}>
        问题仍未解决?联系我们
      </a>
    </div>
  );
}
```

---

## 🛠️ 集成第三方监控服务

### Sentry集成

```bash
npm install @sentry/react
```

```javascript
// sentry.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 设置采样率
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // 错误采样率(生产环境降低成本)
  sampleRate: 1.0,

  // 过滤掉已知但不严重的错误
  beforeSend(event) {
    // 忽略由浏览器扩展引起的错误
    if (event.exception?.values?.[0]?.stacktrace?.frames?.[0]?.filename?.includes('extensions')) {
      return null;
    }

    // 忽略第三方脚本错误
    const thirdPartyDomains = ['analytics.google.com', 'cdn.example.com'];
    if (thirdPartyDomains.some(domain => event.request?.url?.includes(domain))) {
      return null;
    }

    return event;
  },

  // 附加自定义上下文
  initialScope: {
    tags: {
      component: 'react-app',
      version: process.env.APP_VERSION,
    },
    user: {
      id: getCurrentUserId(),
      segment: getUserSegment(),
    },
  },

  // React集成:自动捕获渲染错误
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      sessionSampleRate: 0.01,  // 1%的用户录制会话用于调试
      errorSampleRate: 1.0,     // 所有错误的会话都录制
    }),
  ],
});

// 创建Sentry Error Boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary;
```

```jsx
// App.js
import { SentryErrorBoundary } from './sentry';

function App() {
  return (
    <SentryErrorBoundary fallback={<GlobalErrorFallback />}>
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </SentryErrorBoundary>
  );
}

// 手动上报错误
import * as Sentry from "@sentry/react";

try {
  riskyOperation();
} catch (error) {
  // 附加额外信息
  Sentry.captureException(error, {
    tags: {
      feature: 'checkout',
      step: 'payment-processing',
    },
    extra: {
      cartId: cart.id,
      itemCount: cart.items.length,
    },
  });

  // 显示用户友好提示
  showErrorToast('支付处理出现问题,请稍后再试');
}
```

---

## 📋 最佳实践总结

### 错误处理原则
1. **预期错误要优雅**: 展示清晰的信息和解决方案
2. **未预期错误要隔离**: 用Error Boundary限制影响范围
3. **关键路径要有重试**: 网络请求、关键操作应支持重试
4. **所有错误都要记录**: 方便后续排查和分析
5. **不要暴露敏感信息**: 生产环境的错误详情要对用户隐藏

### 日志规范
- **结构化输出**: 使用JSON格式便于查询分析
- **分级记录**: DEBUG/INFO/WARN ERROR/FATAL
- **添加上下文**: 包含用户ID、操作、参数等
- **控制体积**: 生产环境适当采样,避免过多
- **保护隐私**: 不要记录密码、Token等敏感数据

### 团队协作
- 建立错误告警机制(FATAL级别立即通知)
- 定期审查高频错误并优化
- 制定错误响应SLA(Service Level Agreement)
- 编写错误处理的Code Review Checklist

---

## 📝 练习任务

### 任务1:构建完整的错误处理体系
为一个中等规模的项目添加:
1. 分级的Error Boundary(全局/页面/组件)
2. 全局异步错误监听
3. 带重试的数据获取Hook
4. 友好的错误展示组件库
5. 集成Sentry或其他监控服务

### 任务2:实现离线优先架构
参考Service Worker和IndexedDB,实现:
1. 网络正常时实时同步
2. 网络中断时自动切换到离线模式
3. 操作排队,网络恢复后自动提交
4. 清晰的状态指示(在线/同步中/离线)
5. 冲突解决策略

### 任务3:搭建日志分析Dashboard
创建一个可视化的错误日志查看界面:
1. 按时间、类型、频率筛选错误
2. 错误趋势图表
3. 影响用户数统计
4. 快速定位到源码位置
5. 错误解决状态跟踪(类似GitHub Issues)

---

## 🔗 相关资源

- [React官方文档 - Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry React文档](https://docs.sentry.io/platforms/react/)
- [react-error-boundary库](https://github.com/bvaughn/react-error-boundary)
- [Web Dev Errors API](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent)
- [MDN: Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)

---

[← 24 - 国际化](../24-i18n/) | [→ 26 - React内部原理](../26-internals/)
