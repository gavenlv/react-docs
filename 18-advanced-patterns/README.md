# 18 - 高级设计模式

## 🎯 本节目标
- 掌握 React 中的常见设计模式
- 学会在复杂场景下组织代码
- 提升代码的可维护性和可扩展性

---

## 📐 设计模式概览

| 模式 | 应用场景 | 复杂度 |
|------|---------|--------|
| **Container/Presentational** | 分离逻辑和 UI | ⭐⭐ |
| **Render Props** | 共享渲染逻辑 | ⭐⭐⭐ |
| **Higher-Order Components (HOC)** | 横切关注点复用 | ⭐⭐⭐⭐ |
| **Compound Components** | 声明式组合 | ⭐⭐⭐ |
| **Controlled/Uncontrolled** | 灵活的组件接口 | ⭐⭐ |
| **Provider Pattern** | 全局状态共享 | ⭐⭐⭐ |

---

## 1. Container/Presentational 模式（容器/展示组件）

### 概念
将组件分为两类：
- **Container（容器组件）**: 关注数据和业务逻辑
- **Presentational（展示组件）**: 关注 UI 外观

### 示例

```jsx
// === Presentational Component（展示组件）===
// 只负责接收 props 并渲染 UI
// 不知道数据从哪来，不知道如何修改数据

function UserList({ users, isLoading, onSelectUser }) {
  if (isLoading) {
    return <LoadingSpinner message="加载中..." />;
  }

  if (!users.length) {
    return <EmptyState message="暂无用户" />;
  }

  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id} className="user-item">
          <Avatar src={user.avatar} alt={user.name} size="medium" />
          <span>{user.name}</span>
          <span>{user.email}</span>
          <button onClick={() => onSelectUser(user.id)}>
            查看详情
          </button>
        </li>
      ))}
    </ul>
  );
}

// 类型定义（如果使用 TypeScript）
UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      avatar: PropTypes.string
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onSelectUser: PropTypes.func.isRequired
};

// === Container Component（容器组件）===
// 负责：数据获取、状态管理、业务逻辑

class UserListContainer extends React.Component {
  state = {
    users: [],
    isLoading: true,
    error: null
  };

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = async () => {
    this.setState({ isLoading: true });
    
    try {
      const response = await userApi.getAll();
      this.setState({
        users: response.data,
        isLoading: false,
        error: null
      });
    } catch (error) {
      this.setState({
        error: error.message,
        isLoading: false
      });
    }
  };

  handleSelectUser = (userId) => {
    this.props.history.push(`/users/${userId}`);
  };

  render() {
    return (
      <UserList
        users={this.state.users}
        isLoading={this.state.isLoading}
        onSelectUser={this.handleSelectUser}
      />
    );
  }
}

// 使用 Hooks 版本的容器组件（更现代）
function UserListContainer({ history }) {
  const [state, setState] = useState({
    users: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    async function loadUsers() {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const { data } = await userApi.getAll();
        setState({ users: data, isLoading: false, error: null });
      } catch (error) {
        setState({ error: error.message, isLoading: false });
      }
    }
    loadUsers();
  }, []);

  const handleSelectUser = useCallback((userId) => {
    history.push(`/users/${userId}`);
  }, [history]);

  if (state.error) {
    return <ErrorMessage error={state.error} onRetry={loadUsers} />;
  }

  return (
    <UserList
      users={state.users}
      isLoading={state.isLoading}
      onSelectUser={handleSelectUser}
    />
  );
}
```

**优势：**
- 关注点分离，职责清晰
- 展示组件可复用于不同数据源
- 易于测试（展示组件只需测试渲染）

---

## 2. Render Props 模式

### 概念
通过一个值为函数的 prop 来共享代码。

### 示例：鼠标追踪器

```jsx
// MouseTracker - 提供 mouse 位置的 Render Prop 组件
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (event) => {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  };

  render() {
    // 将状态通过 render prop 传递给子组件
    // this.props.render 可以是任意名称（children, render 等）
    return this.props.children(this.state);
  }
}

// 使用方式 1：使用 children 作为 render prop
<MouseTracker>
  {({ x, y }) => (
    <div style={{ position: 'relative', height: '100vh' }}>
      鼠标位置: ({x}, {y})
      <div style={{
        position: 'absolute',
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        background: 'red',
        borderRadius: '50%'
      }} />
    </div>
  )}
</MouseTracker>

// 使用方式 2：自定义 prop 名称
<MouseTracker render={({ x, y }) => (
  <h1>The mouse is at ({x}, {y})</h1>
)} />

// 实际应用案例：数据获取
<DataFetcher url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <Spinner />;
    if (error) return <ErrorMessage error={error.message} />;
    return <UserGrid users={data} onRefresh={refetch} />;
  }}
</DataFetcher>
```

### Hooks 版本（更简洁）

```jsx
// 使用 Hook 替代 Render Props
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// 使用
function MouseComponent() {
  const { x, y } = useMousePosition();
  
  return <div>鼠标在 ({x}, {y})</div>;
}
```

---

## 3. Higher-Order Components (HOC)

### 概念
高阶组件是一个函数，接受一个组件作为参数，返回一个增强的新组件。

```jsx
// HOC 定义
function withLoading(WrappedComponent, LoadingComponent = DefaultLoader) {
  // 返回增强后的组件
  function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    return <WrappedComponent {...props} />;
  }

  // 设置显示名称便于调试
  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithLoadingComponent;
}

// 使用
const UserProfileWithLoading = withLoading(UserProfile);

<UserProfileWithLoading 
  isLoading={loading}
  user={userData}
/>
```

### 常见 HOC 模式

#### a. withAuth - 权限控制

```jsx
function withAuth(WrappedComponent, options = {}) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loginRedirect } = useAuth();
    const location = useLocation();
    
    if (!isAuthenticated) {
      // 未认证，重定向到登录页
      return (
        <Navigate 
          to={options.loginPath || '/login'} 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
    
    if (options.requiredRole && !options.requiredRole.includes(user.role)) {
      // 无权限
      return <ForbiddenPage />;
    }
    
    // 通过 props 注入额外信息
    return (
      <WrappedComponent 
        {...props} 
        user={user}
        isAuthenticated={isAuthenticated} 
      />
    );
  };
}

// 使用
const AdminPanel = withAuth(AdminDashboard, { requiredRole: ['admin'] });

// 路由中使用
<Route path="/admin" element={<AdminPanel />} />
```

#### b. withRouter - 获取路由上下文（React Router v5 及之前）

```jsx
function withRouter(WrappedComponent) {
  return function RouterComponent(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    
    return (
      <WrappedComponent 
        {...props} 
        location={location}
        history={{ push: navigate, replace: (...args) => navigate(...args, { replace: true }) }}
        match={{ params }} 
      />
    );
  };
}
```

#### c. withLogger - 日志调试

```jsx
function withLogger(WrappedComponent, componentName = WrappedComponent.name) {
  class Logger extends React.Component {
    componentDidMount() {
      console.log(`[${componentName}] Mounted`, this.props);
    }
    
    componentDidUpdate(prevProps) {
      console.log(`[${componentName}] Updated`, {
        prev: prevProps,
        current: this.props
      });
    }
    
    componentWillUnmount() {
      console.log(`[${componentName}] Unmounted`);
    }
    
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  
  Logger.displayName = `withLogger(${componentName})`;
  return Logger;
}

// 仅在开发环境中启用
const enhance = process.env.NODE_ENV === 'development' ? withLogger : (c) => c;

export default enhance(MyComponent);
```

**HOC 注意事项：**
- 不要在 render 方法内部使用 HOC（会丢失状态）
- 必须复制静态方法（hoist-non-react-statics 库）
- Refs 不会被传递（使用 React.forwardRef）
- 尽量使用 Hooks 替代 HOC

---

## 4. Compound Components（复合组件）

### 概念
一组协同工作的组件，通过隐式状态共享实现声明式组合。

### 示例：手风琴/Accordion

```jsx
// Accordion.js
import { createContext, useContext, useState, Children, cloneElement } from 'react';

const AccordionContext = createContext();

// 主容器组件
function Accordion({ children, defaultIndex, onToggle }) {
  const [openIndex, setOpenIndex] = useState(defaultIndex);
  
  const toggleItem = (index) => {
    const newIndex = openIndex === index ? -1 : index;
    setOpenIndex(newIndex);
    onToggle && onToggle(newIndex);
  };
  
  const contextValue = { openIndex, toggleItem };
  
  return (
    <AccordionContext.Provider value={contextValue}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// 标题组件
function AccordionHeader({ children, index }) {
  const { openIndex, toggleItem } = useContext(AccordionContext);
  const isOpen = openIndex === index;
  
  return (
    <div 
      className={`accordion-header ${isOpen ? 'open' : ''}`}
      onClick={() => toggleItem(index)}
      aria-expanded={isOpen}
      role="button"
    >
      {children}
      <span className="icon">{isOpen ? '−' : '+'}</span>
    </div>
  );
}

// 内容面板
function AccordionPanel({ children, index }) {
  const { openIndex } = useContext(AccordionContext);
  const isOpen = openIndex === index;
  
  if (!isOpen) return null;
  
  return (
    <div className="accordion-panel" role="region">
      {children}
    </div>
  );
}

// 使用
function FAQSection() {
  return (
    <Accordion defaultIndex={0}>
      <AccordionHeader index={0}>
        React 是什么？
      </AccordionHeader>
      <AccordionPanel index={0}>
        React 是一个用于构建用户界面的 JavaScript 库。
      </AccordionPanel>
      
      <AccordionHeader index={1}>
        什么是 JSX？
      </AccordionHeader>
      <AccordionPanel index={1}>
        JSX 是一种 JavaScript 的语法扩展。
      </AccordionPanel>
      
      <AccordionHeader index={2}>
        如何学习 React？
      </AccordionHeader>
      <AccordionPanel index={2}>
        从官方文档开始，多做项目练习！
      </AccordionPanel>
    </Accordion>
  );
}
```

**优势：**
- 声明式 API，灵活且直观
- 组件间自动共享状态
- 易于扩展和维护

---

## 5. Controlled/Uncontrolled 模式

### Controlled（受控）组件
组件的所有状态都由外部（通常是父组件）完全控制。

```jsx
// 受控 Input
function ControlledInput({ value, onChange }) {
  return (
    <input 
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// 使用者必须管理状态
function Form() {
  const [text, setText] = useState('');
  
  return (
    <ControlledInput 
      value={text}
      onChange={setText}
    />
  );
}
```

### Uncontrolled（非受控）组件
组件内部自行管理状态，外部通过 ref 访问。

```jsx
// 非受控 Input
function UncontrolledInput({ defaultValue, inputRef }) {
  return (
    <input 
      defaultValue={defaultValue}
      ref={inputRef}
    />
  );
}

// 使用者无需管理状态
function Form() {
  const inputRef = useRef();
  
  const handleSubmit = () => {
    // 通过 ref 获取值
    console.log(inputRef.current.value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <UncontrolledInput 
        defaultValue="默认文本"
        inputRef={inputRef}
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

**混合模式（推荐）：同时支持两种模式**

```jsx
function FlexibleInput({ value: controlledValue, defaultValue, onChange, inputRef, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  
  const currentValue = isControlled ? controlledValue : internalValue;
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);  // 非受控模式：更新内部状态
    }
    
    onChange?.(newValue);  // 通知外部
  };
  
  return (
    <input
      value={currentValue}
      onChange={handleChange}
      ref={inputRef}
      {...props}
    />
  );
}

// 使用方式 1：受控模式
<FlexibleInput value={text} onChange={setText} />

// 使用方式 2：非受控模式
<FlexibleInput defaultValue="初始值" inputRef={myRef} />
```

---

## 6. Provider Pattern + Context（全局状态）

已在 Context 章节详细讲解，此处补充高级用法：

```jsx
// 组合多个 Provider
function ComposeProviders({ providers, children }) {
  return providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );
}

// 使用
<ComposeProviders
  providers={[
    <ThemeProvider><ToastProvider><AuthProvider></ComposeProviders
>
```

---

## 💡 模式选择指南

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 分离逻辑和 UI | Container/Presentational | 清晰的关注点分离 |
| 共享渲染逻辑 | 自定义 Hooks | 比 Render Props 更简洁 |
| 跨切面关注点 | HOC 或 Decorator | 如日志、权限、i18n |
| 声明式 UI 组合 | Compound Components | 如 Tabs、Select、Table |
| 灵活的状态管理 | Controlled/Uncontrolled | 给使用者更多选择 |
| 全局数据共享 | Context + Provider | 避免Props Drilling |

---

## ✅ 阶段检查清单

- [ ] 理解并能实现各种设计模式
- [ ] 知道每种模式的适用场景和局限性
- [ ] 能根据需求选择最合适的模式
- [ ] 理解现代 React 中 Hooks 对传统模式的替代

---

## 📝 练习任务

1. **Tabs 组件库**: 使用 Compound Components 模式实现完整的 Tabs 组件
2. **数据表格 HOC**: 实现 withSorting、withFiltering、withPagination 等可组合的 HOC

---

[→ 19 - 服务端渲染](../19-server-side-rendering/)
