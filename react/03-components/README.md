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

## 🔬 组件的底层原理

> 前面我们学会了怎么定义和使用组件，现在让我们看看 React 内部到底是怎么处理组件的。理解这些原理，能帮你理解"组件为什么会重新渲染"、"性能问题出在哪里"等进阶问题。

### 1. 组件到底是什么？——函数调用模型

#### React 组件本质上就是函数

在 React 的世界里，**函数组件就是一个普通的 JavaScript 函数**。React 的工作就是：调用你的函数，拿到返回的 React Element，然后把 Element 渲染到页面上。

```jsx
// 你定义的组件（就是一个函数）
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}

// React 内部做的事情（简化版）：
function renderComponent(componentFunction, props) {
  // 1. 调用你的组件函数，传入 props
  const element = componentFunction(props);
  // 2. 拿到返回的 React Element
  // 3. 递归处理 Element，最终操作 DOM
  return element;
}

// 当 React 看到 <Welcome name="张三" /> 时：
// 等价于调用：Welcome({ name: "张三" })
// 返回：<h1>Hello, 张三</h1>（这是一个 React Element 对象）
```

> 💡 **大白话**：React 就像一个"函数调用器"。你给它一个函数（组件）和参数（props），它帮你调用这个函数，然后把结果画到屏幕上。就这么简单——没有魔法，只有函数调用。

#### React 调用你的组件函数时发生了什么？

```
用户操作（点击、输入...）
        │
        ▼
┌───────────────────┐
│  触发 State 更新    │  ← setState / 父组件重新渲染
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Render 阶段       │  ← React 调用你的组件函数
│  （纯计算，无副作用） │     生成新的 React Element 树
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Diff 对比         │  ← 对比新旧 Element 树
│  （找出变化的部分）  │     找出最小的 DOM 操作
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Commit 阶段       │  ← 实际操作 DOM
│  （执行副作用）      │     把变化应用到页面上
└───────────────────┘
```

> 🔍 **两个阶段的关键区别**：Render 阶段是"想"（计算要变成什么样），Commit 阶段是"做"（实际改变页面）。React 可以在 Render 阶段随时打断重来（比如有更高优先级的更新进来），但一旦进入 Commit 阶段就必须一口气完成。

#### 用代码模拟 React 的渲染流程（简化版）

```javascript
// 这是一个极其简化的 React 渲染模拟，帮助你理解原理
function miniReact() {
  // 存放所有组件的状态
  const stateStore = new Map();
  
  // 模拟 React 的渲染过程
  function render(reactElement, container) {
    // 如果 Element 的 type 是函数 → 说明是组件
    if (typeof reactElement.type === 'function') {
      const component = reactElement.type;
      const props = reactElement.props;
      
      // 🔑 关键：调用组件函数，获取它返回的 Element
      const childElement = component(props);
      
      // 递归渲染子 Element
      render(childElement, container);
    } 
    // 如果 type 是字符串 → 说明是原生 HTML 标签
    else if (typeof reactElement.type === 'string') {
      // 创建真实 DOM 元素
      const domElement = document.createElement(reactElement.type);
      
      // 设置属性
      Object.keys(reactElement.props).forEach(key => {
        if (key === 'children') return;  // children 单独处理
        domElement.setAttribute(key, reactElement.props[key]);
      });
      
      // 处理子元素
      const children = reactElement.props.children;
      if (Array.isArray(children)) {
        children.forEach(child => render(child, domElement));
      } else if (typeof children === 'string') {
        domElement.textContent = children;
      }
      
      // 挂载到容器
      container.appendChild(domElement);
    }
  }
  
  return { render };
}

// 使用我们的迷你 React
miniReact().render(
  React.createElement(Welcome, { name: '张三' }),
  document.getElementById('root')
);
// 内部流程：调用 Welcome({ name: '张三' }) → 返回 h1 Element → 创建真实 <h1> DOM
```

#### 为什么组件必须是纯函数？（副作用会导致什么问题）

**纯函数**：相同的输入永远产生相同的输出，且没有副作用。

```jsx
// ✅ 纯函数组件：输入相同的 props，永远返回相同的 Element
function PureCounter({ count }) {
  return <p>Count: {count}</p>;
}

// ❌ 不纯的组件：有副作用
function ImpureCounter({ count }) {
  // 直接修改外部变量（副作用！）
  window.lastRenderCount = count;
  
  // 直接操作 DOM（副作用！）
  document.title = `Count: ${count}`;
  
  // 调用 API（副作用！）
  fetch(`/api/log?count=${count}`);
  
  // 随机值（相同的输入，不同的输出！）
  const randomColor = Math.random() > 0.5 ? 'red' : 'blue';
  
  return <p style={{ color: randomColor }}>Count: {count}</p>;
}
```

> ⚠️ **为什么副作用会导致问题？**
>
> React 可能会调用你的组件函数多次（在 StrictMode 下甚至会故意调用两次来帮你发现问题）。如果你的组件有副作用，这些副作用就会被重复执行：
> - 发了两次 API 请求 → 数据重复
> - 直接操作了 DOM → 和 React 的 DOM 操作冲突
> - 修改了外部变量 → 数据不一致
>
> 💡 **正确做法**：副作用应该放在 `useEffect` 中。React 会在 Render 阶段只做"纯计算"，在 Commit 阶段之后才执行 `useEffect` 中的副作用。

---

### 2. 组件实例 vs 组件类型 vs 组件元素

这三者的区别是 React 中**最容易混淆的概念**，但搞清楚它们非常重要：

```
组件类型（Component Type）     = 咖啡机的"型号/图纸"    （定义一次）
组件元素（Component Element）   = 一张"点单据"          （每次渲染都有）
组件实例（Component Instance） = 具体做出的那杯咖啡      （内存中的对象）
```

| 概念 | 是什么 | 创建时机 | 数量 | 类比 |
|------|--------|----------|------|------|
| **组件类型** | 你定义的函数 `function App() {...}` | 你写代码时 | 1 个（每个组件定义一个） | 咖啡机的型号设计图 |
| **组件元素** | `React.createElement(App, props)` | 每次渲染时 | 每次渲染都创建新的 | 顾客的点单小票 |
| **组件实例** | React 内部维护的组件状态对象 | 首次挂载时 | 每个挂载的组件一个 | 实际做出来的那杯咖啡 |

```jsx
// 1. 组件类型：这就是一个普通的函数，全局只有一个
function Counter({ initialValue }) {
  const [count, setCount] = useState(initialValue);
  return <p>{count}</p>;
}
// Counter 本身是一个函数引用，在内存中只有一份

// 2. 组件元素：每次渲染都会创建新的 Element 对象
// 当 React 处理 JSX 时：
<Counter initialValue={0} />
// → React.createElement(Counter, { initialValue: 0 })
// → { type: Counter, props: { initialValue: 0 } }
// 这是一个全新的对象，每次渲染都是新的

// 3. 组件实例：React 内部为每个挂载的组件维护的状态
// 当 Counter 首次渲染到页面上时，React 会创建一个内部对象来管理：
// - useState 的状态值
// - useEffect 的引用
// - ref 的值
// - fiber 节点（调度信息）
// 这个内部对象就是"组件实例"
```

> 💡 **大白话**：想象一个咖啡店。
> - **组件类型** = 咖啡机的说明书（怎么制作咖啡），只有一份
> - **组件元素** = 每张点单小票（"一杯美式，少冰"），每次有人点单都会产生新的
> - **组件实例** = 正在做的那杯咖啡（有具体的温度、容量等状态）
>
> React 的渲染过程就是：读取点单小票（Element）→ 按照说明书（Type）制作咖啡 → 得到实例（Instance）。

---

### 3. 组件的重新渲染机制

#### 什么时候 React 会重新调用你的组件函数？

React 重新渲染组件只有以下几种情况：

```
触发重新渲染的条件
├── 1. 自身的 State 发生变化           ← setState / dispatch
├── 2. 父组件重新渲染                  ← 不管 props 变没变！
├── 3. Context 的值发生变化             ← useContext
└── 4. 使用了 memo 但 props 变了       ← React.memo 浅比较失败
```

```jsx
function Parent() {
  const [parentCount, setParentCount] = useState(0);
  const [other, setOther] = useState('');
  
  return (
    <div>
      {/* 点击按钮 → Parent 重新渲染 → Child 也会重新渲染！ */}
      <button onClick={() => setParentCount(c => c + 1)}>
        父组件计数: {parentCount}
      </button>
      
      <input onChange={e => setOther(e.target.value)} />
      
      {/* ⚠️ 即使 other 变化和 Child 完全无关，
          Child 也会因为父组件渲染而重新渲染 */}
      <Child name="小明" />
    </div>
  );
}

function Child({ name }) {
  console.log('Child 重新渲染了！');  // Parent 的任何状态变化都会触发这行
  return <p>我是 {name}</p>;
}
```

#### 父组件渲染 → 子组件一定渲染吗？

**不一定！** 可以通过 `React.memo` 来避免不必要的子组件渲染：

```jsx
// React.memo 包裹后的组件会进行 props 的浅比较
// 只有 props 变了才会重新渲染
const MemoizedChild = React.memo(function Child({ name }) {
  console.log('MemoizedChild 重新渲染了！');
  return <p>我是 {name}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        计数: {count}
      </button>
      
      {/* ✅ 因为 name="小明" 永远不变，
          所以 Parent 重新渲染时 MemoizedChild 不会重新渲染 */}
      <MemoizedChild name="小明" />
    </div>
  );
}
```

> 💡 **大白话**：`React.memo` 就像一个"备忘录"。React 会在备忘录上记下上次传给 Child 的 props，下次渲染前先对比一下新的 props 和上次的一样不一样。如果一样就不渲染了，省点力气。

#### React.memo 的工作原理

```
┌────────────────────────────────────────────┐
│            React.memo 的判断流程              │
│                                            │
│  新的 props 进来了                           │
│       │                                    │
│       ▼                                    │
│  ┌─────────────┐                           │
│  │ 浅比较       │                           │
│  │ Object.is(   │                           │
│  │  新props,     │                           │
│  │  旧props)    │                           │
│  └─────┬───────┘                           │
│        │                                   │
│    相同 │ 不同                               │
│        │                                   │
│   ┌────┴────┐                               │
│   ▼         ▼                               │
│ 跳过渲染   重新渲染                           │
│ 复用上次   调用组件函数                        │
│ 的结果                                      │
└────────────────────────────────────────────┘
```

⚠️ **注意**：`React.memo` 是**浅比较**（只比较第一层属性），如果 props 是对象或数组，即使内容没变但引用变了，也会重新渲染：

```jsx
// ⚠️ 每次父组件渲染，style 都会创建新对象 → 浅比较失败 → 子组件重新渲染
<MemoizedChild style={{ color: 'red' }} />

// ✅ 用 useMemo 缓存对象引用
const style = useMemo(() => ({ color: 'red' }), []);
<MemoizedChild style={style} />

// ⚠️ 每次创建新数组
<MemoizedChild items={[1, 2, 3]} />

// ✅ 用 useMemo 缓存数组
const items = useMemo(() => [1, 2, 3], []);
<MemoizedChild items={items} />
```

#### 渲染 vs 提交（Render vs Commit）两阶段

React 的更新过程分为两个明确的阶段：

| 阶段 | 做什么 | 可以中断吗 | 有副作用吗 |
|------|--------|-----------|-----------|
| **Render 阶段** | 调用组件函数，生成 Element 树，Diff 对比 | ✅ 可以（Concurrent Mode） | ❌ 没有 |
| **Commit 阶段** | 操作 DOM，执行 useEffect | ❌ 不可以 | ✅ 有 |

```
时间线：
──────┬──────────────────────┬──────────────────────┬─────
      │   Render 阶段        │   Commit 阶段         │
      │                      │                      │
      │ ① 调用组件函数        │ ⑤ 操作 DOM            │
      │ ② 生成新的 Element 树 │ ⑥ 更新 DOM 属性       │
      │ ③ 和旧的树做 Diff     │ ⑦ 执行 useEffect      │
      │ ④ 计算出最小更新集    │ ⑧ 执行 useLayoutEffect│
      │                      │                      │
      │ （纯计算，可被中断）    │ （有副作用，不可中断）  │
──────┴──────────────────────┴──────────────────────┴─────
```

> 🔍 **为什么分成两阶段？**
> 
> 因为 Render 阶段的工作（调用函数、对比差异）都是"纯计算"，即使做了一半被打断也没有任何副作用，随时可以重来。但 Commit 阶段会真正修改页面（操作 DOM），一旦开始就必须一口气完成，否则用户会看到"改了一半"的页面。
>
> 这就好比装修房子：设计图纸（Render 阶段）可以画了擦、擦了画，但一旦开始砸墙铺砖（Commit 阶段），就必须一口气干完。

---

## 🔗 下一步

组件是 React 的基础！接下来学习 **Props 与 State**，让组件动起来！

[→ 04 - Props 与 State](../04-props-state/)
