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

[→ 13 - 路由管理](../13-router/)
