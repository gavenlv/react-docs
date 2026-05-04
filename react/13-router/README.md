# 13 - 路由管理 (React Router)

## 🎯 本节目标
- 理解前端路由的概念和原理
- 掌握 React Router v6 的核心 API
- 学会实现动态路由、嵌套路由、保护路由
- 处理常见的路由场景

---

## 📖 前端路由基础

### 🔍 是什么？什么是前端路由？

> **通俗理解**：想象你去一栋大楼办事。这栋大楼有很多房间（页面），你可以走**走廊**（URL 地址）找到不同的房间。
>
> - **传统方式**（后端路由）：每次换房间，你都要**下楼跑到前台**，告诉前台你要去哪个房间，前台再带你上去。也就是说，每次点链接，浏览器都会向服务器请求一个**全新的页面**，页面会**整体刷新**（白屏一闪）。
>
> - **前端路由**：大楼里安装了**电子导航屏**，你自己就能在走廊里切换房间，不需要每次都跑前台了。也就是说，浏览器**不会刷新整个页面**，只替换页面中的部分内容，用户体验就像手机 App 一样流畅。

**前端路由的核心**：监听 URL 地址的变化，根据不同的 URL 路径，**渲染不同的 React 组件**，而不是向服务器请求新页面。

### ❓ 为什么需要前端路由？

| 对比项 | 传统后端路由 | 前端路由 |
|--------|-------------|---------|
| **页面切换** | 整页刷新，白屏闪烁 | 局部更新，丝滑流畅 |
| **速度** | 慢（每次都要下载整个页面） | 快（只加载需要的部分） |
| **用户体验** | 差（有明显的加载等待） | 好（像手机 App 一样） |
| **服务器压力** | 大（每次请求都要返回完整 HTML） | 小（首次加载后，服务器只需返回数据） |

> **类比**：传统路由就像看纸质书，翻页时要手动翻过去；前端路由就像看电子书，滑动一下就切换了内容，没有任何停顿。

### ⚙️ 内涵/原理：前端路由是怎么工作的？

前端路由有两种实现方式，对应两种路由模式：

#### 1. Hash 模式

**原理**：利用 URL 中的 `#`（hash）部分。当 hash 变化时，浏览器**不会向服务器发送请求**，但会触发 `hashchange` 事件。前端通过监听这个事件来切换页面内容。

```
URL 示例：https://example.com/#/home
                      ^^^^^^^^
                      这部分变化不会触发页面刷新
```

**工作流程**：
1. 用户点击 `<a href="#/about">关于</a>`
2. 浏览器地址栏的 hash 从 `#/home` 变为 `#/about`
3. 浏览器触发 `hashchange` 事件
4. 前端监听到事件，匹配到 `/about` 路径
5. 渲染 `<About />` 组件，替换掉之前的 `<Home />` 组件

**优点**：兼容性极好，所有浏览器都支持，不需要服务器配置。

**缺点**：URL 不太美观（带 `#`），SEO 不友好（搜索引擎可能忽略 hash 后的内容）。

#### 2. History 模式（推荐）

**原理**：使用 HTML5 的 `history.pushState()` 和 `history.replaceState()` API。这两个方法可以**改变 URL 而不刷新页面**。通过监听 `popstate` 事件来处理浏览器的前进/后退按钮。

```
URL 示例：https://example.com/home
                   ^^^^^
                   干净的 URL，和传统网页一样
```

**工作流程**：
1. 用户点击导航链接
2. 调用 `history.pushState(null, '', '/about')` —— URL 变了但页面没刷新
3. 前端匹配到 `/about` 路径
4. 渲染 `<About />` 组件

**优点**：URL 美观，对 SEO 友好。

**缺点**：需要服务器配置（否则直接访问子路径会返回 404），兼容性略差（IE10+）。

#### 3. Memory 模式

**原理**：路由状态保存在内存中，URL 完全不变。适用于非浏览器环境或特殊场景。

**典型场景**：单元测试中模拟路由跳转。

### 路由模式对比

| 模式 | 特点 | URL 示例 | 兼容性 | 需要服务器配置 |
|------|------|----------|--------|--------------|
| **Hash** | 兼容性好，`#` 后面是路径 | `/#/home` | 所有浏览器 | 不需要 |
| **History**（推荐） | URL 更美观，需要服务器配置 | `/home` | IE10+ | 需要 |
| **Memory** | 不改变 URL，用于测试/非浏览器环境 | 无变化 | - | 不需要 |

> **新手建议**：开发时直接使用 History 模式（BrowserRouter），这是最主流的选择。

---

## 🚀 React Router 快速开始

### 安装

```bash
# 安装 React Router（当前最新版本是 v6）
npm install react-router-dom@6
# 或者使用 yarn
yarn add react-router-dom@6
```

> **说明**：`react-router-dom` 是专门给浏览器端用的包。如果是 React Native，就用 `react-router-native`。

### 怎么用？基本使用

使用 React Router 只需要 **3 步**：

**第一步：在入口文件包裹 `BrowserRouter`**

```jsx
// main.jsx 或 index.jsx —— 这是整个应用的入口文件
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// BrowserRouter 就像一个"路由管家"
// 它必须包裹在最外层，这样所有子组件才能使用路由功能
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

> **类比**：`BrowserRouter` 就像大楼的**走廊系统**，把它装好后，里面所有的房间（组件）才能通过地址找到。

**第二步：在 App 中定义导航链接和路由规则**

```jsx
// App.jsx —— 应用的主组件
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <>
      {/* 导航链接 —— 类似于大楼里的楼层指示牌 */}
      <nav>
        {/* 
          Link 组件和普通的 <a> 标签很像
          但它不会刷新页面！只是改变了 URL 并切换显示的组件
        */}
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
        <Link to="/contact">联系</Link>
      </nav>
      
      {/* 路由匹配区域 —— 类似于大楼里的房间分配表 */}
      {/* 
        Routes 组件会检查当前 URL
        然后找到匹配的 Route，渲染对应的组件
      */}
      <Routes>
        {/* 
          path: URL 路径
          element: 要渲染的组件
          当 URL 是 "/" 时，显示 <Home /> 组件
        */}
        <Route path="/" element={<Home />} />
        {/* 当 URL 是 "/about" 时，显示 <About /> 组件 */}
        <Route path="/about" element={<About />} />
        {/* 当 URL 是 "/contact" 时，显示 <Contact /> 组件 */}
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
```

> **注意**：千万不要用普通的 `<a href="...">` 来做导航！`<a>` 标签会刷新整个页面，失去 SPA 的优势。始终使用 `<Link>` 组件。

### ❌ 不用路由 vs ✅ 用路由的对比

```jsx
// ❌ 不用路由：用条件渲染模拟多页面
// 问题：URL 不会变，无法通过链接分享特定页面，浏览器的前进/后退按钮无效
function App() {
  const [page, setPage] = useState('home');

  return (
    <>
      <nav>
        <button onClick={() => setPage('home')}>首页</button>
        <button onClick={() => setPage('about')}>关于</button>
      </nav>
      {page === 'home' && <Home />}
      {page === 'about' && <About />}
    </>
  );
}

// ✅ 用路由：专业的前端路由方案
// 好处：URL 会变化，可以分享链接，前进/后退按钮有效，支持浏览器刷新
function App() {
  return (
    <>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}
```

---

## 🔧 核心组件与 Hooks

### 1. Routes & Route —— 路由规则定义

> **通俗理解**：`Routes` 就像一本**字典**，`Route` 就是字典里的**词条**。浏览器根据当前 URL 去字典里查找，找到哪个词条就渲染哪个组件。

```jsx
<Routes>
  {/* 精确匹配路径 */}
  <Route path="/" element={<Home />} />
  
  {/* 动态参数：冒号 : 后面的部分是变量，可以匹配任意值 */}
  {/* URL /users/123 → userId 的值是 "123" */}
  {/* URL /users/456 → userId 的值是 "456" */}
  <Route path="/users/:userId" element={<UserProfile />} />
  
  {/* 可选参数：问号 ? 表示这个参数可以没有 */}
  {/* URL /posts → postId 是 undefined */}
  {/* URL /posts/1 → postId 是 "1" */}
  <Route path="/posts/:postId?" element={<Post />} />
  
  {/* 通配符（404 页面）：星号 * 匹配所有路径 */}
  {/* 如果以上所有路由都没匹配上，就显示 NotFound 页面 */}
  {/* ⚠️ 必须放在所有 Route 的最后！ */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**⚠️ 常见错误**：忘记把 `path="*"` 放在最后。React Router 是从上往下匹配的，如果 `*` 放在第一个，所有请求都会命中它！

### 2. Link vs NavLink —— 导航链接

> **通俗理解**：`Link` 是普通的链接，就像走廊里的指示牌；`NavLink` 是**智能链接**，能自动知道"当前你在哪个房间"，并给自己加上高亮样式（比如把文字变成红色）。

**Link**: 基本导航链接，不会触发页面刷新

```jsx
// 最简单的用法：to 属性指定目标路径
<Link to="/about">关于我们</Link>

// 带查询参数的写法
<Link 
  to={{
    pathname: '/users/123',   // 路径
    search: '?tab=profile',   // 查询参数（问号后面的部分）
    hash: '#section1',        // 锚点（# 后面的部分）
    state: { from: 'dashboard' }  // 隐式传递的状态数据（不会显示在 URL 中）
  }}
>
  用户详情
</Link>
```

**NavLink**: 带激活状态的链接

```jsx
{/* 
  NavLink 比 Link 多了一个超能力：
  当当前 URL 匹配 to 属性时，会自动添加激活样式
  这对于"导航栏"来说非常实用！
*/}
<NavLink
  to="/dashboard"
  // className 可以是一个函数，接收 { isActive } 参数
  // isActive 为 true 时，说明当前页面就是这个链接的页面
  className={({ isActive }) => isActive ? 'active' : ''}
  // style 也可以是函数，动态设置样式
  style={({ isActive }) => ({
    color: isActive ? 'red' : 'blue',      // 当前页用红色，其他页用蓝色
    fontWeight: isActive ? 'bold' : 'normal' // 当前页加粗
  })}
>
  仪表盘
</NavLink>

// end 属性：确保精确匹配
// 没有 end：URL /users 会匹配 /users，也会匹配 /users/123
// 有 end：URL /users 只匹配 /users，不会匹配 /users/123
<NavLink to="/users" end>用户列表</NavLink>
```

### 3. Navigate —— 编程式导航

> **通俗理解**：`Link` 和 `NavLink` 是**声明式**导航（写在 JSX 模板里）；而 `Navigate` 和 `useNavigate` 是**命令式**导航（写在 JavaScript 代码里，通常在某个事件触发后才跳转）。

> **类比**：`Link` 就像路标，指明方向；`useNavigate` 就像**自动门**，检测到条件满足后自动带你走。

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();  // 获取导航函数
  
  const handleLogin = async (credentials) => {
    await api.login(credentials);  // 调用登录接口
    
    // 方式一：普通跳转（用户可以按浏览器后退按钮返回）
    navigate('/');
    
    // 方式二：替换当前历史记录（用户按后退按钮不会回到登录页）
    navigate('/dashboard', { replace: true });
    
    // 方式三：带状态跳转（可以在目标页面通过 useLocation 获取这些数据）
    navigate('/success', { state: { message: '登录成功' } });
    
    // 方式四：返回上一页（和浏览器后退按钮效果一样）
    navigate(-1);
    
    // 方式五：相对导航（基于当前路径）
    navigate('..');       // 返回上一层
    navigate('../sibling'); // 跳到同级路由
  };
}
```

**`<Navigate>` 组件**（用于条件重定向）：

```jsx
// 当组件渲染时，立即重定向到指定路径
// 常用在"用户已登录时跳转到首页"的场景
function Login() {
  const { isAuthenticated } = useAuth();
  
  // 如果已经登录了，直接跳转到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <LoginForm />;
}
```

### 4. useParams —— 获取 URL 中的动态参数

> **通俗理解**：URL 中的动态参数就像**快递单号**，`useParams` 帮你从 URL 中"提取"出这个单号。

```jsx
function UserProfile() {
  // URL: /users/123
  // 路由定义: <Route path="/users/:userId" element={<UserProfile />} />
  // useParams() 会返回 { userId: '123' }
  const { userId } = useParams();
  
  useEffect(() => {
    // 用提取到的 userId 去服务器获取用户数据
    fetchUser(userId);
  }, [userId]);
  
  return <div>User ID: {userId}</div>;
}

// 多个参数的情况
// 路由定义: <Route path="/users/:userId/posts/:postId" element={<UserPost />} />
// URL: /users/123/posts/456
function UserPost() {
  const { userId, postId } = useParams();  // { userId: '123', postId: '456' }
}
```

### 5. useSearchParams —— 获取和修改查询参数

> **通俗理解**：查询参数就是 URL 中 `?` 后面的部分，比如 `?q=react&page=2`。这就像在图书馆**搜索书籍**时，你填的搜索关键词和页码。

```jsx
function SearchResults() {
  // URL: /search?q=react&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 获取参数值
  const query = searchParams.get('q');       // 'react'
  const page = searchParams.get('page');     // '2'
  
  // 将所有参数转换为普通对象
  const allParams = Object.fromEntries(searchParams);  // { q: 'react', page: '2' }
  
  // 更新查询参数（保留其他参数不变）
  const updateSearch = (newQuery) => {
    setSearchParams(prev => {
      prev.set('q', newQuery);  // 修改 q 参数
      return prev;              // 返回修改后的对象
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

> **实际应用**：搜索页面、筛选排序、分页功能都大量使用查询参数。好处是用户可以把带参数的 URL **分享给别人**，别人打开就能看到同样的结果。

### 6. useLocation —— 获取当前位置信息

> **通俗理解**：`useLocation` 就像手机的 GPS，随时告诉你"你现在在哪里"。

```jsx
function CurrentLocationInfo() {
  const location = useLocation();
  
  console.log(location.pathname);   // '/users/123' —— 当前路径
  console.log(location.search);     // '?tab=profile' —— 查询参数字符串
  console.log(location.hash);       // '#section1' —— 锚点
  console.log(location.state);      // { from: 'dashboard' } —— 通过 navigate 传递的状态
  console.log(location.key);        // 'default' —— 唯一标识符（每次导航都不同）
  
  return null;
}

// 实际应用场景：每次路由变化时记录页面访问统计
useEffect(() => {
  analytics.trackPageView(location.pathname);  // 告诉统计系统"用户访问了这个页面"
}, [location]);  // location 变化时执行
```

---

## 🏗️ 高级路由配置

### 嵌套路由（Nested Routes）

> **通俗理解**：嵌套路由就像**大楼里有子走廊**。比如 `/admin` 是管理后台的大走廊，里面还有 `/admin/users`（用户管理房间）和 `/admin/settings`（设置房间）。
>
> **好处**：多个页面共享同一个布局（比如侧边栏、顶部导航），不需要每个页面都重复写。

```jsx
// App.jsx —— 定义嵌套路由
<Routes>
  {/* /admin 路径匹配时，渲染 AdminLayout 组件 */}
  <Route path="/admin" element={<AdminLayout />}>
    {/* 
      这些是嵌套在 /admin 下的子路由
      /admin → 渲染 AdminDashboard
      /admin/users → 渲染 AdminUsers
      /admin/settings → 渲染 AdminSettings
    */}
    <Route path="" element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="settings" element={<AdminSettings />} />
  </Route>
</Routes>

// AdminLayout.jsx —— 管理后台的公共布局
import { Outlet, Link } from 'react-router-dom';

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* 侧边栏 —— 所有管理页面都共用 */}
      <aside>
        <nav>
          <Link to="">仪表盘</Link>
          <Link to="users">用户管理</Link>
          <Link to="settings">系统设置</Link>
        </nav>
      </aside>
      
      {/* 
        Outlet 就像一个"插槽"
        子路由匹配到的组件会渲染在这里
        比如访问 /admin/users 时，AdminUsers 组件就会出现在这里
      */}
      <main>
        <Outlet />  
        {/* 这里会显示 Dashboard/Users/Settings 组件 */}
      </main>
    </div>
  );
}
```

> **类比**：`<Outlet>` 就像相框里的**空白区域**，子路由的组件就是**照片**，可以随时换不同的照片放进去。

### 布局路由（Layout Route）

> **通俗理解**：不同类型的页面可能有**不同的布局**。比如登录页面不需要侧边栏，但后台管理页面需要。布局路由就是根据不同的页面类型，套上不同的"外壳"。

```jsx
<Routes>
  {/* 公共布局 —— 用于登录页、注册页等（没有侧边栏） */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>
  
  {/* 认证后的布局 —— 用于后台页面（有侧边栏、顶部栏） */}
  <Route element={<ProtectedLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>
```

### 保护路由（Protected/Auth Route）

> **通俗理解**：保护路由就像**门禁系统**。没有登录的用户试图访问 `/dashboard` 时，会被自动"拦截"并重定向到 `/login` 登录页。登录成功后，再自动跳回原来想去的页面。

```jsx
// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();  // 记住用户原来想去哪个页面

  // 正在检查登录状态时，显示加载动画
  if (loading) {
    return <LoadingSpinner />;
  }

  // 如果没有登录，跳转到登录页
  if (!isAuthenticated) {
    // state.from 保存了原始目标地址
    // 登录成功后可以用这个信息跳转回来
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 已登录，正常渲染子组件
  return children;
}

// 使用保护路由
<Routes>
  <Route path="/login" element={<Login />} />
  
  {/* Dashboard 被 ProtectedRoute 包裹，未登录用户无法访问 */}
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
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />
</Routes>

// Login.jsx 中 —— 登录成功后跳回原页面
function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  // 如果有来源地址就用来源地址，否则默认跳到首页
  const from = location.state?.from || '/';
  
  const handleLoginSuccess = () => {
    // replace: true 表示替换当前历史记录
    // 这样用户按后退按钮不会回到登录页
    navigate(from, { replace: true });
  };
}
```

> **实际应用场景**：几乎所有需要登录的网站都有保护路由。比如你直接访问 `https://mail.qq.com/inbox`，如果没有登录，会被重定向到登录页，登录成功后自动跳到收件箱。

### 权限路由（基于角色的访问控制）

> **通俗理解**：不仅检查"你有没有登录"，还要检查"你有没有权限"。比如普通用户不能访问管理后台，只有管理员可以。

```jsx
// components/RoleBasedRoute.jsx
function RoleBasedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;  // 未登录 → 登录页
  }
  
  if (!allowedRoles.includes(user?.role)) {
    return <UnauthorizedPage />;  // 登录了但没权限 → 403 页面
  }
  
  return children;  // 登录了且有权限 → 正常显示
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

> **通俗理解**：一开始只加载首页需要的代码，其他页面的代码等用户**真正访问时才下载**。就像看视频时，不是一次性下载全部，而是边看边加载。

> **好处**：首屏加载速度大幅提升，用户不用等所有页面的代码都下载完才能看到首页。

```jsx
import { lazy, Suspense } from 'react';

// lazy 接收一个函数，这个函数动态 import() 一个组件文件
// 这样这个组件的代码会被打包成单独的文件，不会包含在主包里
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    {/* 
      Suspense 是 React 内置组件
      fallback 指定在懒加载组件还没下载完时显示什么（通常是 loading 动画）
    */}
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

> **通俗理解**：用户**还没点**链接，但鼠标**悬停**在上面时，就**提前下载**对应页面的代码。等用户真正点击时，页面瞬间显示。

```jsx
// 鼠标悬停时预加载对应组件
<Link 
  to="/dashboard"
  onMouseEnter={() => import('./pages/Dashboard')}  // 鼠标移上去就开始下载
>
  Dashboard
</Link>
```

### 3. 404 和错误处理

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  
  {/* 404 页面 —— 必须放在所有 Route 的最后！ */}
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

> 下面展示一个**生产级别**的路由配置，综合运用了懒加载、嵌套路由、保护路由等所有知识点。

```jsx
// routers/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';

// 懒加载页面 —— 每个页面打包成独立文件，按需加载
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Settings = lazy(() => import('../pages/Settings'));
const NotFound = lazy(() => import('../pages/NotFound'));

// 创建路由配置对象
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,        // 所有页面的公共布局
    errorElement: <ErrorBoundary />,  // 路由级别的错误边界
    children: [
      // 公开路由 —— 不需要登录就能访问
      { index: true, element: <Home /> },             // index: true 表示默认子路由
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      
      // 受保护的路由 —— 必须登录才能访问
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
      
      // 404 页面
      { path: '*', element: <NotFound /> }
    ]
  }
]);

export default router;

// main.jsx —— 使用 RouterProvider 渲染
import router from './routers';
import { RouterProvider } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);
```

---

## ⚠️ 常见错误

### 错误 1：在 `BrowserRouter` 外面使用路由 Hooks

```jsx
// ❌ 错误：App 没有被 BrowserRouter 包裹
function App() {
  const navigate = useNavigate();  // 💥 报错：useNavigate() may be used only in the context of a <Router>
  return <div>Hello</div>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// ✅ 正确：用 BrowserRouter 包裹
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

### 错误 2：`path="*"` 没有放在最后

```jsx
// ❌ 错误：* 放在前面，所有请求都被它拦截了
<Routes>
  <Route path="*" element={<NotFound />} />
  <Route path="/" element={<Home />} />       {/* 永远不会匹配到 */}
  <Route path="/about" element={<About />} /> {/* 永远不会匹配到 */}
</Routes>

// ✅ 正确：* 放在最后作为兜底
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} />  {/* 只有以上都不匹配时才到这里 */}
</Routes>
```

### 错误 3：用 `<a>` 标签代替 `<Link>`

```jsx
// ❌ 错误：<a> 标签会刷新整个页面
<a href="/about">关于</a>

// ✅ 正确：<Link> 不会刷新页面
<Link to="/about">关于</Link>
```

### 错误 4：嵌套路由忘记写 `<Outlet />`

```jsx
// ❌ 错误：AdminLayout 没有 Outlet，子路由的组件无处渲染
function AdminLayout() {
  return <aside>...</aside>;  // 子页面内容不会显示！
}

// ✅ 正确：必须有 Outlet 来"接住"子路由的组件
function AdminLayout() {
  return (
    <div>
      <aside>...</aside>
      <main><Outlet /></main>  {/* 子路由组件渲染在这里 */}
    </div>
  );
}
```

---

## 💡 最佳实践

1. **始终使用 `<Link>` 而不是 `<a>` 标签** —— 避免页面刷新
2. **路由懒加载** —— 把每个页面组件用 `lazy()` 包裹，提升首屏速度
3. **`<Suspense>` 的 fallback 要轻量** —— 不要在 fallback 里引入大型依赖
4. **`path="*"` 放在最后** —— 确保它只作为兜底路由
5. **嵌套路由记得写 `<Outlet />`** —— 否则子路由组件不会渲染
6. **使用 `createBrowserRouter` 而不是 `<BrowserRouter>`** —— v6 推荐的数据路由方式，支持更多高级功能（如 loader、action）
7. **为保护路由添加 loading 状态** —— 避免登录状态检查完成前的闪烁

---

## ✅ 阶段检查清单

- [ ] 理解前端路由的概念和工作原理（Hash 模式 vs History 模式）
- [ ] 能够配置基本路由和导航（Link、NavLink、Routes、Route）
- [ ] 掌握动态参数（useParams）和查询参数（useSearchParams）的获取
- [ ] 理解编程式导航（useNavigate）的使用场景
- [ ] 实现嵌套路由和布局路由
- [ ] 创建受保护和权限控制的路由
- [ ] 了解路由懒加载和性能优化
- [ ] 能避免常见的路由使用错误

---

## 📝 练习任务

### 练习 1：博客应用路由（基础）
创建一个博客应用的路由系统，包含：
- 首页 `/` —— 显示所有文章列表
- 文章详情 `/posts/:id` —— 显示单篇文章
- 分类页面 `/category/:name` —— 按分类筛选文章
- 搜索结果页 `/search?q=关键词` —— 显示搜索结果

**提示**：需要用到 `useParams` 获取文章 ID、`useSearchParams` 获取搜索关键词。

### 练习 2：电商后台路由（进阶）
创建一个电商后台管理系统的路由：
- 多级嵌套布局（侧边栏 + 顶部栏 + 内容区）
- 公开页面（登录、注册）和受保护页面（管理后台）
- 权限控制（普通员工不能访问系统设置页）
- 面包屑导航（根据当前路径自动生成）
- 所有路由都使用懒加载

**提示**：需要用到嵌套路由、保护路由、权限路由、`useLocation`。

---

## 🔬 React Router 的底层原理

### 1. 前端路由的本质

#### Hash 路由 vs History 路由的原理

两种路由模式的核心区别在于**如何让浏览器"记住"页面变化但不刷新**：

```
Hash 路由（# 模式）：
┌──────────────────────────────────────────────┐
│  URL: https://example.com/#/about            │
│                              ^^^^^^^         │
│                              hash 部分        │
│                                               │
│  浏览器行为：                                  │
│  1. hash 变化 → 浏览器不发送请求到服务器       │
│  2. 触发 hashchange 事件                       │
│  3. JS 监听事件 → 匹配路径 → 渲染组件         │
│                                               │
│  特点：服务器完全不知道 # 后面是什么           │
└──────────────────────────────────────────────┘

History 路由（pushState 模式）：
┌──────────────────────────────────────────────┐
│  URL: https://example.com/about               │
│                          ^^^^^               │
│                          正常路径              │
│                                               │
│  浏览器行为：                                  │
│  1. JS 调用 pushState → URL 变了但没刷新      │
│  2. 需要自己监听 popstate 事件（前进/后退）   │
│  3. 点击链接需要 preventDefault + pushState    │
│                                               │
│  特点：URL 干净美观，但需要服务器配合           │
└──────────────────────────────────────────────┘
```

> 💡 **大白话**：Hash 路由就像在信封上贴了张便签——邮局（服务器）不看便签内容。History 路由就像直接改了收件人地址——需要邮局也知道这个新地址存在（服务器配置 fallback）。

#### window.history API 详解

History API 是前端路由的基石，它提供了 3 个关键方法和 1 个事件：

```javascript
// ====== pushState：添加一条新的历史记录 ======
// 就像在浏览器历史记录里"插入"了一页
history.pushState(state, title, url);

// 参数说明：
// state: 可以附带数据（容量约 5MB），目标页面可以通过 history.state 读取
// title: 目前大多数浏览器忽略这个参数（留空字符串即可）
// url: 新的 URL（必须同源）

// 实际使用示例：
history.pushState({ from: 'home' }, '', '/about');
// URL 变成 /about，页面不刷新
// 后续可以通过 history.state.from 获取 'home'

// ====== replaceState：替换当前历史记录 ======
// 就像把当前这一页"涂改"了，不会新增记录
history.replaceState(state, title, url);

// 使用场景：登录成功后，把 /login 替换为 /dashboard
// 这样用户按后退不会回到登录页
history.replaceState(null, '', '/dashboard');

// ====== popstate 事件：监听浏览器前进/后退 ======
// ⚠️ 注意：pushState 和 replaceState 不会触发 popstate！
// 只有用户点击浏览器的前进/后退按钮才会触发

window.addEventListener('popstate', (event) => {
  console.log('用户点了前进/后退');
  console.log('附带的数据:', event.state);
  // 在这里根据新的 location.pathname 渲染对应组件
});

// ====== 其他相关 API ======
history.back();      // 等价于点击浏览器后退按钮
history.forward();   // 等价于点击浏览器前进按钮
history.go(-2);      // 后退两步
history.length;      // 历史记录中的条目数
```

> ⚠️ **关键陷阱**：`pushState` 和 `replaceState` **不会触发 `popstate` 事件**！所以 React Router 需要自己封装一层，在调用 `pushState` 后手动触发路由匹配。

```
URL 变化触发的完整事件链：

用户点击 <Link to="/about">:
  → React Router 拦截点击事件（preventDefault）
  → 调用 history.pushState(null, '', '/about')
  → React Router 手动更新内部 state
  → React 重新渲染，匹配 /about 对应的组件

用户点击浏览器后退按钮:
  → 浏览器触发 popstate 事件
  → React Router 监听到事件
  → React Router 读取新的 location.pathname
  → React 重新渲染，匹配对应组件
```

#### 为什么需要 history 对象？

浏览器的 `window.history` API 有两个缺陷：
1. **事件不完整**：`pushState` 不触发事件，只能监听前进/后退
2. **没有"变化监听"**：无法知道 `pushState` 何时被调用

React Router 内部使用了一个增强版的 history 对象来解决这个问题：

```javascript
// 简化版 history 对象——React Router 的核心
function createBrowserHistory() {
  const listeners = [];  // 存储所有订阅者

  function listen(listener) {
    listeners.push(listener);
    // 返回取消订阅的函数
    return () => {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function push(path, state) {
    window.history.pushState(state, '', path);
    // 关键：手动通知所有订阅者！
    listeners.forEach(listener => listener({ action: 'PUSH', location: { pathname: path } }));
  }

  function replace(path, state) {
    window.history.replaceState(state, '', path);
    listeners.forEach(listener => listener({ action: 'REPLACE', location: { pathname: path } }));
  }

  // 监听浏览器前进/后退
  window.addEventListener('popstate', () => {
    listeners.forEach(listener => listener({
      action: 'POP',
      location: { pathname: window.location.pathname }
    }));
  });

  return {
    push,
    replace,
    listen,
    location: { pathname: window.location.pathname }
  };
}
```

> 💡 **大白话**：原生 `history` 就像一个没有门的信箱——你可以往里面塞信（`pushState`），但信箱不会告诉你"有新信来了"。React Router 的 history 对象就像给信箱装了个"新邮件提醒"——每次有信来，都会通知所有订阅者。

#### 用原生代码实现一个最小路由（约 30 行代码）

```javascript
// ====== 一个真正能跑的最小路由器 ======
function createRouter(routes) {
  const routeMap = {};  // 路径 → 组件的映射表

  // 注册路由
  routes.forEach(({ path, component }) => {
    routeMap[path] = component;
  });

  // 路由匹配函数
  function match() {
    const pathname = window.location.pathname;
    // 精确匹配
    if (routeMap[pathname]) return routeMap[pathname];
    // 动态参数匹配（如 /users/:id）
    for (const [pattern, component] of Object.entries(routeMap)) {
      const paramNames = [];
      const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
      const match = pathname.match(new RegExp(`^${regexStr}$`));
      if (match) {
        const params = {};
        paramNames.forEach((name, i) => params[name] = match[i + 1]);
        return { component, params };
      }
    }
    return routeMap['*'] || routeMap['/404'];  // 404 兜底
  }

  // 导航函数
  function navigate(path) {
    window.history.pushState({}, '', path);
    render();  // 导航后手动触发渲染
  }

  // 渲染函数
  function render() {
    const result = match();
    const app = document.getElementById('app');
    if (typeof result === 'function') {
      app.innerHTML = result();  // 简单起见，直接用 innerHTML
    } else if (result && result.component) {
      app.innerHTML = result.component(result.params);
    }
  }

  // 监听前进/后退
  window.addEventListener('popstate', render);

  return { navigate, render };
}

// ====== 使用示例 ======
const router = createRouter([
  { path: '/', component: () => '<h1>首页</h1>' },
  { path: '/about', component: () => '<h1>关于我们</h1>' },
  { path: '/users/:id', component: (params) => `<h1>用户 ${params.id}</h1>` },
  { path: '*', component: () => '<h1>404 - 页面不存在</h1>' },
]);

// 首次渲染
router.render();

// 导航到 /about
router.navigate('/about');
```

> 💡 这 30 行代码揭示了前端路由的本质：**URL 匹配 + history.pushState + DOM 替换**。React Router 在此基础上增加了组件化、嵌套路由、数据预加载等能力，但核心原理完全一样。

---

### 2. React Router 的架构设计

#### BrowserRouter 如何监听 URL 变化

`BrowserRouter` 内部的核心工作流程：

```
BrowserRouter 初始化：
  1. 创建 history 对象（增强版 window.history）
  2. 监听 history 变化
  3. 将 location 信息存入内部 state
  4. 通过 Context 向下传递 location 和 navigate

URL 变化时（用户点击 Link 或浏览器前进/后退）：
  ┌─────────────────────────────────────────────────┐
  │  Link 点击 / navigate() 调用                     │
  │    ↓                                             │
  │  history.push('/about')                          │
  │    ↓                                             │
  │  history 对象通知所有 listener                   │
  │    ↓                                             │
  │  BrowserRouter 内部 setState({ location: newLoc })│
  │    ↓                                             │
  │  RouterContext.Provider 的 value 更新             │
  │    ↓                                             │
  │  Routes 组件重新渲染                             │
  │    ↓                                             │
  │  执行路由匹配算法                                │
  │    ↓                                             │
  │  找到匹配的 Route → 渲染对应组件                  │
  └─────────────────────────────────────────────────┘
```

简化实现：

```jsx
// BrowserRouter 的简化版核心逻辑
function BrowserRouter({ children }) {
  const [location, setLocation] = useState({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  });

  useEffect(() => {
    // 创建增强版 history
    const history = createBrowserHistory();

    // 订阅 URL 变化
    const unsubscribe = history.listen(({ location: newLoc }) => {
      setLocation(newLoc);  // 触发 React 重新渲染
    });

    return unsubscribe;  // 清理订阅
  }, []);

  // 通过 Context 向下传递路由信息
  return (
    <RouterContext.Provider value={{
      location,
      navigate: (path) => history.push(path),
      // ... 其他路由 API
    }}>
      {children}
    </RouterContext.Provider>
  );
}
```

#### Routes/Route 的匹配算法原理

React Router v6 使用了**基于路径排名的匹配算法**（取代了 v5 的简单遍历）：

```
路由定义：
  /users          → 排名分数: 0
  /users/:id      → 排名分数: 2（动态段 +1）
  /users/new      → 排名分数: 1（静态段优先）
  /:category/:id  → 排名分数: 3（两个动态段）

匹配 URL /users/123 时的排序结果：
  1. /users/:id    → 匹配 ✅（分数 2）
  2. /:category/:id → 匹配 ✅（分数 3，但排名更靠后）
  3. /users        → 不匹配 ❌
  4. /users/new    → 不匹配 ❌

结果：选择 /users/:id（分数最低 = 最具体 = 最高优先级）
```

> 💡 **大白话**：React Router 的匹配就像"最精确匹配优先"。当你搜索联系人时，输入"张三"会优先匹配名叫"张三"的人，而不是所有姓"张"的人。静态路径比动态路径更"精确"。

```javascript
// 简化的路由匹配算法
function matchRoute(routePath, urlPath) {
  const routeSegments = routePath.split('/').filter(Boolean);
  const urlSegments = urlPath.split('/').filter(Boolean);

  if (routeSegments.length !== urlSegments.length) return null;

  const params = {};

  for (let i = 0; i < routeSegments.length; i++) {
    const routeSeg = routeSegments[i];
    const urlSeg = urlSegments[i];

    if (routeSeg.startsWith(':')) {
      // 动态参数：/users/:id
      params[routeSeg.slice(1)] = urlSeg;
    } else if (routeSeg === '*') {
      // 通配符
      params['*'] = urlSegments.slice(i).join('/');
      return { matched: true, params };
    } else if (routeSeg !== urlSeg) {
      // 静态路径不匹配
      return null;
    }
  }

  return { matched: true, params };
}

// 示例
matchRoute('/users/:id', '/users/123');
// → { matched: true, params: { id: '123' } }

matchRoute('/users/:id', '/posts/456');
// → null（静态部分 'users' ≠ 'posts'）
```

#### 路由嵌套的 Outlet 原理

`Outlet` 是实现嵌套路由的关键。它的原理其实就是一个**"插槽"模式**：

```
组件树结构：

<Routes>
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="users" element={<UsersPage />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Routes>

当 URL = /admin/users 时，组件树变成：

<AdminLayout>
  <Outlet /> → 渲染 <UsersPage />
</AdminLayout>

React Router 内部做了什么？
┌─────────────────────────────────────────┐
│  Routes 遍历嵌套路由配置                 │
│    ↓                                     │
│  匹配到 /admin/users                     │
│    ↓                                     │
│  渲染 AdminLayout（父路由的 element）    │
│    ↓                                     │
│  同时将 UsersPage 存入 RouterContext     │
│    ↓                                     │
│  AdminLayout 中的 <Outlet /> 读取 Context │
│    ↓                                     │
│  <Outlet /> 渲染出 <UsersPage />        │
└─────────────────────────────────────────┘
```

简化实现：

```jsx
// Outlet 的简化实现
function Outlet() {
  // 从 RouterContext 获取当前匹配的嵌套路由组件
  const outletContext = useContext(OutletContext);
  return outletContext.element || null;
}

// Routes 的简化实现
function Routes({ children }) {
  const location = useContext(LocationContext);

  // 将 Route 配置扁平化
  const routes = flattenRoutes(children);

  // 找到匹配的路由（包括嵌套路由）
  const matches = matchRoutes(routes, location.pathname);
  // matches 可能是：[
  //   { route: '/admin', element: <AdminLayout /> },
  //   { route: '/admin/users', element: <UsersPage /> }  // 嵌套的
  // ]

  // 渲染匹配的路由链
  let element = null;
  // 从最内层开始包装
  for (let i = matches.length - 1; i >= 0; i--) {
    if (i === matches.length - 1) {
      // 最内层：直接渲染组件
      element = matches[i].element;
    } else {
      // 外层：用 OutletContext 包裹
      element = (
        <OutletContext.Provider value={{ element }}>
          {matches[i].element}
        </OutletContext.Provider>
      );
    }
  }

  return element;
}
```

> 💡 **大白话**：`Outlet` 就像俄罗斯套娃——AdminLayout 是外面的大娃娃，UsersPage 是里面的小娃娃。`Outlet` 就是"大娃娃肚子里的空间"，用来放小娃娃。

#### 路由懒加载（React.lazy + Suspense）的实现原理

```jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

这行代码背后发生了什么？

```
懒加载的完整流程：

1. 编译阶段（Webpack/Vite）：
   import('./pages/Dashboard')
   → Webpack 将 Dashboard 及其依赖打包成独立文件
   → dashboard.[hash].js（约 50KB）

2. 运行阶段：
   lazy(() => import(...))
   → 返回一个特殊的"懒组件"对象：
   {
     $$typeof: Symbol(react.lazy),
     _payload: {
       _status: 'pending',       // 初始状态
       _result: Promise,          // 加载 Promise
     },
     _init: function() {
       // 触发 import()，开始加载 JS 文件
       this._payload._result = import('./pages/Dashboard');
       this._payload._status = 'in_progress';
     }
   }

3. 首次渲染：
   <Dashboard /> → React 发现是 lazy 组件
   → 调用 _init() 开始加载
   → 抛出一个特殊 Promise 给 Suspense
   → Suspense 捕获到 Promise，显示 fallback UI

4. 加载完成：
   Promise resolve → Dashboard 组件真正可用
   → Suspense 隐藏 fallback，渲染 Dashboard

5. 后续渲染：
   Dashboard 已经加载过了
   → 直接渲染，不再显示 fallback
```

```javascript
// React.lazy 的简化实现
function lazy(ctor) {
  const payload = {
    _status: -1,      // -1: 未开始, 0: 已完成, 1: 出错
    _result: null,
  };

  const lazyType = {
    $$typeof: Symbol(react.lazy),
    _payload: payload,
    _init: function() {
      if (payload._status === -1) {
        const promise = ctor();  // 调用 import()
        promise.then(
          (module) => {
            payload._status = 0;
            payload._result = module.default;  // 拿到导出的组件
          },
          (error) => {
            payload._status = 1;
            payload._result = error;
          }
        );
        throw promise;  // 抛出给 Suspense 捕获
      }
      if (payload._status === 1) {
        throw payload._result;  // 抛出错误
      }
      return payload._result;  // 返回已加载的组件
    }
  };

  return lazyType;
}
```

> 💡 **大白话**：`lazy` 就像网购了一件商品。第一次渲染时发现"货还没到"（组件代码没下载），于是先显示一个"加载中"的占位符（fallback）。等到货到了（代码下载完了），再把真正的东西拿出来展示。

#### 路由守卫的实现模式

React Router v6 没有内置的"路由守卫"概念，但可以通过组件组合实现：

```jsx
// ====== 模式 1：包装组件（最常用） ======
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 未登录 → 重定向到登录页，并记住原目标
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 使用
<Route path="/dashboard" element={
  <RequireAuth><Dashboard /></RequireAuth>
} />

// ====== 模式 2：Layout 级守卫 ======
function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} />;

  return (
    <div>
      <Sidebar />
      <Outlet />  {/* 只有通过验证，子路由才能渲染 */}
    </div>
  );
}

<Route element={<AuthLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>

// ====== 模式 3：数据预加载守卫（loader） ======
// React Router v6.4+ 的 loader 模式
const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    loader: async () => {
      // 在渲染前检查权限
      const token = localStorage.getItem('token');
      if (!token) throw redirect('/login');
      // 预加载必要数据
      const user = await fetchUser();
      return { user };
    },
    children: [
      { path: 'dashboard', element: <Dashboard /> },
    ]
  }
]);
```

```
路由守卫的执行时机：

        用户访问 /dashboard
              ↓
    ┌─── RequireAuth 检查 ───┐
    │                         │
    │  已登录？               │
    │  ├── 是 → 渲染子组件   │
    │  └── 否 → Navigate 到  │
    │         /login          │
    │         (保存 from)     │
    └─────────────────────────┘
              ↓
    登录成功后
              ↓
    Navigate 到 state.from（原目标页面）
```

> 💡 **大白话**：路由守卫就像大楼的门禁系统。你想进某个房间（访问某个路由），门禁先检查你的工牌（认证状态）。没有工牌就被带到前台（登录页），办好工牌后自动带你回到原来想去的房间。

---

[→ 14 - 状态管理进阶](../14-state-management/)
