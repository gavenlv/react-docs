# 12 - Context API

## 🎯 本节目标
- 理解 Context 解决的问题和使用场景
- 掌握 createContext 和 useContext 的用法
- 学会避免 Context 的滥用和性能问题

---

## 📖 什么是 Props Drilling 问题？

当需要将数据从顶层组件传递给深层子组件时，中间层组件不需要这些数据但必须传递它们。

### Props Drilling 示例

```jsx
// ❌ Props Drilling 问题
function App() {
  const user = { name: '张三', role: 'admin' };
  return <Header user={user} />;  // 必须传下去
}

function Header({ user }) {
  return (
    <header>
      <Logo />
      <Navigation user={user} />  // 只是转发，自己不用
    </header>
  );
}

function Navigation({ user }) {
  return (
    <nav>
      <Menu user={user} />  // 还是转发...
      <UserBadge user={user} />  // 终于用到了！
    </nav>
  );
}

function Menu({ user }) {
  return <Dropdown user={user} />;  // 还要继续传...
}
```

### Context 解决方案

```jsx
// ✅ 使用 Context 跨层传递数据
function App() {
  return (
    <UserContext.Provider value={{ name: '张三', role: 'admin' }}>
      <Header />  {/* 不再需要传递 props */}
    </UserContext.Provider>
  );
}

function Header() {
  return (
    <header>
      <Logo />
      <Navigation />
    </header>
  );
}

function Navigation() {
  return (
    <nav>
      <Menu />
      <UserBadge />  {/* 直接使用 context */}
    </nav>
  );
}

function UserBadge() {
  const { name, role } = useContext(UserContext);  // 直接获取
  return <span>{name} ({role})</span>;
}
```

---

## 🏗️ Context API 基础

### 创建 Context

```jsx
// src/contexts/UserContext.jsx
import { createContext } from 'react';

// 创建 Context（可以设置默认值）
export const UserContext = createContext({
  user: null,
  login: () => {},
  logout: () => {}
});

export default UserContext;
```

### Provider（提供者）

Provider 是一个 React 组件，允许消费组件订阅 context 变化。

```jsx
// src/components/App.jsx
import { useState } from 'react';
import { UserContext } from './contexts/UserContext';
import Header from './Header';
import MainContent from './MainContent';

function App() {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  // Provider 包裹需要使用此 Context 的组件树
  return (
    <UserContext.Provider value={{ user, login, logout }}>
      <div className="app">
        <Header />
        <MainContent />
      </div>
    </UserContext.Provider>
  );
}

export default App;
```

### Consumer（消费者）- useContext Hook

```jsx
// src/components/UserProfile.jsx
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

function UserProfile() {
  // 使用 useContext 获取 context 值
  const { user, logout } = useContext(UserContext);

  if (!user) {
    return <p>请先登录</p>;
  }

  return (
    <div className="profile">
      <h2>欢迎, {user.name}!</h2>
      <p>角色: {user.role}</p>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}

export default UserProfile;
```

---

## 🎨 高级用法

### 1. 多个 Context 组合

```jsx
// ThemeContext.js
export const ThemeContext = createContext('light');

// AuthContext.js
export const AuthContext = createContext(null);

// LanguageContext.js
export const LanguageContext = createContext('zh');

// App.jsx
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('zh');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <LanguageContext.Provider value={{ language, setLanguage }}>
          <Header />
          <Main />
        </LanguageContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

// 在组件中使用多个 Context
function Header() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  
  return (
    <header className={`${theme}-theme`}>
      {user ? `你好, ${user.name}` : '游客'}
      <span>{language}</span>
    </header>
  );
}
```

### 2. 动态 Context 值

```jsx
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 从 localStorage 读取初始主题
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // 主题变化时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 提供切换方法
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const contextValue = useMemo(() => ({
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3. 分离 Context 以优化性能

当一个 Context 有很多消费者但只有部分值会变化时：

```jsx
// 将稳定和不稳定的值分开
const StableContext = createContext({});  // 很少变化的值（如配置）
const DynamicContext = createContext({});  // 经常变化的值（如状态）

function App() {
  const [config] = useState({ apiUrl: '/api', timeout: 5000 });  // 稳定
  const [count, setCount] = useState(0);  // 可能频繁变化

  return (
    <StableContext.Provider value={config}>
      <DynamicContext.Provider value={{ count, setCount }}>
        <SomeComponent />
      </DynamicContext.Provider>
    </StableContext.Provider>
  );
}
```

### 4. 使用高阶组件包装 Context

```jsx
// withUserContext HOC
function withUserContext(WrappedComponent) {
  return function(props) {
    const context = useContext(UserContext);
    return <WrappedComponent {...props} {...context} />;
  };
}

// 使用
class OldClassComponent extends React.Component {
  render() {
    const { user, logout } = this.props;  // 从 HOC 注入
    return <div>Hello, {user?.name}</div>;
  }
}

export default withUserContext(OldClassComponent);
```

---

## ⚠️ 性能注意事项与最佳实践

### 1. 避免不必要的重新渲染

**问题：** Context 值变化会导致所有消费者重新渲染

```jsx
// ❌ 每次 render 都创建新对象
<UserContext.Provider value={{ user, login, logout }}>
  {children}
</UserContext.Provider>

// ✅ 使用 useMemo 或 state 缓存
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const value = useMemo(() => ({
    user,
    login: setUser,
    logout: () => setUser(null)
  }), [user]);  // 只有 user 变化时才创建新值
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### 2. 拆分 Context 减少影响范围

```jsx
// ❌ 一个大 Context 导致任何属性变化都触发所有消费者更新
const AppContext = createContext({
  user: null,
  theme: 'light',
  notifications: [],
  settings: {},
  // ...更多
});

// ✅ 按关注点拆分
const UserContext = createContext({ user: null });
const ThemeContext = createContext({ theme: 'light' });
const NotificationContext = createContext({ notifications: [] });
const SettingsContext = createContext({ settings: {} });
```

### 3. 合理使用默认值

```jsx
// 设置合理的默认值（可选）
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {
    console.warn('ThemeProvider not found');
  }
});

// 这样即使没有包裹 Provider 也不会报错
// 但通常建议始终使用 Provider
```

### 4. 不要过度使用 Context

**适合使用 Context 的场景：**
- 全局主题（暗色/亮色模式）
- 用户认证信息（当前登录用户）
- 语言/i18n 配置
- UI 布局偏好（侧边栏展开/收起）
- 应用级状态（购物车、通知等）

**不适合使用 Context 的场景：**
- 只有两三层组件需要共享的数据（直接用 props）
- 频繁更新的状态（考虑用状态管理库）
- 与 UI 无关的业务逻辑

---

## 🛠️ 实战案例：完整的应用 Context 架构

### 项目结构

```
src/
├── contexts/
│   ├── AuthContext.jsx       # 认证相关
│   ├── ThemeContext.jsx      # 主题相关
│   └── ToastContext.jsx      # Toast 通知
├── providers/
│   └── AppProviders.jsx     # 所有 Provider 的组合
├── components/
│   ├── Layout.jsx
│   └── Button.jsx
└── App.jsx
```

### AuthContext 实现

```jsx
// contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从 token 恢复登录状态
  useEffect(() => {
    async function initAuth() {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await api.verifyToken(token);
          setUser(userData);
        }
      } catch (err) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
    
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: userData } = await api.login(email, password);
    localStorage.setItem('token', token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const register = useCallback(async (userData) => {
    const result = await api.register(userData);
    return result;
  }, []);

  // 缓存 context 值，避免不必要的重新渲染
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    register
  }), [user, loading, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook 方便使用
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
```

### ToastContext 实现（全局通知）

```jsx
// contexts/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';  // npm install uuid

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastId;
    
    setToasts(prev => [...prev, { id, message, type }]);
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* 渲染 Toast 列表 */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// 自定义 Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast 组件
function ToastItem({ message, type, onClose }) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}
```

### 组合 Providers

```jsx
// providers/AppProviders.jsx
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

export default function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### 使用示例

```jsx
// App.jsx
import AppProviders from './providers/AppProviders';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AppProviders>
      <Dashboard />
    </AppProviders>
  );
}

// components/Dashboard.jsx
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';

function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { success, error } = useToast();

  const handleSave = async (data) => {
    try {
      await api.saveSettings(data);
      success('保存成功！');
    } catch (err) {
      error('保存失败：' + err.message);
    }
  };

  return (
    <div className={`dashboard ${theme}`}>
      <h1>Dashboard</h1>
      <p>Welcome back, {user?.name}</p>
      
      {isAdmin && <AdminPanel />}
      
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </button>
      
      <button onClick={handleSave}>Save</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 理解 Props Drilling 问题及其解决方案
- [ ] 掌握 createContext、Provider、useContext 的用法
- [ ] 能够组合多个 Context
- [ ] 知道如何优化 Context 性能
- [ ] 能够设计合理的应用级 Context 架构

---

## 📝 练习任务

1. **国际化 Context**: 创建多语言支持的 i18n Context
2. **Cart Context**: 为电商应用创建购物车 Context
3. **Permission Context**: 基于角色的权限控制系统

---

## 🔬 Context API 的底层原理

### 1. Context 的内部实现原理

#### React.createContext 创建了什么？

当调用 `React.createContext(defaultValue)` 时，React 实际上创建了一个特殊的对象，包含 `Provider` 和 `Consumer` 两个组件，以及一个内部的 `_context` 引用。

> 💡 **大白话**：`createContext` 就像建了一个"广播电台"。Provider 是"发射塔"，Consumer 是"收音机"，defaultValue 是"没有信号时播放的默认节目"。

```javascript
// React 内部创建 Context 的简化模型
function createContext(defaultValue) {
  const context = {
    _currentValue: defaultValue,     // 当前保存的值
    _currentRenderer: null,          // 当前渲染器引用
    _renderer: null,                 // 关联的渲染器
    Provider: null,                  // 稍后赋值
    Consumer: null,                  // 稍后赋值
    _defaultValue: defaultValue,     // 保存默认值
  };

  // Provider 组件——向子树提供 value
  context.Provider = function Provider({ value, children }) {
    // 将 value 写入 context 的当前值
    context._currentValue = value;
    return children;  // 直接渲染子组件（不增加额外 DOM 节点）
  };

  // Consumer 组件——读取 context 的当前值
  context.Consumer = function Consumer({ children }) {
    // children 是一个函数，接收 context 值作为参数
    return children(context._currentValue);
  };

  return context;
}
```

#### Provider 如何向下传递值？——Context Stack 机制

Provider 并不是通过 props 一层层传递的！React 内部使用了一个**Context Stack（上下文栈）**机制：

```
┌─────────────────────────────────────────────────────┐
│                    Context Stack                      │
│                                                      │
│  ┌───────────────────────────────────┐              │
│  │  Layer 3: AuthContext             │  ← 最近      │
│  │  value: { user: '张三' }          │    优先级最高 │
│  ├───────────────────────────────────┤              │
│  │  Layer 2: ThemeContext            │              │
│  │  value: { theme: 'dark' }        │              │
│  ├───────────────────────────────────┤              │
│  │  Layer 1: AppContext (默认值)      │  ← 最早      │
│  │  value: { name: 'App' }          │    兜底       │
│  └───────────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

> 💡 **类比**：想象你戴着三层手套——最里面那层决定你最终摸到什么。Context Stack 也是这样，离组件最近的 Provider 的值会"遮住"外层的值。

**覆盖机制**：内层 Provider 可以覆盖外层 Provider 的值

```jsx
// 外层 Provider 提供默认主题
<ThemeContext.Provider value="light">
  {/* 这里的 useContext(ThemeContext) 得到 "light" */}
  
  <ThemeContext.Provider value="dark">
    {/* 这里的 useContext(ThemeContext) 得到 "dark"——覆盖了外层 */}
    <Header />
  </ThemeContext.Provider>
  
  {/* 这里又回到 "light" */}
  <Footer />
</ThemeContext.Provider>
```

#### 为什么 Context 值变化时所有 Consumer 都会重渲染？

这是 Context 最大的性能痛点。当 Provider 的 `value` 发生变化时，React 会**遍历整棵子树**，找到所有使用 `useContext(Context)` 的组件，强制它们重新渲染——**即使这个组件只用了 value 中的某一个属性，而那个属性并没有变化**。

```
Provider value 变化: { user: '张三', theme: 'dark', lang: 'zh' }
                          ↓
              theme 从 'light' 变为 'dark'
                          ↓
┌─────────────────────────────────────────┐
│          所有 useContext 消费者           │
│                                         │
│  Header (用了 user)      → 重渲染 ⚠️    │
│  Sidebar (用了 theme)    → 重渲染 ✅    │
│  Footer (用了 lang)      → 重渲染 ⚠️    │
│  Toolbar (用了 theme)    → 重渲染 ✅    │
│  UserInfo (用了 user)    → 重渲染 ⚠️    │
│                                         │
│  💡 只有 Sidebar 和 Toolbar 真正需要     │
│     更新，但其他 3 个也被"连坐"了       │
└─────────────────────────────────────────┘
```

> ⚠️ **为什么 React 不做更细粒度的比较？**
> 因为 Context 的设计初衷是用于**不频繁变化的"全局"数据**（如主题、语言、认证信息）。React 团队有意保持这个"全量通知"机制，因为细粒度的订阅-比较（类似 Redux 的 Selector）会带来额外的内存和计算开销。

#### useContext 的闭包原理

`useContext` 是一个 Hook，它在组件渲染时从 Fiber 节点上读取最近 Provider 的值：

```javascript
// useContext 的简化实现
function useContext(Context) {
  // 1. 找到当前组件所在的 Fiber 节点
  const fiber = currentlyRenderingFiber;
  
  // 2. 沿着 Fiber 树向上查找，找到最近的 Provider
  let contextValue = Context._defaultValue;
  let node = fiber.return;  // 从父节点开始向上找
  
  while (node !== null) {
    if (node.type === Context.Provider) {
      contextValue = Context._currentValue;
      break;
    }
    node = node.return;
  }
  
  // 3. 订阅这个 Context（标记依赖）
  // 这样当 Provider value 变化时，React 知道要重新渲染这个组件
  fiber.dependencies.add(Context);
  
  return contextValue;
}
```

> 💡 **大白话**：`useContext` 就像你在 Fiber 树上"往上爬"，一层一层找，直到找到一个 Provider，然后把它存的值拿下来用。同时你在那个 Provider 上"留了个名片"，以后值变了 Provider 会通知你。

#### 用简化代码模拟 Context 的核心实现

```javascript
// ===== 一个极简版 React Context 实现（约 40 行） =====

// 全局计数器，用于生成唯一 ID
let contextIdCounter = 0;

function createContext(defaultValue) {
  const id = ++contextIdCounter;
  
  // 用 Symbol 存储在 DOM 属性上（避免命名冲突）
  const contextKey = Symbol(`context-${id}`);
  
  // 订阅列表：记录所有需要通知的组件
  const listeners = new Set();
  
  const Context = {
    // Provider 组件
    Provider({ value, children }) {
      // 把当前值存到一个 React 内部能访问的地方
      // 实际 React 是存在 Fiber 上的
      React.__internalSetContext(contextKey, value);
      
      // 检测 value 是否变化，如果变化则通知所有订阅者
      const prevValue = React.__internalGetContext(contextKey);
      if (prevValue !== value) {
        // 遍历通知所有 Consumer 组件重新渲染
        listeners.forEach(component => component.forceUpdate());
      }
      
      return children;
    },
    
    // Hook 版本（类似 useContext）
    useContext() {
      // 从最近的 Provider 获取值
      const value = React.__internalGetContext(contextKey) ?? defaultValue;
      
      // 标记当前组件为订阅者
      const currentComponent = React.__internalGetCurrentComponent();
      if (currentComponent) {
        listeners.add(currentComponent);
      }
      
      return value;
    }
  };
  
  return Context;
}

// 使用示例
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = React.useState('light');
  return (
    <ThemeContext.Provider value={theme}>
      <Header />    {/* 内部调用 ThemeContext.useContext() */}
      <Main />
    </ThemeContext.Provider>
  );
}
```

---

### 2. Context 的性能陷阱与优化

#### Context 的"全量重渲染"问题详解

看一个真实的性能灾难场景：

```jsx
// ❌ 典型性能问题：一个 Context 存了太多东西
const AppContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 每次 value 都是新对象（引用不同）→ 每次都触发全部子组件重渲染
  return (
    <AppContext.Provider value={{ user, notification, searchQuery, setUser, setSearchQuery }}>
      <Header />           {/* 用了 user */}
      <NotificationBar />  {/* 用了 notification */}
      <SearchBar />        {/* 用了 searchQuery */}
      <Dashboard />        {/* 什么都没用，但也被重渲染！ */}
    </AppContext.Provider>
  );
}
```

**问题链**：
1. 用户在搜索框输入一个字符 → `searchQuery` 变化
2. Provider 的 `value` 是新对象 → React 认为值变了
3. **所有** `useContext(AppContext)` 的组件都重渲染
4. `Dashboard` 虽然什么都没用，但也无辜被重渲染了
5. 如果 `Dashboard` 里有复杂的子组件……级联重渲染灾难

#### 为什么拆分多个 Context 可以优化性能？

核心思想：**一个 Context 变化只影响它自己的消费者**。

```
拆分前：
┌──────────────────────────────────┐
│    AppContext (user + theme)      │
│                                   │
│  theme 变化 → 所有消费者重渲染    │
│  Header ✅  Dashboard ⚠️          │
│  Footer ✅  Sidebar ⚠️           │
└──────────────────────────────────┘

拆分后：
┌──────────────────┐  ┌──────────────────┐
│  ThemeContext     │  │  UserContext      │
│                   │  │                   │
│  theme 变化 →    │  │  user 不变 →      │
│  Header ✅        │  │  Dashboard 不渲染 │
│  Sidebar ✅       │  │  Footer 不渲染    │
└──────────────────┘  └──────────────────┘
```

```jsx
// ✅ 按关注点拆分 Context
const UserContext = createContext();
const ThemeContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <Header />       {/* 只订阅 ThemeContext */}
        <UserInfo />     {/* 只订阅 UserContext */}
        <Dashboard />    {/* 什么都不订阅，完全不受影响 */}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

> 💡 **生活类比**：拆分 Context 就像把一个大微信群拆成多个小群。群里有人发消息时，只有那个群里的人收到通知，不会打扰其他人。

#### Context + useReducer 的组合模式原理

当 Context 的值需要复杂的状态管理时，`useState` 就不够用了。`useReducer` + `Context` 是经典的组合：

```jsx
// ✅ Context + useReducer 模式
const TodosContext = createContext();
const TodosDispatchContext = createContext();

// Reducer：纯函数，描述状态如何变化
function todosReducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'TOGGLE':
      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    case 'DELETE':
      return state.filter(t => t.id !== action.id);
    default:
      return state;
  }
}

function TodosProvider({ children }) {
  const [todos, dispatch] = useReducer(todosReducer, []);

  return (
    <TodosContext.Provider value={todos}>
      <TodosDispatchContext.Provider value={dispatch}>
        {children}
      </TodosDispatchContext.Provider>
    </TodosContext.Provider>
  );
}
```

> 💡 **为什么要分离 state 和 dispatch 到两个 Context？**
> 因为 dispatch 的引用永远不变（`useReducer` 返回的 dispatch 是稳定的），所以 dispatch 的 Context 永远不会触发消费者重渲染。只有 state 的 Context 会在状态变化时触发重渲染。这样消费 dispatch 的组件就不会被频繁重渲染影响。

```
┌──────────────────────────────────────────┐
│        TodosContext (state)               │
│  值经常变化 → 只影响读 state 的组件       │
├──────────────────────────────────────────┤
│  TodosDispatchContext (dispatch)         │
│  引用永远不变 → 不触发任何重渲染         │
│  （发送按钮只消费 dispatch，不重渲染）    │
└──────────────────────────────────────────┘
```

#### Context vs Redux vs Zustand 的本质区别

| 特性 | Context API | Redux | Zustand |
|------|------------|-------|---------|
| **订阅粒度** | ❌ 全量通知 | ✅ Selector 精准订阅 | ✅ Selector 精准订阅 |
| **性能优化** | 手动拆分 Context | 内置 memoized selector | 内置 useSyncExternalStore |
| **中间件** | 无 | Thunk/Saga 等丰富生态 | Devtools/Persist/Immer |
| **时间旅行调试** | ❌ | ✅ Redux DevTools | ⚠️ 需要额外配置 |
| **模板代码** | 少 | 多（即使 RTK 也不少） | 极少 |
| **Provider** | 需要 | 需要 | **不需要** |
| **适合场景** | 少量低频变化的全局数据 | 大型复杂应用 | 大部分场景 |

> 💡 **大白话**：Context 像一个"大喇叭广播站"——一喊话所有人都得听。Redux/Zustand 像"微信群"——你可以选择只关注你加入的群，只看你需要的信息。

#### 什么时候不该用 Context？——性能决策树

```
需要共享数据吗？
├── 不需要 → 用 useState + Props
└── 需要 →
    ├── 只有 2-3 层组件需要？ → 用 Props（简单直接）
    ├── 数据变化频率高（如实时数据、动画帧）？ → ❌ 别用 Context！用 Zustand/Jotai
    ├── 消费者很多，但只需要 value 的不同部分？ → ❌ 别用单个 Context！拆分或用 Zustand
    ├── 需要中间件（异步、持久化、日志）？ → 用 Redux/Zustand
    └── 低频变化的全局数据（主题、语言、认证）？ → ✅ 用 Context 刚好
```

---

### 3. Context 的常见设计模式

#### 组合 Context 模式

将多个相关 Context 封装到一个 Provider 中，对外只暴露一个干净的 API：

```jsx
// contexts/AppContexts.jsx
const UserContext = createContext(null);
const ThemeContext = createContext(null);
const NotificationContext = createContext(null);

// 组合 Provider——用户只看到一个标签
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

// 导出自定义 Hooks，隐藏 Context 实现细节
function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('缺少 UserProvider');
  return ctx;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('缺少 ThemeProvider');
  return ctx;
}

export { AppProviders, useUser, useTheme };
```

> 💡 **好处**：消费者完全不需要知道内部有几个 Context，只需要调用 `useUser()`、`useTheme()` 就行。以后内部拆分、合并 Context 都不影响外部代码。

#### Context Selector 模式

利用 React 18 的 `useContext` + 外部库（如 `use-context-selector`）实现精准订阅：

```jsx
// 使用 use-context-selector 库实现精准订阅
import { createContext, useContextSelector } from 'use-context-selector';

const AppContext = createContext({});

function App() {
  return (
    <AppContext.Provider value={{ user, theme, notifications, settings }}>
      <Dashboard />
    </AppContext.Provider>
  );
}

// ✅ 只订阅 user，theme 变化时不会重渲染！
function UserAvatar() {
  const user = useContextSelector(AppContext, ctx => ctx.user);
  return <img src={user.avatar} />;
}

// ✅ 只订阅 theme，user 变化时不会重渲染！
function ThemeToggle() {
  const theme = useContextSelector(AppContext, ctx => ctx.theme);
  return <button>{theme}</button>;
}
```

> ⚠️ React 18 原生的 `useContext` 不支持 selector。`use-context-selector` 底层使用了 `useSyncExternalStore` 来实现精准订阅。

#### 派生状态 vs 直接消费 Context

```jsx
// ❌ 每个组件自己从 Context 取值并计算派生状态
// 如果 10 个组件都需要 displayName，计算就重复 10 次
function UserGreeting() {
  const { user } = useContext(UserContext);
  const displayName = `${user.firstName} ${user.lastName}`; // 重复计算
  return <h1>你好，{displayName}</h1>;
}

function UserMenu() {
  const { user } = useContext(UserContext);
  const displayName = `${user.firstName} ${user.lastName}`; // 又重复计算了！
  return <span>{displayName}</span>;
}

// ✅ 方案 A：在 Provider 中预计算好，放入 Context
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const displayName = useMemo(
    () => user ? `${user.firstName} ${user.lastName}` : '',
    [user]
  );
  return (
    <UserContext.Provider value={{ user, displayName }}>
      {children}
    </UserContext.Provider>
  );
}

// ✅ 方案 B：使用 useMemo + Context Selector
function UserGreeting() {
  const { user } = useContext(UserContext);
  const displayName = useMemo(
    () => `${user.firstName} ${user.lastName}`,
    [user.firstName, user.lastName]  // 只在这两个值变化时才重算
  );
  return <h1>你好，{displayName}</h1>;
}
```

> 💡 **原则**：派生状态尽量在数据源附近计算（靠近 Provider），而不是在各个消费组件中分散计算。这样逻辑更集中、更容易维护。

---

[→ 13 - 路由管理](../13-router/)
