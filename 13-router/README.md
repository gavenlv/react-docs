# 13 - 路由管理 (React Router)

## 🎯 本节目标
- 理解前端路由的概念和原理
- 掌握 React Router v6 的核心 API
- 学会实现动态路由、嵌套路由、保护路由
- 处理常见的路由场景

---

## 📖 前端路由基础

### 什么是前端路由？
根据不同的 URL 路径渲染不同的组件，而不需要向服务器请求新页面。

### 路由模式

| 模式 | 特点 | URL 示例 |
|------|------|----------|
| **Hash** | 兼容性好，`#` 后面是路径 | `/#/home` |
| **History**（推荐） | URL 更美观，需要服务器配置 | `/home` |
| **Memory** | 不改变 URL，用于测试/非浏览器环境 | 无变化 |

---

## 🚀 React Router 快速开始

### 安装

```bash
npm install react-router-dom@6
# 或
yarn add react-router-dom@6
```

### 基本使用

```jsx
// main.jsx 或 index.jsx
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```jsx
// App.jsx
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <>
      {/* 导航链接 */}
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/contact">联系</Link>
      </nav>
      
      {/* 路由匹配区域 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
```

---

## 🔧 核心组件与 Hooks

### 1. Routes & Route

```jsx
<Routes>
  {/* 精确匹配路径 */}
  <Route path="/" element={<Home />} />
  
  {/* 动态参数 */}
  <Route path="/users/:userId" element={<UserProfile />} />
  
  {/* 可选参数 */}
  <Route path="/posts/:postId?" element={<Post />} />
  
  {/* 通配符（404 页面） */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 2. Link vs NavLink

**Link**: 基本导航链接，不会触发页面刷新

```jsx
<Link to="/about">关于我们</Link>

// 带状态的对象形式
<Link 
  to={{
    pathname: '/users/123',
    search: '?tab=profile',
    hash: '#section1',
    state: { from: 'dashboard' }
  }}
>
  用户详情
</Link>
```

**NavLink**: 带激活状态的链接

```jsx
<NavLink
  to="/dashboard"
  className={({ isActive }) => isActive ? 'active' : ''}
  style={({ isActive }) => ({
    color: isActive ? 'red' : 'blue',
    fontWeight: isActive ? 'bold' : 'normal'
  })}
>
  仪表盘
</NavLink>

// end 属性：确保精确匹配
<NavLink to="/users" end>用户列表</NavLink>  {/* /users 激活，但 /users/123 不激活 */}
```

### 3. Navigate - 编程式导航

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  
  const handleLogin = async (credentials) => {
    await api.login(credentials);
    
    // 导航到首页
    navigate('/');
    
    // 替换当前历史记录（不能后退）
    navigate('/dashboard', { replace: true });
    
    // 带状态导航
    navigate('/success', { state: { message: '登录成功' } });
    
    // 返回上一页
    navigate(-1);
    
    // 相对导航
    navigate('..');  // 上一层
    navigate('../sibling');  // 同级路由
  };
}
```

### 4. useParams - 获取 URL 参数

```jsx
function UserProfile() {
  // URL: /users/123
  const { userId } = useParams();
  
  useEffect(() => {
    fetchUser(userId);
  }, [userId]);
  
  return <div>User ID: {userId}</div>;
}

// 多个参数
<Route path="/users/:userId/posts/:postId" element={<UserPost />} />

function UserPost() {
  const { userId, postId } = useParams();  // { userId: '123', postId: '456' }
}
```

### 5. useSearchParams - 查询参数

```jsx
function SearchResults() {
  // URL: /search?q=react&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q');       // 'react'
  const page = searchParams.get('page');     // '2'
  const allParams = Object.fromEntries(searchParams);  // { q: 'react', page: '2' }
  
  // 更新查询参数（保留其他参数）
  const updateSearch = (newQuery) => {
    setSearchParams(prev => {
      prev.set('q', newQuery);
      return prev;
    });
  };
  
  return (
    <div>
      <input 
        value={query || ''} 
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="搜索..."
      />
      <p>第 {page || 1} 页</p>
    </div>
  );
}
```

### 6. useLocation - 当前位置信息

```jsx
function CurrentLocationInfo() {
  const location = useLocation();
  
  console.log(location.pathname);   // '/users/123?tab=profile'
  console.log(location.search);    // '?tab=profile'
  console.log(location.hash);      // '#section1'
  console.log(location.state);     // { from: 'dashboard' }
  console.log(location.key);       // 唯一标识符
  
  return null;  // 用于监听位置变化的副作用
}

// 监听路由变化
useEffect(() => {
  // 每次 location 变化时执行
  analytics.trackPageView(location.pathname);
}, [location]);
```

---

## 🏗️ 高级路由配置

### 嵌套路由（Nested Routes）

```jsx
// App.jsx
<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    {/* 嵌套路由会渲染在 AdminLayout 的 Outlet 中 */}
    <Route path="" element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="settings" element={<AdminSettings />} />
  </Route>
</Routes>

// AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside>
        <nav>
          <Link to="">仪表盘</Link>
          <Link to="users">用户管理</Link>
          <Link to="settings">系统设置</Link>
        </nav>
      </aside>
      
      {/* 嵌套路由的渲染出口 */}
      <main>
        <Outlet />  
        {/* 这里会显示 Dashboard/Users/Settings 组件 */}
      </main>
    </div>
  );
}
```

### 布局路由（Layout Route）

```jsx
<Routes>
  {/* 公共布局 */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
  
  {/* 认证后的布局 */}
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
</Routes>
```

### 保护路由（Protected/Auth Route）

```jsx
// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // 保存原始目标地址，登录后跳转回来
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

// 使用
<Routes>
  <Route path="/login" element={<Login />} />
  
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  
  <Route
    path="/settings"
    element={
      <ProtectedRoute requiredRole="admin">
        <Settings />
      </ProtectedRoute>
    }
  />
</Routes>

// Login.jsx 中处理重定向
function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || '/';
  
  const handleLoginSuccess = () => {
    navigate(from, { replace: true });  // 登录后回到原页面
  };
}
```

### 权限路由（基于角色的访问控制）

```jsx
// components/RoleBasedRoute.jsx
function RoleBasedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <UnauthorizedPage />;  // 403 页面
  }
  
  return children;
}

// 使用
<Route
  path="/admin"
  element={
    <RoleBasedRoute allowedRoles={['admin', 'superadmin']}>
      <AdminPanel />
    </RoleBasedRoute>
  }
/>
```

---

## ⚡ 路由优化技巧

### 1. 懒加载（代码分割）

```jsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. 预加载路由

```jsx
// 鼠标悬停时预加载
<Link 
  to="/dashboard"
  onMouseEnter={() => import('./pages/Dashboard')}
>
  Dashboard
</Link>
```

### 3. 404 和错误处理

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  
  {/* 404 - 必须放在最后 */}
  <Route path="*" element={<NotFound />} />
</Routes>

// NotFound.jsx
function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>页面未找到</p>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  );
}
```

---

## 🎨 实战示例：完整的应用路由架构

```jsx
// routers/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

// 懒加载页面
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // 公开路由
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      
      // 受保护的路由
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>,
      },
      
      // 404
      { path: '*', element: <NotFound /> }
    ]
  }
]);

export default router;

// main.jsx
import router from './routers';
import { RouterProvider } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
```

---

## ✅ 阶段检查清单

- [ ] 理解前端路由的概念和工作原理
- [ ] 能够配置基本路由和导航
- [ ] 掌握动态参数和查询参数的获取
- [ ] 实现嵌套路由和布局路由
- [ ] 创建受保护和权限控制的路由
- [ ] 了解路由懒加载和性能优化

---

## 📝 练习任务

1. **博客应用路由**: 包含首页、文章详情、分类、搜索结果页
2. **电商后台路由**: 多级嵌套布局、权限控制、面包屑导航

---

[→ 14 - 状态管理进阶](../14-state-management/)
