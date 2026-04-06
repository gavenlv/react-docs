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

[→ 12 - Context API](../12-context-api/)
