# 25 - 错误处理与日志系统

> **学习建议：** 如果你是完全的新手，建议先学完前面的章节再来学习本章。本章涉及一些高级概念，但我们会用生活中的例子来帮助理解。

---

## 🎯 本节目标
- 构建健壮的错误处理机制
- 实现完善的日志收集与分析系统
- 学会优雅地降级和恢复

---

## 💡 先用一个故事来理解

想象你开了一家**大型购物中心**（这就是你的 React 应用）：

- **错误边界（Error Boundary）** 就像是每个楼层的安全门 —— 如果某个店铺着火了（某个组件出错了），安全门会关上，防止火势蔓延到其他楼层，但其他楼层照常营业。
- **日志系统** 就像是购物中心的**监控摄像头和记录本** —— 每次发生异常事件（有人摔倒、设备故障），都会被记录下来，方便事后分析。
- **优雅降级** 就像是当电梯坏了的时候，商场会贴出告示引导你走楼梯，而不是让整个商场关门。

---

## 📖 错误类型分类

### 1. 可预期的错误

**是什么：** 我们能提前想到、并且在代码中已经做好处理准备的错误。

**为什么需要关注：** 这些错误是"正常"的业务场景，需要给用户友好的提示。

**现实类比：** 就像你知道今天可能会下雨，所以出门带了伞。

| 错误类型 | 例子 | 处理方式 |
|---------|------|---------|
| 表单验证失败 | 用户没填必填项 | 红色提示"请填写此项" |
| 网络请求超时 | 接口3秒没响应 | "网络较慢，请重试" |
| 用户权限不足 | 普通用户访问管理页 | "您没有权限" |
| 数据格式异常 | 接口返回了空数据 | 显示"暂无数据" |

```jsx
// ✅ 可预期错误的处理示例
function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // 预期错误1：空值检查
    if (!email.trim()) {
      setError('请输入邮箱地址'); // 友好提示
      return;                     // 阻止继续执行
    }

    // 预期错误2：格式检查
    if (!email.includes('@')) {
      setError('邮箱格式不正确');
      return;
    }

    // 预期错误3：网络请求
    fetch('/api/login', { /* ... */ })
      .then(res => {
        if (res.status === 401) {
          // 预期错误：密码错误
          setError('邮箱或密码错误');
        } else if (res.status === 429) {
          // 预期错误：请求过多
          setError('请求过于频繁，请稍后再试');
        }
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(''); }}
        placeholder="请输入邮箱"
      />
      {/* 错误提示 —— 给用户看的 */}
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
      <button type="submit">登录</button>
    </form>
  );
}
```

### 2. 不可预期的错误

**是什么：** 开发者没有预料到的、代码本身出 bug 导致的错误。

**为什么需要关注：** 这些错误如果不管，整个页面可能会白屏（变成一片空白），用户体验极差。

**现实类比：** 就像突然地震了，你没想到但必须要有应急方案。

| 错误类型 | 例子 | 后果 |
|---------|------|------|
| JavaScript运行时错误 | 调用了 `undefined` 的方法 | 页面白屏 |
| 第三方库抛出的异常 | 图表库传入空数据崩溃 | 模块不可用 |
| 内存溢出 | 加载了超大图片 | 浏览器卡死 |
| 未捕获的Promise rejection | 接口报错但没写 `.catch()` | 静默失败 |

```jsx
// ❌ 不可预期错误的例子（这些会导致页面崩溃）
function BrokenComponent({ user }) {
  // 如果 user 是 undefined，下面这行会报错！
  // TypeError: Cannot read properties of undefined (reading 'name')
  return <h1>欢迎, {user.name}</h1>;
}

// ✅ 加上防御性编程来避免
function SafeComponent({ user }) {
  // 先判断 user 是否存在
  if (!user) {
    return <h1>欢迎, 游客</h1>;
  }
  return <h1>欢迎, {user.name}</h1>;
}
```

### 3. 外部依赖故障

**是什么：** 不是你代码的问题，而是外部服务出问题了。

**为什么需要关注：** 用户不关心是谁的问题，他们只关心"能不能用"。

**现实类比：** 你在餐厅点了一份牛排，但厨房的煤气停了 —— 不是你的错，但你需要告诉客人并提供替代方案。

| 故障类型 | 例子 | 处理方案 |
|---------|------|---------|
| API服务不可用 | 服务器宕机 | 显示缓存数据 |
| CDN资源加载失败 | 第三方字体/图片挂了 | 使用本地备用资源 |
| 第三方脚本错误 | 广告SDK报错 | 隔离错误，不影响主功能 |

---

## 🛡️ React 错误边界（Error Boundary）

### 是什么？

Error Boundary 是 React 提供的一种**组件级别的错误捕获机制**。当子组件树中的任何地方抛出 JavaScript 错误时，Error Boundary 可以"接住"这个错误，显示备用 UI，而不是让整个应用崩溃。

### 为什么需要它？

**不用 Error Boundary 的情况：**

```
你的应用
├── 导航栏
├── 主内容区
│   ├── 用户资料卡片 ← 这个组件报错了！
│   └── 文章列表
└── 页脚

结果：整个页面白屏 💀 用户什么都看不到了
```

**用 Error Boundary 的情况：**

```
你的应用
├── 导航栏          ← 正常显示 ✅
├── 错误边界
│   ├── 用户资料卡片 ← 这个组件报错了
│   └── 文章列表
└── 页脚            ← 正常显示 ✅

结果：用户资料卡片区域显示"出了点问题，点击重试"
      其他部分完全不受影响 ✅
```

### 怎么用？

#### 基础 Error Boundary

```jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    // 初始状态：没有错误
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // 这个方法在子组件抛出错误时被调用
  // 它的作用是更新 state，让下一次渲染显示降级 UI
  static getDerivedStateFromError(error) {
    // 返回新的 state 对象
    return { hasError: true };
  }

  // 这个方法在错误被捕获后调用
  // 它的作用是记录错误信息（比如发送到日志服务器）
  componentDidCatch(error, errorInfo) {
    // 把错误信息和组件堆栈保存到 state（开发环境用）
    this.setState({ error, errorInfo });

    // 发送错误到日志服务（生产环境用）
    logErrorToService(error, errorInfo);
  }

  // 重置错误状态，尝试重新渲染子组件
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });

    // 如果传入了 onReset 回调，执行它
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    // 如果有错误，显示降级 UI
    if (this.state.hasError) {
      // 优先使用自定义的 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认的降级 UI
      return (
        <div className="error-fallback" role="alert">
          <h2>出了点问题 😅</h2>
          <p>抱歉，页面遇到了意外错误。我们已经记录了这个问题。</p>

          {/* 只在开发环境显示错误详情，生产环境对用户隐藏 */}
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
              <summary>错误详情（仅开发环境）</summary>
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

    // 没有错误，正常渲染子组件
    return this.props.children;
  }
}

// ✅ 使用示例：用 ErrorBoundary 包裹可能有问题的组件
function App() {
  return (
    <ErrorBoundary>
      <Header />
      {/* 给主内容区单独包一个 Error Boundary，实现分级保护 */}
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
```

#### 函数式 Error Boundary Hook（实验性）

> **注意：** 目前 React 还没有原生的 Hook 版本的 Error Boundary，但可以使用社区库 `react-error-boundary`。

```bash
npm install react-error-boundary
```

```jsx
import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// 定义错误时的备用 UI 组件
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" style={{ padding: 20, border: '1px solid red' }}>
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
      FallbackComponent={ErrorFallback}   // 自定义错误 UI
      onReset={() => window.location.reload()}  // 重置时刷新页面
      resetKeys={['someKey']}             // 当这些值变化时自动重置
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### 分级错误处理

**是什么：** 根据错误发生的层级（全局、页面、组件），提供不同粒度的错误保护。

**为什么：** 就像医院有分诊系统 —— 轻伤在门诊处理，重伤送急诊室，不同的错误需要不同的处理方式。

```jsx
// 全局错误边界 —— 捕获任何未处理的错误，显示全屏错误页
class GlobalErrorBoundary extends Component {
  state = { eventId: null };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 上报严重错误到监控平台（如 Sentry）
    const eventId = captureException(error, { contexts: { react: errorInfo } });
    this.setState({ eventId });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="global-error" style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100vh', textAlign: 'center'
        }}>
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

// 页面级别错误边界 —— 整个页面出错时，保留导航栏，只替换内容区
class PageErrorBoundary extends Component {
  // ... 类似上面的实现
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

// 组件级别错误边界 —— 小组件出错时只影响那个小组件
class WidgetErrorBoundary extends Component {
  render() {
    if (this.state.hasError) {
      // 显示一个可折叠的小型错误卡片
      return (
        <div style={{ border: '1px solid #f59e0b', padding: 16, borderRadius: 8 }}>
          <h4>⚠️ 组件加载失败</h4>
          <details>
            <summary style={{ cursor: 'pointer' }}>技术细节</summary>
            <code>{this.state.error?.message}</code>
          </details>
          <button onClick={() => this.handleReset()} style={{ marginTop: 8 }}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ 组合使用 —— 像套娃一样层层保护
function App() {
  return (
    <GlobalErrorBoundary>
      <Header />
      <Routes>
        <Route path="/dashboard" element={
          <PageErrorBoundary>
            <DashboardPage />
          </PageErrorBoundary>
        } />
        <Route path="/settings" element={
          <PageErrorBoundary>
            <SettingsPage />
          </PageErrorBoundary>
        } />
      </Routes>
    </GlobalErrorBoundary>
  );
}
```

### 常见错误

| 错误 | 正确做法 |
|------|---------|
| 以为 Error Boundary 能捕获事件处理函数中的错误 | ❌ 不行！Error Boundary 只能捕获渲染阶段的错误 |
| 以为 Error Boundary 能捕获异步代码的错误 | ❌ 不行！需要用 try/catch 或 .catch() |
| 在函数组件中直接写错误边界逻辑 | ❌ 必须用 class 组件，或用 `react-error-boundary` 库 |

### 最佳实践

- ✅ 在应用的顶层至少放一个全局 Error Boundary
- ✅ 对每个独立的功能模块放一个页面级 Error Boundary
- ✅ 对可能出错的第三方组件包一个组件级 Error Boundary
- ✅ 在生产环境隐藏错误的技术细节，避免泄露代码信息
- ✅ 提供重试按钮，让用户可以自己尝试恢复

---

## 🌐 异步错误处理

### 是什么？

在 React 中，Error Boundary 只能捕获**渲染阶段**的错误。但很多错误发生在**异步操作**中（比如网络请求、定时器），这些错误 Error Boundary 抓不到，需要额外的处理方式。

### 为什么需要？

```jsx
// ❌ 这种错误 Error Boundary 抓不到！
function UserProfile() {
  useEffect(() => {
    fetch('/api/user')           // 网络请求是异步的
      .then(res => res.json())   // 可能会失败
      .then(data => {
        // 如果 data 结构不对，这里可能报错
        setUser(data.name);      // TypeError: Cannot read property 'name' of undefined
      });
    // 没有 .catch() → 错误被"吞掉"了，静默失败
  }, []);

  return <div>{user}</div>;
}
```

### 怎么用？

#### 1. 全局事件监听

**是什么：** 在应用的入口处监听浏览器级别的错误事件，作为"最后一道防线"。

**类比：** 就像大楼的消防报警系统 —— 不管哪个房间出了问题，都能被检测到。

```javascript
// index.js 或 App.js 顶层
if (typeof window !== 'undefined') {
  // 捕获未处理的 Promise rejection
  // 比如：fetch().then() 链中没有写 .catch() 时触发的错误
  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);

    // 上报错误到日志服务
    logError({
      type: 'unhandledrejection',
      reason: event.reason,
    });

    // 可选：阻止默认的控制台红色报错
    // event.preventDefault();
  });

  // 捕获全局 JavaScript 错误
  // 比如：某个脚本抛出了未被 try/catch 捕获的错误
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

  // 捕获资源加载错误（图片、脚本等加载失败）
  window.addEventListener('error', event => {
    if (event.target !== window) {  // 区分资源加载错误和普通JS错误
      console.error('Resource failed to load:', event.target.src || event.target.href);

      logError({
        type: 'resource_error',
        tagName: event.target.tagName,
        src: event.target.src || event.target.href,
      });

      // 可以显示一个替代内容或占位符
      showPlaceholder(event.target);
    }
  }, true);  // 使用 capture 阶段，确保能捕获到资源错误
}
```

#### 2. 异步操作错误处理 Hook

**是什么：** 把异步操作的通用逻辑（loading、error、data、retry）封装成一个可复用的 Hook。

**类比：** 就像你雇了一个助手，你只管告诉他"去帮我拿那个文件"，至于中间网络断了怎么办、超时了怎么办，他都帮你处理好了。

```jsx
import { useState, useCallback, useEffect } from 'react';

// ✅ 通用的异步操作 Hook
function useAsync(asyncFunction, immediate = false) {
  const [data, setData] = useState(null);       // 请求到的数据
  const [error, setError] = useState(null);      // 错误信息
  const [isLoading, setIsLoading] = useState(immediate); // 是否正在加载
  const [retryCount, setRetryCount] = useState(0);       // 重试次数

  // 执行异步操作的函数
  const execute = useCallback(async (...args) => {
    setIsLoading(true);  // 开始加载
    setError(null);      // 清除之前的错误

    try {
      const result = await asyncFunction(...args); // 执行异步函数
      setData(result);  // 保存结果
      return result;
    } catch (err) {
      setError(err);    // 保存错误
      throw err;        // 让调用者也能 catch
    } finally {
      setIsLoading(false); // 无论成功失败，都结束加载状态
    }
  }, [asyncFunction]);

  // 重试机制
  const retry = useCallback(() => {
    setRetryCount(c => c + 1);  // 增加重试计数
    execute();                    // 重新执行
  }, [execute]);

  // 如果 immediate 为 true，组件挂载后立即执行
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, retryCount]);

  return { data, error, isLoading, execute, retry };
}

// ✅ 使用示例：获取用户信息
function UserProfile({ userId }) {
  const { data: user, error, isLoading, retry } = useAsync(
    () => fetchUser(userId),  // 传入异步函数
    true                       // 组件挂载后立即执行
  );

  // 加载中 → 显示骨架屏
  if (isLoading) return <UserSkeleton />;

  // 出错了 → 显示错误信息 + 重试按钮
  if (error) {
    return (
      <div>
        <p>❌ 无法加载用户信息: {error.message}</p>
        <button onClick={retry}>🔄 重试</button>
      </div>
    );
  }

  // 成功 → 显示用户卡片
  return <UserCard user={user} />;
}
```

#### 3. 请求重试策略

**是什么：** 当网络请求失败时，不是立即放弃，而是自动重试几次（间隔逐渐增大），提高成功率。

**类比：** 就像你给朋友打电话没接，你会等一会儿再打第二次、第三次，而不是打一次没接就放弃。

```jsx
// ✅ 带指数退避的重试 Hook
function useRetryableRequest(requestFn, options = {}) {
  const {
    maxRetries = 3,             // 最大重试次数
    baseDelay = 1000,           // 基础延迟（毫秒）
    maxDelay = 30000,           // 最大延迟（毫秒）
    retryCondition = (error) => {  // 自定义是否应该重试的条件
      // 默认只在网络错误或5xx服务器错误时重试，不重试4xx客户端错误
      return !error.response || error.response.status >= 500;
    },
  } = options;

  // 延迟函数：等待指定毫秒数
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 带重试的执行函数
  const executeWithRetry = useCallback(async (...args) => {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn(...args);  // 尝试执行请求
      } catch (error) {
        lastError = error;

        // 检查是否应该重试
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;  // 达到最大重试次数或不符合重试条件，抛出错误
        }

        // 计算延迟时间（指数退避 + 随机抖动）
        // 第1次等1秒，第2次等2秒，第3次等4秒...（但不超过30秒）
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt),
          maxDelay
        ) * (0.8 + Math.random() * 0.4);  // ±20%的随机抖动，避免所有客户端同时重试

        console.log(`Retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries})`);

        await sleep(delay);  // 等待
      }
    }

    throw lastError;
  }, [requestFn, maxRetries, baseDelay, maxDelay, retryCondition]);

  return { executeWithRetry };
}

// 使用示例
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

### 是什么？

日志系统就像应用的"黑匣子记录仪" —— 记录应用运行过程中发生的所有重要事件，方便开发者事后分析和排查问题。

### 为什么需要？

想象你是一个外卖平台的技术负责人：
- 用户投诉"下不了单"，你怎么知道是什么原因？
- 如果有日志系统，你查一下日志就能发现："哦，支付接口在第3次重试后成功了，但用户已经关了页面"
- 没有日志系统？你只能猜。

### 怎么用？

#### 1. 日志等级定义

**是什么：** 给日志分等级，就像医院的分诊系统 —— 有的轻微（DEBUG），有的严重（FATAL）。

```javascript
// utils/logger.js
const LOG_LEVELS = {
  DEBUG: 0,    // 调试信息：仅在开发环境使用，记录详细的执行过程
  INFO: 1,     // 一般信息：记录正常的操作，如"用户登录成功"
  WARN: 2,     // 警告：不是错误但值得注意，如"接口响应较慢(3.5s)"
  ERROR: 3,    // 错误：功能受到影响，如"获取用户数据失败"
  FATAL: 4,    // 致命错误：整个应用不可用，如"全局状态初始化失败"
};

// 用于在日志中显示等级名称
const LEVEL_NAMES = {
  [LOG_LEVELS.DEBUG]: 'DEBUG',
  [LOG_LEVELS.INFO]: 'INFO',
  [LOG_LEVELS.WARN]: 'WARN',
  [LOG_LEVELS.ERROR]: 'ERROR',
  [LOG_LEVELS.FATAL]: 'FATAL',
};
```

#### 2. 客户端 Logger 实现

```javascript
class Logger {
  constructor(options = {}) {
    this.level = options.level || LOG_LEVELS.INFO;  // 最低日志等级
    this.remoteUrl = options.remoteUrl;              // 远程日志服务器地址
    this.batchSize = options.batchSize || 10;        // 批量发送的条数
    this.flushInterval = options.flushInterval || 5000;  // 定时发送间隔（毫秒）
    this.queue = [];       // 待发送的日志队列
    this.timer = null;     // 定时器引用

    // 用户标识（用于追踪某个用户的所有操作）
    this.userId = options.userId || null;
    this.sessionId = this.generateSessionId();  // 会话ID

    // 启动定时批量发送
    if (this.remoteUrl) {
      this.startBatchFlush();
    }
  }

  // 生成唯一的会话ID
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 内部日志方法（所有 debug/info/warn/error/fatal 最终都调用这个）
  _log(level, message, context = {}) {
    // 如果日志等级低于设定的最低等级，直接忽略
    if (level < this.level) return;

    // 构建日志条目
    const entry = {
      timestamp: new Date().toISOString(),       // 时间戳
      level: LEVEL_NAMES[level],                  // 等级名称
      message: typeof message === 'string' ? message : message.message,  // 消息
      context,                                    // 附加上下文信息
      userId: this.userId,                        // 用户ID
      sessionId: this.sessionId,                  // 会话ID
      url: typeof window !== 'undefined' ? window.location.href : '',  // 当前URL
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '', // 浏览器信息
    };

    // 在浏览器控制台输出
    const consoleMethod = {
      [LOG_LEVELS.DEBUG]: 'debug',
      [LOG_LEVELS.INFO]: 'info',
      [LOG_LEVELS.WARN]: 'warn',
      [LOG_LEVELS.ERROR]: 'error',
      [LOG_LEVELS.FATAL]: 'error',
    }[level];

    console[consoleMethod](`[${entry.level}] ${entry.message}`, context);

    // ERROR 和 FATAL 级别的日志加入发送队列
    if (level >= LOG_LEVELS.ERROR && this.remoteUrl) {
      this.addToQueue(entry);
    }
  }

  // 加入批量发送队列
  addToQueue(entry) {
    this.queue.push(entry);

    // 如果队列满了，立即发送
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  // 启动定时发送
  startBatchFlush() {
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();  // 有日志就发送
      }
    }, this.flushInterval);
  }

  // 发送日志到服务器
  async flush() {
    if (this.queue.length === 0) return;

    // 取出当前队列中的所有日志
    const batch = [...this.queue];
    this.queue = [];  // 清空队列

    try {
      // 使用 sendBeacon 确保即使页面关闭也能发送
      if (navigator.sendBeacon) {
        const data = JSON.stringify(batch);
        navigator.sendBeacon(this.remoteUrl, data);
      } else {
        // 降级方案：普通 fetch 请求
        await fetch(this.remoteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
          keepalive: true,  // 允许在页面关闭后继续发送
        });
      }
    } catch (err) {
      // 发送失败，重新放回队列（但限制大小，防止内存泄漏）
      if (this.queue.length < 50) {
        this.queue.unshift(...batch);
      }
      console.error('Failed to send logs:', err);
    }
  }

  // 对外的日志方法
  debug(message, context) { this._log(LOG_LEVELS.DEBUG, message, context); }
  info(message, context) { this._log(LOG_LEVELS.INFO, message, context); }
  warn(message, context) { this._log(LOG_LEVELS.WARN, message, context); }
  error(message, context) { this._log(LOG_LEVELS.ERROR, message, context); }
  fatal(message, context) { this._log(LOG_LEVELS.FATAL, message, context); }

  // 设置用户ID（用户登录后调用）
  setUserId(userId) {
    this.userId = userId;
  }

  // 清理定时器（组件卸载时调用）
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.flush();  // 最后一次发送
    }
  }
}

// 创建全局 Logger 实例
const logger = new Logger({
  // 开发环境显示所有日志，生产环境只显示 INFO 及以上
  level: process.env.NODE_ENV === 'development'
    ? LOG_LEVELS.DEBUG
    : LOG_LEVELS.INFO,
  remoteUrl: process.env.REACT_APP_LOG_ENDPOINT,
});

export default logger;
export { Logger, LOG_LEVELS };
```

#### 3. 在 React 中使用 Logger

```jsx
import logger from './utils/logger';
import { useState, useEffect } from 'react';

function DataFetchingComponent({ apiEndpoint }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;  // 用于取消过时的请求

    async function loadData() {
      try {
        // 记录调试信息：开始请求
        logger.debug('开始请求数据', { endpoint: apiEndpoint });

        const startTime = performance.now();  // 记录开始时间
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        const duration = performance.now() - startTime;  // 计算耗时

        if (!cancelled) {
          setData(json);
          // 记录成功信息：数据加载完成
          logger.info('数据加载成功', {
            endpoint: apiEndpoint,
            duration: `${duration.toFixed(0)}ms`,
            recordCount: json.length,
          });
        }
      } catch (error) {
        if (!cancelled) {
          // 记录错误信息
          logger.error('数据加载失败', {
            endpoint: apiEndpoint,
            errorMessage: error.message,
          });

          // 根据错误类型做特殊处理
          if (error.message.includes('401')) {
            logger.warn('用户认证已过期，即将跳转到登录页');
            redirectToLogin();
          }
        }
      }
    }

    loadData();

    // 清理函数：如果组件卸载了，取消请求
    return () => {
      cancelled = true;
    };
  }, [apiEndpoint]);

  // 性能监控：记录 LCP（最大内容绘制）指标
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

### 是什么？

**优雅降级（Graceful Degradation）** 是指当某些功能不可用时，应用能自动切换到简单但可用的模式，而不是完全崩溃。

**类比：** 就像智能灯泡没电了会变暗但不会灭，而不是直接黑掉。

### 为什么需要？

- 没有任何应用是 100% 可靠的
- 与其让用户看到白屏，不如给一个降级体验
- 用户可以继续使用核心功能，而不是什么都做不了

### 怎么用？

#### 1. 功能降级策略

```jsx
// ✅ 渐进增强：核心功能优先，增强功能可选
function EnhancedFeature({ basicMode, featureFlags }) {
  const [enhancedFeatureAvailable, setEnhancedFeatureAvailable] = useState(true);

  return (
    <div>
      {/* 核心功能 —— 始终可用 */}
      <BasicFunctionality />

      {/* 增强功能 —— 可能因各种原因不可用 */}
      <ErrorBoundary
        fallback={
          <div className="degraded-mode" style={{
            padding: 16, background: '#fef3c7', borderRadius: 8
          }}>
            <p>⚡ 高级功能暂不可用，正在使用基础模式</p>
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

// 具体场景：实时协作功能的降级
function DocumentEditor({ docId }) {
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  useEffect(() => {
    // 建立 WebSocket 连接
    const ws = new WebSocket(`wss://api.example.com/ws/${docId}`);

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      logger.warn('WebSocket 连接断开，切换到离线模式');
    };
    ws.onerror = () => {
      setRealtimeEnabled(false);  // 降级到离线模式
      setConnectionStatus('error');
    };

    return () => ws.close();
  }, [docId]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        <button>💾 保存</button>

        {/* 连接状态指示器 */}
        <span style={{
          color: connectionStatus === 'connected' ? 'green' :
                 connectionStatus === 'disconnected' ? 'orange' : 'red'
        }}>
          {connectionStatus === 'connected' ? '🟢 在线' :
           connectionStatus === 'disconnected' ? '🟡 断线' : '🔴 连接错误'}
          {!realtimeEnabled && '（离线模式）'}
        </span>
      </div>

      <textarea placeholder="编辑文档..." />

      {/* 实时协作者光标 —— 连接失败时隐藏 */}
      {realtimeEnabled && <CollaboratorCursors />}

      {/* 评论功能 —— 即使断开连接也可以本地编辑 */}
      <CommentsPanel offlineSupport />
    </div>
  );
}
```

#### 2. 服务端降级响应

```javascript
// API 层统一处理降级
async function fetchWithFallback(primaryUrl, fallbackUrls = [], options = {}) {
  let lastError;

  // 第1步：尝试主 API
  try {
    return await fetchWithErrorHandling(primaryUrl, options);
  } catch (primaryError) {
    logger.warn('主API失败，尝试备用方案', {
      primaryUrl,
      error: primaryError.message,
    });
    lastError = primaryError;
  }

  // 第2步：尝试备用 API
  for (const fallbackUrl of fallbackUrls) {
    try {
      logger.info('使用备用API', { url: fallbackUrl });
      return await fetchWithErrorHandling(fallbackUrl, options);
    } catch (fallbackError) {
      logger.warn('备用API也失败了', { url: fallbackUrl });
      lastError = fallbackError;
    }
  }

  // 第3步：所有 API 都失败，返回缓存数据
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

  // 第4步：彻底失败，抛出最后一个错误
  throw lastError;
}
```

#### 3. 用户友好的错误展示

```jsx
// ✅ 错误组件集合 —— 根据不同错误类型显示不同的提示
function ErrorMessage({
  error,
  onRetry,
  title = '出现了问题',
  showDetails = process.env.NODE_ENV === 'development',
}) {
  // 判断错误类型
  const isNetworkError = !navigator.onLine;                                    // 网络断开
  const isTimeoutError = error.code === 'ECONNABORTED' || error.message.includes('timeout');  // 超时
  const isAuthError = error.response?.status === 401;                          // 认证失败
  const isServerError = error.response?.status >= 500;                         // 服务器错误

  // 根据错误类型给出不同的建议和操作按钮
  let suggestion = '';
  let actionButton = null;

  if (isNetworkError) {
    suggestion = '请检查您的网络连接';
    actionButton = <button onClick={() => window.location.reload()}>刷新页面</button>;
  } else if (isTimeoutError) {
    suggestion = '服务器响应超时，请稍后再试';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  } else if (isAuthError) {
    suggestion = '您的登录已过期';
    actionButton = <button onClick={() => redirectToLogin()}>重新登录</button>;
  } else if (isServerError) {
    suggestion = '服务器遇到了问题，我们的工程师正在修复';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  } else {
    suggestion = '发生了未知错误';
    actionButton = onRetry && <button onClick={onRetry}>重试</button>;
  }

  return (
    <div className="error-message" role="alert" style={{
      padding: 24, textAlign: 'center', maxWidth: 400, margin: '40px auto'
    }}>
      {/* 错误图标 */}
      <div style={{ fontSize: 48 }}>
        {isNetworkError ? '📡' : '⚠️'}
      </div>

      <h3>{title}</h3>
      <p style={{ color: '#666' }}>{suggestion}</p>

      {/* 操作按钮 */}
      {actionButton && <div style={{ marginTop: 16 }}>{actionButton}</div>}

      {/* 技术详情 —— 仅开发环境或用户主动展开时显示 */}
      {(showDetails || error.showDetails) && (
        <details style={{ marginTop: 16, textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer' }}>技术详情</summary>
          <code style={{ display: 'block', padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </details>
      )}

      {/* 反馈渠道 */}
      <a href={`mailto:support@example.com?subject=错误报告&body=错误信息: ${encodeURIComponent(error.message)}`}>
        问题仍未解决？联系我们
      </a>
    </div>
  );
}
```

---

## 🛠️ 集成第三方监控服务

### 是什么？

Sentry 是一个**错误监控平台**，可以自动捕获你应用中的所有错误，帮你追踪、分析、修复。

**类比：** 就像你雇了一个"夜班保安"，24小时盯着你的应用，一旦出问题就立刻通知你。

### 为什么需要？

- 生产环境的错误你看不到（用户的浏览器控制台你看不到）
- Sentry 可以告诉你：哪个用户遇到了什么错误、在哪个页面、用的什么浏览器
- 支持错误分组、趋势分析、告警通知

### 怎么用？

```bash
npm install @sentry/react
```

```javascript
// sentry.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,  // Sentry 项目地址
  environment: process.env.NODE_ENV,       // 环境标识（dev/staging/prod）

  // 设置采样率（控制上报比例，降低成本）
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  sampleRate: 1.0,

  // 过滤掉不值得关注的错误
  beforeSend(event) {
    // 忽略浏览器扩展引起的错误
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

  // 附加自定义上下文（方便排查）
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

  // React 集成：自动捕获渲染错误
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      sessionSampleRate: 0.01,  // 1% 的用户录制会话用于调试
      errorSampleRate: 1.0,     // 所有错误的会话都录制
    }),
  ],
});

// 导出 Sentry 的 Error Boundary
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

// 手动上报错误（在特定场景使用）
import * as Sentry from "@sentry/react";

try {
  riskyOperation();
} catch (error) {
  // 附加额外信息，方便排查
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
  showErrorToast('支付处理出现问题，请稍后再试');
}
```

---

## 📋 最佳实践总结

### 错误处理原则

| 原则 | 说明 | 类比 |
|------|------|------|
| **预期错误要优雅** | 展示清晰的信息和解决方案 | 就像餐厅菜单上标注"微辣" |
| **未预期错误要隔离** | 用 Error Boundary 限制影响范围 | 就像防火门隔离火势 |
| **关键路径要有重试** | 网络请求、关键操作应支持重试 | 就像支付失败可以重新支付 |
| **所有错误都要记录** | 方便后续排查和分析 | 就像行车记录仪记录全程 |
| **不要暴露敏感信息** | 生产环境对用户隐藏技术细节 | 不要把内部邮件给客户看 |

### 日志规范

- **结构化输出**：使用 JSON 格式便于查询分析
- **分级记录**：DEBUG/INFO/WARN/ERROR/FATAL
- **添加上下文**：包含用户ID、操作、参数等
- **控制体积**：生产环境适当采样，避免日志太多
- **保护隐私**：不要记录密码、Token 等敏感数据

### 团队协作

- 建立错误告警机制（FATAL 级别立即通知）
- 定期审查高频错误并优化
- 制定错误响应 SLA（Service Level Agreement）
- 编写错误处理的 Code Review Checklist

---

## 📝 练习题

### 练习1：构建完整的错误处理体系（基础题）

为一个 Todo 应用添加错误处理：
1. 写一个简单的 Error Boundary 组件
2. 给"添加 Todo"的表单加上输入验证
3. 写一个 `useAsync` Hook 来处理获取 Todo 列表的请求
4. 在网络断开时显示"离线模式"提示

### 练习2：实现离线优先架构（进阶题）

参考 Service Worker 和 IndexedDB，实现：
1. 网络正常时实时同步
2. 网络中断时自动切换到离线模式
3. 操作排队，网络恢复后自动提交
4. 清晰的状态指示（在线/同步中/离线）
5. 冲突解决策略

### 练习3：搭建日志分析 Dashboard（高级题）

创建一个可视化的错误日志查看界面：
1. 按时间、类型、频率筛选错误
2. 错误趋势图表
3. 影响用户数统计
4. 快速定位到源码位置
5. 错误解决状态跟踪（类似 GitHub Issues）

---

## 🔗 相关资源

- [React 官方文档 - Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry React 文档](https://docs.sentry.io/platforms/react/)
- [react-error-boundary 库](https://github.com/bvaughn/react-error-boundary)
- [Web Dev Errors API](https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent)
- [MDN: Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon)

---

[← 24 - 国际化](../24-i18n/) | [→ 26 - React 内部原理](../26-internals/)
