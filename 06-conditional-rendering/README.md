# 06 - 条件渲染

## 🎯 本节目标
- 掌握条件渲染的各种方式
- 学会根据不同条件显示不同的 UI
- 理解何时使用哪种条件渲染方法

---

## 📖 什么是条件渲染？

根据应用的不同状态，渲染不同的 UI 内容。

---

## 🔧 条件渲染的方式

### 1. 三元运算符（最常用）

适合：简单的二选一场景

```jsx
function LoginButton({ isLoggedIn }) {
  return (
    <button>
      {isLoggedIn ? '退出登录' : '登录'}
    </button>
  );
}

// 更复杂的示例
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
```

### 2. 逻辑与运算符（&&）

适合：条件为真时显示内容，否则不显示

```jsx
function Notification({ message }) {
  return (
    <>
      {/* 有消息时显示通知 */}
      {message && (
        <div className="notification">
          {message}
        </div>
      )}
      
      {/* 注意：避免返回数字 */}
      {count && <span>{count} 个项目</span>}  {/* ⚠️ count=0 时会显示 "0" */}
      
      {/* 安全写法 */}
      {(count > 0) && <span>{count} 个项目</span>}
    </>
  );
}
```

### 3. if-else 语句

适合：复杂的多分支逻辑

```jsx
function StatusBar({ status }) {
  if (status === 'loading') {
    return <LoadingSpinner />;
  }
  
  if (status === 'error') {
    return <ErrorMessage />;
  }
  
  if (status === 'success') {
    return <SuccessMessage />;
  }
  
  return null;  // 或返回默认组件
}
```

### 4. switch 语句

适合：多状态判断

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

### 5. 提取组件 + 对象映射

适合：多个条件对应不同组件

```jsx
// 定义组件映射表
const COMPONENT_MAP = {
  loading: LoadingSpinner,
  error: ErrorComponent,
  success: SuccessComponent,
  empty: EmptyState,
};

function DynamicContent({ status, data }) {
  const Component = COMPONENT_MAP[status] || DefaultComponent;
  
  return status ? <Component data={data} /> : null;
}
```

### 6. IIFE（立即执行函数表达式）

适合：需要在 JSX 中执行多行逻辑

```jsx
function ComplexCondition({ user, items }) {
  return (
    <div>
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

---

## 💡 最佳实践与性能优化

### 1. 避免不必要的渲染

```jsx
// ❌ 即使条件为 false，两个组件都会被创建
{condition ? <ExpensiveComponentA /> : <ExpensiveComponentB />}

// ✅ 使用短路求值，只在需要时创建组件
{condition && <ExpensiveComponent />}
```

### 2. 复杂条件提前提取变量

```jsx
// ❌ JSX 中逻辑过于复杂
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

// ✅ 提取逻辑，保持 JSX 清晰
function GoodExample({ user, posts, isLoading, hasError }) {
  let content;
  
  if (hasError) content = <Error />;
  else if (isLoading) content = <Loading />;
  else if (posts.length > 0) content = <PostList posts={posts} />;
  else if (!user) content = <Login />;
  else content = <Empty />;
  
  return <div>{content}</div>;
}
```

### 3. 使用 CSS 控制显隐（频繁切换时）

```jsx
// 如果需要频繁显示/隐藏，使用 CSS 可能更高效
function ToggleSection({ isVisible, children }) {
  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      {children}
    </div>
  );
}

// 或者使用 CSS class
<div className={`section ${isVisible ? 'visible' : 'hidden'}`}>
  {children}
</div>
```

---

## 🎨 实战示例：用户状态面板

```jsx
function UserPanel({ user }) {
  const [isLoading, setIsLoading] = useState(true);

  // 加载状态
  if (isLoading) {
    return (
      <div className="panel">
        <LoadingSpinner text="正在加载用户信息..." />
      </div>
    );
  }

  // 未登录状态
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

  // 已登录 - 根据角色显示不同内容
  return (
    <div className="panel">
      <UserInfo user={user} />
      
      {/* 管理员专属功能 */}
      {user.role === 'admin' && (
        <AdminPanel userId={user.id} />
      )}
      
      {/* VIP 用户提示 */}
      {user.isVip && (
        <VipBadge level={user.vipLevel} />
      )}
      
      {/* 有未读消息时显示通知 */}
      {user.unreadCount > 0 && (
        <NotificationBadge count={user.unreadCount} />
      )}
    </div>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 掌握三元运算符进行简单条件判断
- [ ] 能够使用 && 运算符进行条件显示
- [ ] 会使用 if/else 和 switch 处理复杂逻辑
- [ ] 知道如何优化条件渲染的性能
- [ ] 能根据场景选择最合适的方法

---

## 📝 练习任务

1. **权限控制页面**: 根据用户角色显示不同的导航菜单和功能按钮
2. **商品列表**: 显示加载中、空数据、错误、正常等多种状态

---

[→ 07 - 列表与 Keys](../07-lists-keys/)
