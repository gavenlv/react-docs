# 03 - 组件基础

## 🎯 本节目标
- 理解组件的概念和重要性
- 掌握函数组件的定义和使用
- 学会组件的组合与复用
- 了解组件的设计原则

---

## 📖 什么是组件？

组件是 React 应用的基本构建单元。它接收输入（props），返回应该在屏幕上显示的 React 元素。

### 类比理解
就像用乐高积木搭建模型：
- 每个积木块 = 一个组件
- 不同形状的积木 = 不同类型的组件
- 组合在一起 = 构建完整的 UI

---

## 🏗️ 函数组件

### 基本定义

```jsx
// 最简单的函数组件
function Welcome() {
  return <h1>Hello, World!</h1>;
}

// 箭头函数形式（常用）
const Welcome = () => {
  return <h1>Hello, World!</h1>;
};

// 箭头函数简写形式
const Welcome = () => <h1>Hello, World!</h1>;
```

### 组件命名规则

```jsx
// ✅ 正确：首字母大写（PascalCase）
function UserCard() {}
const UserProfile = () => {};
class App extends React.Component {}

// ❌ 错误：首字母小写会被识别为 HTML 标签
function userCard() {}  // React 会认为这是自定义 HTML 标签
```

---

## 📦 Props：组件的输入

Props 是从父组件传递给子组件的数据，类似于函数参数。

### 定义和使用 Props

```jsx
// 定义接收 props 的组件
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 解构 props（推荐）
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>You are {age} years old.</p>
    </div>
  );
}
```

### 使用组件（传递 Props）

```jsx
// 在父组件中使用
function App() {
  return (
    <div>
      <Greeting name="Alice" age={25} />
      <Greeting name="Bob" age={30} />
      <Greeting name="Charlie" age={35} />
    </div>
  );
}
```

### Props 默认值

```jsx
// 方法一：默认参数
function Greeting({ name = 'Guest' }) {
  return <h1>Hello, {name}!</h1>;
}

// 方法二：defaultProps（已废弃，不推荐）
Greeting.defaultProps = {
  name: 'Guest'
};
```

### Props 只读

⚠️ **重要原则：永远不要修改 props！**

```jsx
// ❌ 错误：尝试修改 props
function Counter({ count }) {
  count++;  // 不应该这样做！
  return <p>Count: {count}</p>;
}

// ✅ 正确：只读取 props
function Counter({ count }) {
  return <p>Count: {count}</p>;
}
```

---

## 🧩 组件组合

### 包含关系（Composition）

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Card title="用户信息">
      <p>姓名：张三</p>
      <p>邮箱：zhangsan@example.com</p>
      <button>编辑</button>
    </Card>
  );
}
```

### 特殊组件（Specialization）

```jsx
// 通用按钮组件
function Button({ variant, children, ...props }) {
  const className = `btn btn-${variant}`;
  return <button className={className} {...props}>{children}</button>;
}

// 特殊化使用
function App() {
  return (
    <div>
      <Button variant="primary">主要按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="danger">危险操作</Button>
    </div>
  );
}
```

### 容器组件与展示组件模式

```jsx
// 展示组件（Presentational）：关注 UI 外观
function UserList({ users, onUserClick }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// 容器组件（Container）：关注数据和逻辑
function UserListContainer() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers().then(data => setUsers(data));
  }, []);
  
  const handleUserClick = (userId) => {
    console.log('User clicked:', userId);
  };
  
  return <UserList users={users} onUserClick={handleUserClick} />;
}
```

---

## 🎨 组件设计原则

### 1. 单一职责原则

每个组件只做一件事，做好一件事。

```jsx
// ❌ 错误：组件职责过多
function UserProfileAndSettingsAndPosts() {
  // 显示用户信息
  // 显示设置选项
  // 显示用户帖子
  // ...
}

// ✅ 正确：拆分为多个组件
function UserProfile() {}  // 用户信息
function SettingsPanel() {}  // 设置面板
function UserPosts() {}  // 用户帖子
```

### 2. 可复用性

设计通用的、可配置的组件。

```jsx
// ❌ 硬编码，不可复用
function SubmitButton() {
  return <button className="blue-btn">提交</button>;
}

// ✅ 可配置，可复用
function Button({ 
  label, 
  color = 'blue', 
  size = 'medium',
  disabled = false,
  onClick 
}) {
  return (
    <button 
      className={`btn btn-${color} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
```

### 3. 保持纯净

相同的输入总是产生相同的输出（纯函数思想）。

```jsx
// ❌ 有副作用
function UserInfo() {
  const user = fetchUser();  // 直接获取数据
  document.title = user.name;  // 直接操作 DOM
  
  return <div>{user.name}</div>;
}

// ✅ 纯净组件（副作用通过 hooks 管理）
function UserInfo({ user }) {
  return <div>{user.name}</div>;
}
```

---

## 📁 项目实战：构建用户卡片系统

让我们用学到的知识构建一个实际的组件系统：

```jsx
// Avatar.jsx - 头像组件
function Avatar({ src, alt, size = 'medium' }) {
  const sizeClass = `avatar-${size}`;
  
  return (
    <img 
      className={`avatar ${sizeClass}`}
      src={src} 
      alt={alt || '用户头像'} 
    />
  );
}

// Badge.jsx - 徽章组件
function Badge({ text, type = 'info' }) {
  return (
    <span className={`badge badge-${type}`}>
      {text}
    </span>
  );
}

// UserCard.jsx - 用户卡片组件
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatar} alt={user.name} size="large" />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p className="role">{user.role}</p>
        <div className="badges">
          {user.skills.map(skill => (
            <Badge key={skill} text={skill} type="success" />
          ))}
        </div>
      </div>
    </div>
  );
}

// App.jsx - 应用主组件
function App() {
  const users = [
    {
      id: 1,
      name: '张三',
      role: '前端工程师',
      avatar: '/avatars/zhangsan.jpg',
      skills: ['React', 'TypeScript', 'Node.js']
    },
    // 更多用户...
  ];
  
  return (
    <div className="app">
      <h1>团队成员</h1>
      <div className="user-grid">
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 正确定义函数组件
- [ ] 使用 props 传递数据给组件
- [ ] 使用 children 进行组件组合
- [ ] 设计可复用的通用组件
- [ ] 理解单一职责原则并应用

---

## 📝 练习任务

### 任务 1：产品卡片组件库
创建一套产品展示相关的组件：
- `ProductCard` - 产品卡片（包含图片、名称、价格、描述）
- `PriceTag` - 价格标签（支持折扣价显示）
- `Rating` - 星级评分组件
- `StockBadge` - 库存状态徽章

### 任务 2：导航栏组件
创建一个响应式导航栏：
- `NavBar` - 导航容器
- `NavItem` - 导航项（支持激活状态）
- `NavDropdown` - 下拉菜单
- 支持 logo 和用户头像插槽

---

## 🔗 下一步

组件是 React 的基础！接下来学习 **Props 与 State**，让组件动起来！

[→ 04 - Props 与 State](../04-props-state/)
