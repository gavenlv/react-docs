# 06 - 条件渲染

## 🎯 本节目标
- 掌握条件渲染的各种方式
- 学会根据不同条件显示不同的 UI
- 理解何时使用哪种条件渲染方法
- 了解条件渲染的性能考量

---

## 📖 什么是条件渲染？

**条件渲染**就是根据不同的条件，在界面上显示不同的内容。

### 生活中的类比

条件渲染无处不在：

> **智能手机的锁屏**：
> - 没有通知 → 只显示时间和壁纸
> - 有消息通知 → 显示消息小红点和预览
> - 有未接来电 → 显示来电提醒
>
> 这就是条件渲染！手机并没有把所有内容都显示出来，而是**根据当前状态（有无通知）来决定显示什么**。

> **天气 APP**：
> - 晴天 → 显示太阳图标和紫外线指数
> - 下雨天 → 显示雨滴图标和降雨概率
> - 多云 → 显示云朵图标
>
> 同一个 APP，不同天气显示完全不同的界面。

### 在 React 中如何实现？

React 的条件渲染本质上就是 **JavaScript 的条件语句**，只不过它放在了 JSX 里面。你不需要学习新的语法，只需要把你会的 `if/else`、`三元运算符` 等用到 JSX 中即可。

> **核心理念**：JSX 就是 JavaScript。任何可以在 JavaScript 中使用的条件判断，都可以在 JSX 中使用。React 没有发明什么"条件渲染语法"，它用的就是你已经学过的 JavaScript。

---

## 🔧 条件渲染的六种方式

### 1. 三元运算符（最常用）

**适合场景**：简单的"二选一"——要么显示 A，要么显示 B。

```jsx
// 基本用法：condition ? 真值显示 : 假值显示
function LoginButton({ isLoggedIn }) {
  return (
    <button>
      {isLoggedIn ? '退出登录' : '登录'}
    </button>
  );
}
```

**三元运算符回顾**（如果你不熟悉的话）：

> 三元运算符是 `if/else` 的简写：
> ```
> 条件 ? 值1 : 值2
> ```
> 如果条件为 true，返回值1；否则返回值2。
>
> 就像问路："前面有红绿灯吗？" → "有"→"等绿灯"，"没有"→"直接走"。

```jsx
// 更复杂的示例：根据登录状态显示不同的欢迎语
function UserGreeting({ isLoggedIn, username }) {
  return (
    <div>
      {isLoggedIn ? (
        <h2>欢迎回来, {username}!</h2>
      ) : (
        <h2>请先登录</h2>
      )}
    </div>
  );
}

// 根据分数显示不同的评价
function ScoreDisplay({ score }) {
  return (
    <div>
      <p>你的分数: {score}</p>
      <p className={score >= 60 ? 'pass' : 'fail'}>
        {score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 60 ? '及格' : '不及格'}
      </p>
    </div>
  );
}
// 注意：嵌套三元运算符虽然能工作，但可读性差，不建议超过一层
```

### 2. 逻辑与运算符（&&）

**适合场景**：条件为真时显示内容，条件为假时**什么都不显示**。

```jsx
function Notification({ message }) {
  return (
    <div>
      {/* 有消息时显示通知，没有消息时不显示任何内容 */}
      {message && (
        <div className="notification">
          {message}
        </div>
      )}
    </div>
  );
}
```

**`&&` 运算符的工作原理**：

> JavaScript 的 `&&` 运算符的规则是：
> - 如果左边为 true → 返回右边的值
> - 如果左边为 false → 返回左边的值（不计算右边）
>
> 所以：
> - `true && <div>你好</div>` → `<div>你好</div>` （显示）
> - `false && <div>你好</div>` → `false` （React 会忽略 false，什么都不渲染）
> - `'' && <div>你好</div>` → `''` （空字符串，React 也会忽略）
> - `0 && <div>你好</div>` → `0` ⚠️ **React 会渲染数字 0！**

**⚠️ 常见陷阱：数字 0 的问题**

```jsx
function ItemCount({ count }) {
  return (
    <div>
      {/* ⚠️ 当 count=0 时，页面会显示 "0"！ */}
      {count && <span>{count} 个项目</span>}
      {/* 因为 0 && <span>...</span> 的结果是 0，React 会渲染出 "0" */}

      {/* ✅ 安全写法一：明确比较 */}
      {count > 0 && <span>{count} 个项目</span>}

      {/* ✅ 安全写法二：转换为布尔值 */}
      {!!count && <span>{count} 个项目</span>}

      {/* ✅ 安全写法三：三元运算符 */}
      {count > 0 ? <span>{count} 个项目</span> : null}
    </div>
  );
}
```

> **记住**：`&&` 左边不要放可能为 `0` 的值！这是一个非常常见的 Bug。

### 3. if-else 语句

**适合场景**：复杂的多分支逻辑，每个分支返回完全不同的 UI。

```jsx
function StatusBar({ status }) {
  // 在 JSX 的 return 之前使用 if-else
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'error') {
    return <ErrorMessage />;
  }

  if (status === 'success') {
    return <SuccessMessage />;
  }

  // 没有匹配的状态，返回 null（不渲染任何内容）
  return null;
}
```

**为什么不能在 JSX 的 `{}` 里直接写 if-else？**

```jsx
// ❌ 不能这样做！JSX 的 {} 里只能放表达式，不能放语句
function BadExample({ isLoggedIn }) {
  return (
    <div>
      {if (isLoggedIn) { return <span>已登录</span> }}  {/* 语法错误！ */}
    </div>
  );
}

// ✅ if-else 必须放在 return 之前（return 外面）
function GoodExample({ isLoggedIn }) {
  if (isLoggedIn) {
    return <div><span>已登录</span></div>;
  }
  return <div><span>未登录</span></div>;
}

// ✅ 或者在 {} 里使用三元运算符（三元运算符是表达式，不是语句）
function AlsoGood({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? <span>已登录</span> : <span>未登录</span>}
    </div>
  );
}
```

> **表达式 vs 语句**的简单区分：
> - **表达式（Expression）**：有返回值的代码。如 `1 + 1`、`a > b`、`true ? 'yes' : 'no'`
> - **语句（Statement）**：执行某种操作的代码，没有返回值。如 `if/else`、`for`、`while`
>
> JSX 的 `{}` 里只能放表达式。三元运算符是表达式，所以可以在 `{}` 里用。`if/else` 是语句，所以不行。

### 4. switch 语句

**适合场景**：多状态判断，每个状态对应不同的 UI。

```jsx
function RoleBadge({ role }) {
  switch (role) {
    case 'admin':
      return <Badge color="red">管理员</Badge>;
    case 'moderator':
      return <Badge color="blue">版主</Badge>;
    case 'user':
      return <Badge color="green">用户</Badge>;
    default:
      return <Badge color="gray">访客</Badge>;
  }
}
```

**switch vs if-else vs 三元运算符的选择**：

| 方式 | 分支数 | 可读性 | 推荐场景 |
|------|-------|--------|---------|
| 三元运算符 | 2个 | ⭐⭐⭐⭐⭐ | 简单的二选一 |
| if-else | 2-5个 | ⭐⭐⭐⭐ | 多分支，每个分支逻辑简单 |
| switch | 3个以上 | ⭐⭐⭐⭐ | 多状态映射，分支逻辑相似 |
| 对象映射 | 3个以上 | ⭐⭐⭐⭐⭐ | 状态到组件的映射 |

### 5. 提取组件 + 对象映射

**适合场景**：多个条件对应不同的组件，且映射关系清晰。

```jsx
// 定义组件映射表
// 这是一种非常优雅的写法，尤其适合状态多且可能扩展的情况
const COMPONENT_MAP = {
  loading: LoadingSpinner,
  error: ErrorComponent,
  success: SuccessComponent,
  empty: EmptyState,
};

function DynamicContent({ status, data }) {
  // 从映射表中找到对应的组件
  const Component = COMPONENT_MAP[status] || DefaultComponent;

  return status ? <Component data={data} /> : null;
}

// 使用方式
<DynamicContent status="loading" data={null} />   // 显示加载中
<DynamicContent status="error" data={errorInfo} /> // 显示错误
<DynamicContent status="success" data={list} />    // 显示列表
```

> **为什么对象映射比 switch 好？**
>
> 1. **更简洁**：不用写一堆 case/break
> 2. **更易扩展**：新增状态只需在对象里加一行，不用改函数
> 3. **可动态生成**：如果映射表是动态的（比如从配置文件读取），switch 做不到
>
> 就像餐厅菜单：你只需要查菜单（映射表）就知道今天的菜有什么，而不需要挨个问厨师（case by case）。

### 6. IIFE（立即执行函数表达式）

**适合场景**：需要在 JSX 中执行多行逻辑，但又不想提取到外面。

```jsx
function ComplexCondition({ user, items }) {
  return (
    <div>
      {/* IIFE：定义一个函数并立即执行 */}
      {(() => {
        if (!user) return <LoginPrompt />;
        if (!items.length) return <EmptyMessage />;
        if (items.length > 10) return <Pagination items={items} />;
        return <SimpleList items={items} />;
      })()}
    </div>
  );
}
```

**IIFE 是什么？**

> IIFE（Immediately Invoked Function Expression）就是"定义一个函数，立刻调用它"。
>
> `(function() { ... })()` 或 `(() => { ... })()`
>
> 为什么要用这种看起来很奇怪的语法？因为 JSX 的 `{}` 里只能放表达式，不能放语句。而 IIFE 整体是一个表达式（函数调用），所以可以放在 `{}` 里，同时在函数体里你就可以自由地写 if-else 等语句了。
>
> **不过**，IIFE 的可读性不太好。如果逻辑复杂，建议提取成一个变量或子组件。

---

## 💡 最佳实践与性能优化

### 1. 选择合适的方法

```jsx
// 简单条件 → 三元运算符 ✅
{isLoading ? <Spinner /> : <Content />}

// 条件为真才显示 → && ✅
{error && <ErrorMessage />}

// 复杂逻辑 → if-else + 提前返回 ✅
function Component() {
  if (error) return <ErrorPage />;
  if (loading) return <LoadingPage />;
  return <ContentPage />;
}

// 多状态映射 → 对象映射 ✅
const Component = MAP[status] || Default;
```

### 2. 提前返回（Early Return）模式

这是一种非常重要的编码技巧，能让代码更清晰。

```jsx
// ❌ 没有提前返回——嵌套层级深，可读性差
function UserPanel({ user, isLoading, error }) {
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : user ? (
        <div>
          <UserInfo user={user} />
          {user.isAdmin && <AdminPanel />}
        </div>
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
}

// ✅ 提前返回——逻辑清晰，每一层都很简单
function UserPanel({ user, isLoading, error }) {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <LoginPrompt />;

  // 到这里说明一切正常，user 一定存在
  return (
    <div>
      <UserInfo user={user} />
      {user.isAdmin && <AdminPanel />}
    </div>
  );
}
```

> **提前返回的哲学**：先处理所有异常/特殊情况（加载中、出错、没数据），然后剩下的代码只需要处理正常情况。这样代码的主逻辑不会被各种 if-else 包裹，读起来就像读散文一样流畅。

### 3. 复杂条件提取为变量或子组件

```jsx
// ❌ JSX 中逻辑过于复杂，像意大利面条一样纠缠不清
function BadExample({ user, posts, isLoading, hasError }) {
  return (
    <div>
      {(hasError ?
        <Error /> :
        (isLoading ?
          <Loading /> :
          (posts.length > 0 ?
            <PostList posts={posts} /> :
            (!user ? <Login /> : <Empty />)
          )
        )
      )}
    </div>
  );
}

// ✅ 方法一：提取为变量
function GoodExample({ user, posts, isLoading, hasError }) {
  // 先确定要显示什么内容
  let content;

  if (hasError) content = <Error />;
  else if (isLoading) content = <Loading />;
  else if (posts.length > 0) content = <PostList posts={posts} />;
  else if (!user) content = <Login />;
  else content = <Empty />;

  // JSX 只负责渲染
  return <div>{content}</div>;
}

// ✅ 方法二：提取为子组件（推荐，可复用性更好）
function ContentArea({ user, posts, isLoading, hasError }) {
  if (hasError) return <Error />;
  if (isLoading) return <Loading />;
  if (!user) return <Login />;
  if (posts.length === 0) return <Empty />;
  return <PostList posts={posts} />;
}

function Page() {
  return (
    <div>
      <Header />
      <ContentArea user={user} posts={posts} isLoading={isLoading} hasError={hasError} />
      <Footer />
    </div>
  );
}
```

### 4. 使用 CSS 控制显隐（频繁切换时更高效）

```jsx
// 方式一：条件渲染——每次切换都会销毁和重建组件
// 适合：切换不频繁，或者组件初始化成本低的场景
function ToggleSection({ isVisible, children }) {
  if (!isVisible) return null;  // 组件被销毁，内部的 state 会丢失
  return <div>{children}</div>;
}

// 方式二：CSS 控制显隐——组件始终存在，只是用 CSS 隐藏
// 适合：频繁切换，且需要保留组件内部状态的场景
function ToggleSection({ isVisible, children }) {
  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      {children}
    </div>
  );
}

// 方式三：使用 CSS class
<div className={`section ${isVisible ? 'visible' : 'hidden'}`}>
  {children}
</div>
```

**何时用哪种方式？**

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| Tab 切换，且每个 Tab 有独立的数据 | 条件渲染 | 不活跃的 Tab 不需要占用内存 |
| 频繁显示/隐藏的弹出提示 | CSS 隐藏 | 避免频繁创建/销毁，且保留状态 |
| 用户权限控制的菜单项 | 条件渲染 | 没权限的菜单根本不应该存在于 DOM 中 |
| 手风琴展开/收起 | CSS 隐藏 + 动画 | 配合 CSS transition 实现平滑动画 |

> **性能提醒**：React 的条件渲染（创建/销毁组件）在现代浏览器中非常快。除非你明确遇到了性能问题，否则不要过早优化。**可读性 > 性能**。

---

## 🎨 实战示例：用户状态面板

这个例子综合运用了多种条件渲染方式，模拟真实开发中的常见场景。

```jsx
function UserPanel({ user }) {
  const [isLoading, setIsLoading] = useState(true);

  // ====== 提前返回：处理加载状态 ======
  if (isLoading) {
    return (
      <div className="panel">
        <LoadingSpinner text="正在加载用户信息..." />
      </div>
    );
  }

  // ====== 提前返回：处理未登录状态 ======
  if (!user) {
    return (
      <div className="panel">
        <div className="login-prompt">
          <p>您尚未登录</p>
          <LoginButton onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  // ====== 正常状态：已登录 ======
  return (
    <div className="panel">
      <UserInfo user={user} />

      {/* && 运算符：管理员才看到的管理面板 */}
      {user.role === 'admin' && (
        <AdminPanel userId={user.id} />
      )}

      {/* && 运算符：VIP 用户才看到专属标识 */}
      {user.isVip && (
        <VipBadge level={user.vipLevel} />
      )}

      {/* && 运算符 + 条件判断：有未读消息时显示通知 */}
      {user.unreadCount > 0 && (
        <NotificationBadge count={user.unreadCount} />
      )}

      {/* 三元运算符：根据会员状态显示不同的升级提示 */}
      {user.isVip ? (
        <p>感谢您成为 VIP 会员！</p>
      ) : (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

### 实战示例：数据加载的三态处理

这是实际开发中最常见的条件渲染场景之一。

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 加载中状态
  if (loading) {
    return (
      <div className="user-list">
        <div className="loading">
          <Spinner />
          <p>正在加载用户列表...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="user-list">
        <div className="error">
          <p>加载失败: {error}</p>
          <button onClick={() => window.location.reload()}>
            重试
          </button>
        </div>
      </div>
    );
  }

  // 空数据状态
  if (users.length === 0) {
    return (
      <div className="user-list">
        <div className="empty">
          <p>暂无用户数据</p>
          <button onClick={() => window.location.reload()}>
            刷新
          </button>
        </div>
      </div>
    );
  }

  // 正常状态——有数据
  return (
    <div className="user-list">
      <h2>用户列表 ({users.length})</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <img src={user.avatar} alt={user.name} />
            <span>{user.name}</span>
            {user.isAdmin && <span className="badge">管理员</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> **四态原则**：在处理数据加载时，永远要考虑这四种状态：
> 1. **加载中（Loading）**：显示加载动画
> 2. **出错（Error）**：显示错误信息和重试按钮
> 3. **空数据（Empty）**：显示友好的空状态提示
> 4. **正常（Success）**：显示数据内容
>
> 很多初学者只处理了第 4 种状态，导致用户在等待加载或遇到错误时看到的是空白页面，体验非常差。

---

## 🧠 核心概念总结

| 方式 | 语法 | 适用场景 | 可读性 |
|------|------|---------|--------|
| 三元运算符 | `a ? b : c` | 简单二选一 | ⭐⭐⭐⭐⭐ |
| `&&` 运算符 | `a && b` | 条件为真时显示 | ⭐⭐⭐⭐⭐ |
| if-else | `if (...) { return }` | 多分支，逻辑复杂 | ⭐⭐⭐⭐ |
| switch | `switch (x) { case... }` | 多状态枚举 | ⭐⭐⭐⭐ |
| 对象映射 | `MAP[key]` | 状态到组件的映射 | ⭐⭐⭐⭐⭐ |
| 提前返回 | `if (bad) return null` | 先处理异常再处理正常 | ⭐⭐⭐⭐⭐ |

**选择口诀**：
- 二选一 → 三元
- 有则显 → `&&`
- 多分支 → if-else 或对象映射
- 保持简洁 → 提前返回

---

## ✅ 阶段检查清单

- [ ] 理解什么是条件渲染
- [ ] 掌握三元运算符进行简单条件判断
- [ ] 能够使用 `&&` 运算符进行条件显示
- [ ] 知道 `&&` 的 `0` 值陷阱并会避免
- [ ] 会使用 if/else 和 switch 处理复杂逻辑
- [ ] 理解 JSX 中表达式和语句的区别
- [ ] 掌握提前返回（Early Return）模式
- [ ] 知道如何优化条件渲染的性能
- [ ] 能根据场景选择最合适的方法

---

## 📝 练习任务

### 任务 1：权限控制页面
实现一个基于用户角色的权限控制页面：
- 三种角色：管理员（admin）、普通用户（user）、访客（guest）
- 管理员可以看到：用户管理、系统设置、数据统计
- 普通用户可以看到：个人中心、消息通知
- 访客只能看到：登录/注册页面
- 使用状态映射（对象映射）的方式实现

### 任务 2：商品列表
实现一个带完整状态管理的商品列表：
- 加载中状态（显示骨架屏或 loading 动画）
- 网络错误状态（显示错误信息和重试按钮）
- 空数据状态（显示引导用户去浏览其他页面的提示）
- 正常数据状态（显示商品卡片列表）
- 搜索过滤状态（根据关键词过滤商品）

---

[→ 07 - 列表与 Keys](../07-lists-keys/)
