# 11 - 自定义 Hooks

## 🎯 本节目标
- 理解自定义 Hook 的设计原则
- 掌握常见自定义 Hook 的实现模式
- 学会抽象和复用状态逻辑

---

## 📖 自定义 Hook 概念

### 什么是自定义 Hook？
以 `use` 开头的函数，可以在内部调用其他 Hooks，用于提取和复用组件间的状态逻辑。

### 为什么需要自定义 Hook？

**问题：组件间重复逻辑**

```jsx
// ❌ 多个组件中重复相同的逻辑
function UserProfile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/user').then(res => res.json()).then(data => {
      setData(data);
      setLoading(false);
    });
  }, []);
  
  // ...渲染用户信息
}

function PostList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/posts').then(res => res.json()).then(data => {
      setData(data);
      setLoading(false);
    }, []);
  );
  
  // ...渲染文章列表
}
```

**解决方案：自定义 Hook**

```jsx
// ✅ 提取公共逻辑为自定义 Hook
function useFetch(url) {
  const [data,setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false); })
  }, [url]);
  
  return { data, loading };
}

// 在多个组件中使用
function UserProfile() {
  const { data: user, loading } = useFetch('/api/user');
  if (loading) return <Spinner />;
  return <UserCard user={user} />;
}
```

---

## 🔧 常用自定义 Hooks 实现

### 1. useDebounce（防抖）

用于搜索输入、窗口 resize 等场景。

```jsx
import { useState, useEffect } from 'react';

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理定时器（如果 value 变化则重新计时）
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用示例：搜索框优化
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);  // 防抖 500ms
  
  useEffect(() => {
    // 只在用户停止输入 500ms 后才执行搜索
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="搜索..."
    />
  );
}

export default useDebounce;
```

### 2. useThrottle（节流）

限制函数在一定时间内只能执行一次。

```jsx
import { useRef, useCallback } from 'react';

function useThrottle(callback, delay) {
  const lastRun = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = now;
    }
  }, [callback, delay]);
}

// 使用示例：滚动事件处理
function ScrollComponent() {
  const handleScroll = useThrottle(() => {
    console.log('滚动了！', window.scrollY);
  }, 100);  // 每 100ms 最多执行一次

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  return <div style={{ height: '200vh' }}>向下滚动</div>;
}
```

### 3. useToggle（布尔值切换）

简化布尔状态的切换操作。

```jsx
import { useState, useCallback } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
}

// 使用示例
function Modal() {
  const [isOpen, toggleModal, openModal, closeModal] = useToggle();

  return (
    <>
      <button onClick={openModal}>打开弹窗</button>
      
      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal">
            <h2>标题</h2>
            <p>内容</p>
            <button onClick={toggleModal}>切换</button>
          </div>
        </div>
      )}
    </>
  );
}
```

### 4. useAsync（异步状态管理）

封装异步操作的加载、错误、数据状态。

```jsx
import { useState, useEffect, useCallback } from 'react';

const IDLE = 'idle';
const LOADING = 'loading';
const SUCCESS = 'success';
const ERROR = 'error';

function useAsync(asyncFunction, immediate = false) {
  const [status, setStatus] = useState(IDLE);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setStatus(LOADING);
    setError(null);
    
    try {
      const response = await asyncFunction(...args);
      setData(response);
      setStatus(SUCCESS);
      return response;
    } catch (err) {
      setError(err);
      setStatus(ERROR);
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === LOADING,
    isError: status === ERROR,
    isSuccess: status === SUCCESS
  };
}

// 使用示例
function UserList() {
  const { 
    data: users, 
    isLoading, 
    isError, 
    error,
    execute: refetch 
  } = useAsync(fetchUsers, true);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorDisplay message={error.message} onRetry={refetch} />;
  
  return (
    <>
      <UserGrid users={users} />
      <button onClick={refetch}>刷新</button>
    </>
  );
}
```

### 5. useLocalStorage（持久化存储）

将状态同步到 localStorage。

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// 使用示例
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'zh');

  return (
    <div className={theme}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">浅色主题</option>
        <option value="dark">深色主题</option>
      </select>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
```

### 6. useMediaQuery（响应式媒体查询）

在 JS 中检测媒体查询。

```jsx
import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // 监听变化
    mediaQueryList.addEventListener('change', handleChange);
    
    // 初始检查
    setMatches(mediaQueryList.matches);

    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// 使用示例
function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return (
    <div className={`layout ${isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}`}>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      {/* 根据屏幕尺寸渲染不同内容 */}
    </div>
  );
}
```

---

## 💡 设计原则与最佳实践

### 1. 命名规范

```jsx
// ✅ 正确：以 use 开头
useFetch
useLocalStorage
useDebounce
useAuth

// ❌ 错误：不以 use 开头
fetchData
localStorage
getDebounce
```

### 2. 单一职责

每个 Hook 应该只做一件事。

```jsx
// ❌ 错误：职责过多
function useEverything() {
  // 获取数据
  // 处理表单验证
  // 管理模态框状态
  // 处理权限逻辑
}

// ✅ 正确：拆分为独立的 hooks
function useFetch() {}       // 数据获取
function useForm() {}         // 表单管理
function useModal() {}        // 模态框控制
function useAuth() {}         // 权限认证
```

### 3. 返回值设计

根据复杂度选择返回方式：

```jsx
// 简单情况：返回单个值或数组
function useToggle(initialValue) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];  // 数组形式，方便解构重命名
}

// 复杂情况：返回对象
function useFetch(url) {
  // ...
  return {
    data,
    loading,
    error,
    refetch  // 对象形式，语义更清晰
  };
}
```

### 4. 参数设计

支持灵活的参数配置：

```jsx
// 支持对象配置参数
function useApi({ url, method = 'GET', headers = {}, body = null }) {
  // ...
}

// 使用时可以按需配置
const { data } = useApi({
  url: '/api/users',
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## ⚠️ 注意事项

### 1. 不要在条件语句中调用 Hooks

```jsx
// ❌ 错误：条件调用
function MyHook(shouldUseEffect) {
  const [state, setState] = useState(0);
  
  if (shouldUseEffect) {
    useEffect(() => {  // 错误！
      // ...
    });
  }
}

// ✅ 正确：始终调用，条件放在 effect 内部
function MyHook(shouldUseEffect) {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    if (shouldUseEffect) {
      // 条件逻辑放在这里
    }
  });
}
```

### 2. 不要在普通函数中调用 Hooks

```jsx
// ❌ 错误：在普通函数中使用 hook
function fetchData() {
  const [data, setData] = useState();  // 错误！
  // ...
}

// ✅ 正确：只在组件或其他 hook 中使用
function useMyCustomHook() {
  const [data, setData] = useState();  // ✓ 正确
  // ...
}

function MyComponent() {
  const [data, setData] = useState();  // ✓ 正确
  // ...
}
```

### 3. 不要修改从其他 Hook 返回的状态

```jsx
function useCounter() {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}

function App() {
  const { count, increment } = useCounter();
  
  // ❌ 不要直接修改返回值（如果需要暴露 setter）
  setCount(10);  // 如果 useCounter 没有返回 setCount
  
  // ✅ 使用提供的方法
  increment();
}
```

---

## 🎯 实战练习

### 综合项目：useForm Hook

创建一个功能完整的表单管理 Hook：

```jsx
import { useState, useCallback } from 'react';

function useForm(initialValues = {}, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理输入变化
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 实时验证（如果提供了验证函数）
    if (validate && touched[name]) {
      const newErrors = validate({ ...values, [name]: value });
      setErrors(newErrors);
    }
  }, [validate, touched, values]);

  // 处理失焦
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [validate, values]);

  // 重置表单
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // 提交表单
  const handleSubmit = useCallback(async (callback) => {
    setIsSubmitting(true);
    
    // 验证所有字段
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );

      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return false;
      }
    }

    try {
      await callback(values);
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  // 设置特定字段值
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue
  };
}

export default useForm;

// 使用示例
function RegistrationForm() {
  const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.username.trim()) {
      errors.username = '用户名不能为空';
    } else if (values.username.length < 2) {
      errors.username = '至少 2 个字符';
    }

    if (!values.email) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = '邮箱格式不正确';
    }

    if (values.password.length < 6) {
      errors.password = '密码至少 6 位';
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = '两次密码不一致';
    }

    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(initialValues, validate);

  const onSubmit = async (formData) => {
    console.log('提交的数据:', formData);
    await api.register(formData);
    alert('注册成功！');
  };

  return (
    <form onSubmit={() => handleSubmit(onSubmit)}>
      <input
        name="username"
        value={values.username}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="用户名"
      />
      {errors.username && touched.username && (
        <span className="error">{errors.username}</span>
      )}

      {/* 其他字段... */}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 理解自定义 Hook 的概念和作用
- [ ] 能够实现常用的自定义 Hooks（防抖、节流、异步等）
- [ ] 掌握 Hook 的设计原则和最佳实践
- [ ] 了解注意事项和常见陷阱
- [ ] 能根据需求设计和实现自定义 Hook

---

## 📝 练习任务

1. **useClickOutside**: 点击外部区域触发回调（用于关闭下拉菜单）
2. **useScrollPosition**: 跟踪页面滚动位置
3. **useCopyToClipboard**: 复制文本到剪贴板
4. **useIntersectionObserver**: 元素进入视口时触发回调

---

## 🔬 自定义 Hook 的高级原理与设计模式

> 这部分帮助你从"会用"自定义 Hook 进阶到"真正理解"它的工作原理，并掌握高级设计模式。

### 1. 自定义 Hook 为什么能共享状态逻辑而不共享状态？

💡 **大白话解释**：想象你买了一个蛋糕模具（自定义 Hook），你和邻居各用一个模具做蛋糕。你们做出来的蛋糕配方一样、形状一样，但馅料是各自放的、各自吃的——模具是"共享逻辑"，蛋糕是"各自的状态"。每次调用自定义 Hook，React 都会为它创建一套**全新独立**的 Hook 链表。

**每次调用都是独立的实例**

```jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  return { count, increment, decrement };
}

function App() {
  // 虽然都调用了 useCounter，但每个调用都是完全独立的实例
  const counterA = useCounter(0);  // 独立的 useState、独立的 count
  const counterB = useCounter(0);  // 独立的 useState、独立的 count
  const counterC = useCounter(100); // 独立的 useState，初始值为 100

  // counterA.count 和 counterB.count 互不影响
  // 点击 counterA.increment 不会改变 counterB.count
  return (
    <div>
      <p>A: {counterA.count} <button onClick={counterA.increment}>+1</button></p>
      <p>B: {counterB.count} <button onClick={counterB.increment}>+1</button></p>
      <p>C: {counterC.count} <button onClick={counterC.increment}>+1</button></p>
    </div>
  );
}
```

```
组件 App 的 Fiber 节点 Hook 链表：
┌──────────────┐
│ useCounter() │ ← counterA 的 useState(0)
│ → hookIndex 0│
│ count = 0    │
│ next ────────┼──→ ┌──────────────┐
└──────────────┘    │ useCounter() │ ← counterB 的 useState(0)
                    │ → hookIndex 1│
                    │ count = 0    │
                    │ next ────────┼──→ ┌──────────────┐
                    └──────────────┘    │ useCounter() │ ← counterC 的 useState(100)
                                        │ → hookIndex 2│
                                        │ count = 100  │
                                        │ next ────────┼──→ null
                                        └──────────────┘

每个 Hook 都是链表上的独立节点，互不干扰！
```

**与全局变量/单例模式的区别**

```jsx
// ❌ 全局变量模式：所有组件共享同一个变量（这不是 Hook 的行为！）
let globalCount = 0;
function incrementGlobal() { globalCount++; }

// 组件 A 和组件 B 引用的是同一个 globalCount
// A 改了，B 也能看到 → 状态泄露！

// ✅ 自定义 Hook 模式：每个组件独立
function useCounter() {
  const [count, setCount] = useState(0);  // 每个组件实例有独立的 count
  return { count, increment: () => setCount(c => c + 1) };
}

// 组件 A 的 count 和组件 B 的 count 完全独立
// A 改了，B 完全不受影响
```

**React 内部如何为每个组件实例创建独立的 Hook 链表**

```
组件实例A 的 Fiber 节点                  组件实例B 的 Fiber 节点
┌──────────────────┐                    ┌──────────────────┐
│ memoizedState ──┐│                    │ memoizedState ──┐│
└────────────────┘ ││                    └────────────────┘ ││
                   ▼▼                                          ▼▼
              ┌─────────┐                               ┌─────────┐
              │Hook #0  │ 独立的！                      │Hook #0  │ 独立的！
              │count = 5│                               │count = 0│
              │next ────┼──→ null                       │next ────┼──→ null
              └─────────┘                               └─────────┘

即使 A 和 B 都调用了同一个自定义 Hook，它们的 Fiber 节点不同，
memoizedState 指向不同的链表，所以状态完全独立。
```

---

### 2. 自定义 Hook 的设计原则

#### 单一职责原则（一个 Hook 做一件事）

💡 **大白话解释**：就像瑞士军刀虽然功能多，但你不会用它来做饭——每个工具都有它的专长。自定义 Hook 也一样，一个 Hook 应该只负责一件事，这样才好理解、好测试、好复用。

```jsx
// ❌ 职责过多：一个 Hook 干了太多事
function useUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ← 模态框状态？
  const [searchTerm, setSearchTerm] = useState('');       // ← 搜索状态？
  const [formData, setFormData] = useState({});            // ← 表单状态？

  // 数据获取 + UI 状态 + 表单管理 全混在一起...
}

// ✅ 拆分为独立的 Hooks
function useUsers() {
  const { data, loading, error, refetch } = useFetch('/api/users');
  return { users: data ?? [], loading, error, refetch };
}

function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen(v => !v) };
}

function useSearch() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebounce(term, 300);
  return { term, setTerm, debouncedTerm };
}

function useForm(initialValues) {
  // 表单管理逻辑
}

// 在组件中组合使用
function UserManagement() {
  const { users, loading, refetch } = useUsers();
  const { isOpen, open, close } = useModal();
  const { term, setTerm, debouncedTerm } = useSearch();
  const form = useForm({ name: '', email: '' });
}
```

#### 命名约定（use 开头的深层原因）

```jsx
// React 通过 "use" 前缀来识别自定义 Hook
// 这不仅是约定，更是 React 内部机制的要求

// 🔍 为什么必须是 use 开头？
// 1. React 的 ESLint 插件（eslint-plugin-react-hooks）通过这个前缀来
//    检查 Hooks 规则（比如是否在条件语句中调用）
// 2. React 开发者工具通过这个前缀来识别和展示 Hook
// 3. 社区约定——看到 use 开头就知道这是一个 Hook，内部调用了其他 Hooks

// ✅ 正确命名
function useFetch(url) { /* ... */ }
function useLocalStorage(key, value) { /* ... */ }
function useDebounce(value, delay) { /* ... */ }
function useAuth() { /* ... */ }

// ❌ 错误命名（虽然代码能运行，但会失去上述好处）
function fetchData(url) { /* ... */ }    // 不像 Hook
function getLocalStorage(key) { /* ... */ } // 不像 Hook
```

#### 返回值设计模式：数组 vs 对象

```jsx
// 模式1：数组返回（适合 2-3 个值，且需要解构时重命名）
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];  // 数组形式
}

// ✅ 优点：可以自由重命名
const [isOpen, setIsOpen] = useToggle();
const [isVisible, toggleVisible] = useToggle(false);
const [isDark, flipTheme] = useToggle(false);

// ❌ 缺点：超过 3 个值时顺序容易记错
const [a, b, c, d, e] = useSomething();  // a 是什么？b 呢？

// 模式2：对象返回（适合多个值，语义更清晰）
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { /* ... */ }, [url]);

  return { data, loading, error, refetch: () => {} };  // 对象形式
}

// ✅ 优点：语义清晰，不需要记顺序
const { data, loading, error, refetch } = useFetch('/api/users');

// ⚠️ 缺点：解构时不能用自定义名字（需要额外一行）
const { data: users } = useFetch('/api/users');

// 💡 经验法则：
// ┌────────────────────┬──────────────────┐
// │ 返回值个数          │ 推荐形式          │
// ├────────────────────┼──────────────────┤
// │ 1-2 个             │ 数组             │
// │ 3 个及以上         │ 对象             │
// │ 需要"开启/关闭"语义│ [value, actions] │
// └────────────────────┴──────────────────┘
```

#### 参数设计：配置对象模式

```jsx
// 模式1：位置参数（适合参数少、类型明确的场景）
function useDebounce(value, delay = 300) { /* ... */ }
// 简洁直观，但参数多了容易混乱

// 模式2：配置对象（适合参数多、有可选参数的场景）
function useFetch({
  url,
  method = 'GET',
  headers = {},
  body = null,
  enabled = true,      // 是否自动发起请求
  retryCount = 0,      // 失败重试次数
  cacheTime = 60000,   // 缓存时间（毫秒）
  onSuccess,           // 成功回调
  onError,             // 失败回调
} = {}) {
  // ...
}

// ✅ 使用时语义清晰，参数顺序无关
const { data } = useFetch({
  url: '/api/users',
  retryCount: 3,
  headers: { Authorization: `Bearer ${token}` },
});

// 模式3：混合模式（核心参数用位置，可选参数用对象）
function useFetch(url, options = {}) {
  // url 是必须的位置参数
  // 其余都是可选的配置
}

const { data } = useFetch('/api/users', { retryCount: 3 });
```

---

### 3. 高级自定义 Hook 模式（附完整实现）

#### useDebounce（防抖）的完整实现和原理

💡 **大白话解释**：防抖就像电梯门——你按了关门按钮，如果有人在最后一秒又按了开门，电梯就会重新等。只有你最后一次操作后安静下来，电梯才会关门。防抖就是"最后一次操作后等一会儿再执行"。

```jsx
import { useState, useEffect, useRef } from 'react';

/**
 * 防抖 Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {any} 防抖后的值
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  // 用 ref 存储定时器 ID，这样可以在组件卸载时清理
  const timerRef = useRef(null);

  useEffect(() => {
    // 每次值变化时，先清除上一个定时器，再设置新的
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：组件卸载或值再次变化时清除定时器
    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  return debouncedValue;
}

// 💡 原理解析：
// 用户输入 "hello"：
//   输入 h → 启动 300ms 定时器
//   输入 he → 清除上一个，启动新 300ms 定时器
//   输入 hel → 清除上一个，启动新 300ms 定时器
//   输入 hell → 清除上一个，启动新 300ms 定时器
//   输入 hello → 清除上一个，启动新 300ms 定时器
//   （停顿 300ms 后）→ 才真正执行搜索！
```

#### useIntersectionObserver（交叉观察器）的完整实现

💡 **大白话解释**：IntersectionObserver 就像门口的保安——他盯着某个区域，一旦有人（或元素）进入或离开这个区域，他就通知你。你可以用来实现"滚动到此处时加载图片"或"元素进入视口时播放动画"。

```jsx
import { useState, useEffect, useRef } from 'react';

/**
 * 交叉观察器 Hook
 * @param {Object} options - 配置选项
 * @param {number} options.threshold - 触发阈值（0-1），0.5 表示元素露出 50% 时触发
 * @param {string} options.rootMargin - 根元素边距，类似 CSS margin
 * @param {Element} options.root - 根元素，默认为浏览器视口
 * @returns {[React.RefObject, boolean]} [ref, isIntersecting]
 */
function useIntersectionObserver(options = {}) {
  const { threshold = 0, rootMargin = '0px', root = null } = options;
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting 表示元素是否在视口中
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();  // 清理：停止观察
    };
  }, [threshold, rootMargin, root]);

  return [ref, isIntersecting];
}

// 使用示例1：无限滚动（滚动到底部时加载更多）
function InfiniteList() {
  const [items, setItems] = useState(Array(20).fill(0));
  const [loadMoreRef, isBottom] = useIntersectionObserver({ threshold: 0 });

  useEffect(() => {
    if (isBottom) {
      // 用户滚动到底部，加载更多数据
      setItems(prev => [...prev, ...Array(20).fill(0)]);
    }
  }, [isBottom]);

  return (
    <div>
      {items.map((_, i) => <div key={i} style={{ height: 100 }}>Item {i}</div>)}
      <div ref={loadMoreRef}>加载中...</div>
    </div>
  );
}

// 使用示例2：懒加载图片
function LazyImage({ src, alt }) {
  const [imgRef, isVisible] = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);

  return (
    <div ref={imgRef} style={{ minHeight: 200, background: '#eee' }}>
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
        />
      )}
    </div>
  );
}
```

#### useFetch（数据获取）的完整实现——包含取消请求、缓存、重试

💡 **大白话解释**：一个生产级的 useFetch 就像一个高级快递服务——它能取消订单（取消请求）、记住之前的包裹（缓存）、寄丢了自动重发（重试），还会告诉你包裹的实时状态（loading/error/success）。

```jsx
import { useState, useEffect, useCallback, useRef } from 'react';

// 简单的内存缓存
const fetchCache = new Map();

/**
 * 生产级 useFetch Hook
 * @param {string} url - 请求地址
 * @param {Object} options - 配置选项
 * @param {boolean} options.enabled - 是否启用（用于条件性请求）
 * @param {number} options.retryCount - 失败重试次数
 * @param {number} options.cacheTime - 缓存时间（毫秒），0 表示不缓存
 * @param {Object} options.headers - 自定义请求头
 */
function useFetch(url, options = {}) {
  const {
    enabled = true,
    retryCount = 0,
    cacheTime = 5 * 60 * 1000, // 默认缓存 5 分钟
    headers = {},
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 用 ref 存储挂载状态，防止组件卸载后还在 setState
  const mountedRef = useRef(true);
  // 用 ref 存储当前请求的 AbortController
  const abortControllerRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchData = useCallback(async (retryLeft = retryCount) => {
    if (!url || !enabled) return;

    // 1. 检查缓存
    if (cacheTime > 0 && fetchCache.has(url)) {
      const cached = fetchCache.get(url);
      if (Date.now() - cached.timestamp < cacheTime) {
        if (mountedRef.current) {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }
      // 缓存过期，删除
      fetchCache.delete(url);
    }

    // 2. 取消上一个未完成的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...headers },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();

      // 3. 写入缓存
      if (cacheTime > 0) {
        fetchCache.set(url, { data: json, timestamp: Date.now() });
      }

      // 4. 只在组件还挂载时更新状态
      if (mountedRef.current) {
        setData(json);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      // 5. 被取消的请求不处理
      if (err.name === 'AbortError') return;

      // 6. 重试逻辑
      if (retryLeft > 0) {
        // 指数退避：等待 1s, 2s, 4s, 8s ...
        const waitTime = Math.pow(2, retryCount - retryLeft) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchData(retryLeft - 1);
      }

      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, [url, enabled, retryCount, cacheTime, headers]);

  useEffect(() => {
    fetchData();
    return () => {
      // 组件卸载时取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // 手动触发重新请求（忽略缓存）
  const refetch = useCallback(() => {
    fetchCache.delete(url);
    return fetchData();
  }, [fetchData, url]);

  // 清除缓存
  const clearCache = useCallback(() => {
    fetchCache.delete(url);
  }, [url]);

  return { data, loading, error, refetch, clearCache };
}

// 使用示例
function UserList() {
  const { data: users, loading, error, refetch } = useFetch('/api/users', {
    retryCount: 3,     // 失败重试 3 次
    cacheTime: 60000,  // 缓存 1 分钟
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <ul>{users?.map(u => <li key={u.id}>{u.name}</li>)}</ul>
    </div>
  );
}
```

#### useLocalStorage 的完整实现

💡 **大白话解释**：useLocalStorage 就像是给 React 的状态加了一个"自动存档功能"——每次状态变化时自动保存到 localStorage，下次打开页面时自动恢复，就像游戏存档一样。

```jsx
import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage 同步 Hook
 * @param {string} key - localStorage 的键名
 * @param {any} initialValue - 初始值（localStorage 中没有数据时使用）
 * @returns {[any, Function]} [storedValue, setValue]
 */
function useLocalStorage(key, initialValue) {
  // 惰性初始化：只在首次渲染时从 localStorage 读取
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`读取 localStorage key "${key}" 失败:`, error);
      return initialValue;
    }
  });

  // 当值变化时同步到 localStorage
  useEffect(() => {
    try {
      if (storedValue === undefined) {
        // 值为 undefined 时删除该 key
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`写入 localStorage key "${key}" 失败:`, error);
    }
  }, [key, storedValue]);

  // 支持函数式更新的 setValue
  const setValue = useCallback((value) => {
    setStoredValue(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      return newValue;
    });
  }, []);

  // 手动删除
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`删除 localStorage key "${key}" 失败:`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// 使用示例
function Settings() {
  const [theme, setTheme] = useLocalStorage('app-theme', 'light');
  const [fontSize, setFontSize] = useLocalStorage('font-size', 14);

  return (
    <div data-theme={theme}>
      <h2>设置</h2>
      <label>
        主题：
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </label>
      <label>
        字体大小：{fontSize}px
        <input
          type="range"
          min={12}
          max={24}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </label>
      <p>刷新页面后设置仍然保留！</p>
    </div>
  );
}
```

#### useMediaQuery 的完整实现

💡 **大白话解释**：useMediaQuery 就像是给 JavaScript 装了一双"响应式眼睛"——它能实时感知屏幕宽度的变化，就像 CSS 的 `@media` 查询一样，但可以在 JavaScript 逻辑中使用。

```jsx
import { useState, useEffect } from 'react';

/**
 * 媒体查询 Hook
 * @param {string} query - CSS 媒体查询字符串
 * @returns {boolean} 是否匹配
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    // 服务端渲染时默认返回 false（window 可能不存在）
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // 创建 MediaQueryList 对象
    const mediaQueryList = window.matchMedia(query);

    // 设置初始值
    setMatches(mediaQueryList.matches);

    // 监听变化
    const handleChange = (event) => {
      setMatches(event.matches);
    };

    // 使用 addEventListener（更现代的 API，removeEventListener 是对应的清理方法）
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

// 预定义的常用媒体查询 Hook
function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

function usePrefersDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// 使用示例
function ResponsiveHeader() {
  const isMobile = useIsMobile();
  const prefersDark = usePrefersDarkMode();

  return (
    <header className={prefersDark ? 'dark' : 'light'}>
      {isMobile ? (
        <MobileMenu />    // 移动端：汉堡菜单
      ) : (
        <DesktopNav />    // 桌面端：水平导航栏
      )}
    </header>
  );
}
```

---

### 4. 自定义 Hook 的测试策略

💡 **大白话解释**：测试 Hook 就像测试一台机器——你给它输入，观察输出是否正确。关键是让 Hook 在一个"模拟的组件环境"中运行，这样它内部的 useState、useEffect 等 React Hooks 才能正常工作。

#### 使用 renderHook 测试

```jsx
// React 官方推荐的测试工具（@testing-library/react 内置 renderHook）
import { renderHook, act, waitFor } from '@testing-library/react';

// 测试 useToggle
describe('useToggle', () => {
  it('初始值应该为 false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('toggle 应该切换值', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[1]();  // 调用 toggle
    });
    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();  // 再次 toggle
    });
    expect(result.current[0]).toBe(false);
  });
});

// 测试 useCounter
describe('useCounter', () => {
  it('increment 应该增加计数', () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);

    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(3);
  });
});
```

#### 测试异步 Hook

```jsx
import { renderHook, act, waitFor } from '@testing-library/react';

// 测试 useFetch（需要 mock fetch API）
describe('useFetch', () => {
  // 在所有测试前 mock 全局 fetch
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('应该获取数据并更新状态', async () => {
    const mockData = [{ id: 1, name: 'Alice' }];
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useFetch('/api/users'));

    // 初始状态应该是 loading
    expect(result.current.loading).toBe(true);

    // 等待异步操作完成
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('应该处理错误', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/api/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeNull();
  });
});
```

#### 测试带定时器的 Hook（useDebounce）

```jsx
import { renderHook, act } from '@testing-library/react';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();  // 使用假定时器，让时间可控
  });

  afterEach(() => {
    jest.useRealTimers();  // 恢复真实定时器
  });

  it('应该在延迟后才更新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    // 初始值
    expect(result.current).toBe('hello');

    // 立即更新输入值
    rerender({ value: 'hello world', delay: 500 });
    // 还没到 500ms，值应该没变
    expect(result.current).toBe('hello');

    // 快进 499ms
    act(() => { jest.advanceTimersByTime(499); });
    expect(result.current).toBe('hello');  // 还是没变

    // 快进到 500ms
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('hello world');  // ✅ 现在更新了！
  });

  it('快速连续变化时应该只保留最后一次', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    // 快速连续输入
    rerender({ value: 'ab' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'abc' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'abcd' });
    act(() => { jest.advanceTimersByTime(100); });

    // 300ms 总共过了 300ms，但最后一次输入才过了 100ms
    expect(result.current).toBe('a');  // 还没更新

    // 再过 200ms（距离最后一次输入 300ms）
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe('abcd');  // ✅ 最终更新为 'abcd'
  });
});
```

#### Mock 外部依赖

```jsx
import { renderHook, act } from '@testing-library/react';

// 测试 useLocalStorage
describe('useLocalStorage', () => {
  beforeEach(() => {
    // Mock localStorage
    const store = {};
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => store[key] ?? null
    );
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => { store[key] = value; }
    );
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key) => { delete store[key]; }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('应该从 localStorage 读取初始值', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));

    const { result } = renderHook(() => useLocalStorage('theme', 'light'));
    expect(result.current[0]).toBe('dark');
  });

  it('应该在值变化时写入 localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'light'));

    act(() => {
      result.current[1]('dark');  // setValue('dark')
    });

    expect(result.current[0]).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', JSON.stringify('dark'));
  });
});
```

```
测试策略总结：
┌──────────────────────────────────────────────────────────┐
│ Hook 类型          │ 测试工具                              │
├──────────────────────────────────────────────────────────┤
│ 同步 Hook          │ renderHook + act + expect            │
│ 异步 Hook          │ renderHook + waitFor + mock fetch     │
│ 定时器 Hook        │ jest.useFakeTimers + advanceTimers   │
│ DOM 相关 Hook      │ renderHook + jest.spyOn(HTMLElement) │
│ 有外部依赖的 Hook   │ jest.mock() + jest.spyOn()          │
└──────────────────────────────────────────────────────────┘
```

---

[→ 12 - Context API](../12-context-api/)
