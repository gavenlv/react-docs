# 04 - Props 与 State

## 🎯 本节目标
- 深入理解 Props 的使用场景和最佳实践
- 掌握 State 的概念和管理方式
- 理解 Props 和 State 的区别
- 学会正确地管理组件状态

---

## 📖 Props vs State

### 核心区别

| 特性 | Props (属性) | State (状态) |
|------|-------------|--------------|
| **来源** | 从父组件接收 | 组件内部定义 |
| **可变性** | 只读，不可修改 | 可变 |
| **作用** | 配置组件行为 | 管理动态数据 |
| **类比** | 函数参数 | 函数内部变量 |

### 类比理解
```
Props = 手机的外壳颜色（购买时确定，不可更改）
State = 手机的电量、信号强度（会随时间变化）
```

---

## 📦 Props 深度解析

### Props 类型检查

```jsx
// 使用 PropTypes 进行类型检查（需要安装 prop-types）
import PropTypes from 'prop-types';

function UserCard({ name, age, email, isActive }) {
  return (
    <div className={`user-card ${isActive ? 'active' : ''}`}>
      <h2>{name}</h2>
      <p>年龄: {age}</p>
      <p>邮箱: {email}</p>
    </div>
  );
}

// 定义 props 类型验证
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  email: PropTypes.string.isRequired,
  isActive: PropTypes.bool
};

// 默认值
UserCard.defaultProps = {
  age: 18,
  isActive: false
};
```

### 使用 TypeScript（推荐）

```tsx
interface UserCardProps {
  name: string;
  age?: number;
  email: string;
  isActive?: boolean;
}

function UserCard({ 
  name, 
  age = 18, 
  email, 
  isActive = false 
}: UserCardProps) {
  // ...
}
```

### Props 解构技巧

```jsx
// 基本解构
function Component({ title, content, author }) {}

// 带默认值的解构
function Button({ label = 'Click', color = 'blue', onClick = () => {} }) {}

// 重命名 + 默认值
function User({ name: userName, age: userAge = 0 }) {}

// 展开运算符收集剩余 props
function Card({ title, ...restProps }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div {...restProps} />  {/* 将其他 props 传递给子元素 */}
    </div>
  );
}
```

### 回调函数作为 Props

```jsx
// 子组件通过回调通知父组件
function DeleteButton({ onConfirm, itemName }) {
  const handleClick = () => {
    if (window.confirm(`确定要删除 ${itemName} 吗？`)) {
      onConfirm();
    }
  };
  
  return <button onClick={handleClick}>删除</button>;
}

// 父组件提供回调函数
function ItemList() {
  const [items, setItems] = useState(['项目1', '项目2', '项目3']);
  
  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
          <DeleteButton 
            itemName={item}
            onConfirm={() => handleDelete(index)}
          />
        </li>
      ))}
    </ul>
  );
}
```

---

## 🔄 State 完全指南

### useState Hook 基础

```jsx
import { useState } from 'react';

function Counter() {
  // 声明一个 state 变量 "count"，初始值为 0
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加 (+1)
      </button>
      <button onClick={() => setCount(count - 1)}>
        减少 (-1)
      </button>
      <button onClick={() => setCount(0)}>
        重置
      </button>
    </div>
  );
}
```

### useState 语法详解

```jsx
const [stateValue, setStateValue] = useState(initialValue);
```

**参数：**
- `initialValue`: state 的初始值（可以是任意类型）

**返回值：**
- `stateValue`: 当前的 state 值
- `setStateValue`: 更新 state 的函数

### State 更新规则

#### 规则一：State 更新是异步的

```jsx
function Example() {
  const [count, setCount] = useState(0);
  
  const handleMultipleUpdates = () => {
    setCount(count + 1);     // 基于 count=0 → 1
    setCount(count + 1);     // 仍然基于 count=0 → 1（不是 2！）
    console.log(count);       // 输出 0（异步）
  };
  
  // ✅ 正确做法：使用函数式更新
  const handleCorrectUpdate = () => {
    setCount(prev => prev + 1);  // prev=0 → 1
    setCount(prev => prev + 1);  // prev=1 → 2
    setCount(prev => prev + 1);  // prev=2 → 3
    // 最终结果：3 ✓
  };
}
```

#### 规则二：State 更新会触发重新渲染

```jsx
function RenderExample() {
  const [name, setName] = useState('');
  
  console.log('组件渲染了！');  // 每次 state 变化都会执行
  
  return (
    <input 
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="输入名字"
    />
  );
}
```

#### 规则三：不要直接修改 State

```jsx
// ❌ 错误：直接修改（Mutation）
function BadExample() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const addItem = () => {
    items.push(4);           // 直接修改原数组
    setItems(items);         // React 无法检测到变化！
  };
}

// ✅ 正确：创建新对象（Immutable）
function GoodExample() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const addItem = () => {
    const newItems = [...items, 4];  // 创建新数组
    setItems(newItems);
  };
}
```

### 复杂 State 管理

#### 对象类型 State

```jsx
function UserProfile() {
  const [user, setUser] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    address: {
      city: '北京',
      street: '科技路'
    }
  });
  
  // 更新单个属性（保留其他属性）
  const updateName = (newName) => {
    setUser(prevUser => ({
      ...prevUser,
      name: newName
    }));
  };
  
  // 更新嵌套属性
  const updateCity = (newCity) => {
    setUser(prevUser => ({
      ...prevUser,
      address: {
        ...prevUser.address,
        city: newCity
      }
    }));
  };
}
```

#### 数组类型 State

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React', completed: false },
    { id: 2, text: '写代码', completed: true }
  ]);
  
  // 添加项
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };
  
  // 删除项
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 切换完成状态
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  // 清空已完成
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
}
```

### 多个 State 还是单个 State？

```jsx
// 方案一：多个独立的 state（推荐用于不相关的数据）
function FormMultipleStates() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ...
}

// 方案二：单个对象 state（推荐用于相关联的数据）
function FormSingleState() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
}
```

**选择建议：**
- 数据之间没有关联 → 多个独立 State
- 数据逻辑上属于同一实体 → 单个 State 对象

---

## 💡 最佳实践

### 1. 提升 State 到合适的位置

```jsx
// ❌ 不必要的重复状态
function Parent() {
  const [user, setUser] = useState({ name: '张三' });
  return <Child name={user.name} />;
}

function Child({ name }) {
  const [displayName, setDisplayName] = useState(name);  // 冗余！
  return <h1>{displayName}</h1>;
}

// ✅ 直接使用 props 或提升到需要的最低层级
function Child({ name }) {
  return <h1>{name}</h1>;
}
```

### 2. 避免过度同步 State

```jsx
// ❌ 冗余的状态
function BadForm() {
  const [fullName, setFullName] = useState('');
  const [firstName, setFirstName] = useState('');  // 可从 fullName 推导
  const [lastName, setLastName] = useState('');    // 可从 fullName 推导
  
  useEffect(() => {
    const parts = fullName.split(' ');
    setFirstName(parts[0]);
    setLastName(parts.slice(1).join(' '));
  }, [fullName]);
}

// ✅ 只保留必要的状态
function GoodForm() {
  const [fullName, setFullName] = useState('');
  
  // 需要时计算派生值
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ').slice(1).join(' ');
}
```

### 3. 合理初始化 State

```jsx
// ❌ 每次渲染都会调用 expensiveFunction()
const [data, setData] = useState(expensiveFunction());

// ✅ 只在初始渲染时调用一次
const [data, setData] = useState(() => expensiveFunction());

// 或者使用 lazy initializer
const [data, setData] = useState(() => {
  const initial = computeInitialValue();
  return initial;
});
```

---

## 🔍 调试技巧

```jsx
function DebuggableComponent() {
  const [count, setCount] = useState(0);
  
  // 开发环境下打印状态变化
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Count changed:', count);
    }
  }, [count]);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </>
  );
}
```

**推荐工具：**
- React DevTools 浏览器扩展
- Console 日志
- React Profiler

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 清楚区分 Props 和 State 的适用场景
- [ ] 正确使用 useState 管理各种类型的 State
- [ ] 遵循不可变性原则更新 State
- [ ] 使用函数式更新处理连续更新
- [ ] 设计合理的 State 结构

---

## 📝 练习任务

### 任务 1：表单组件
创建一个注册表单：
- 用户名（必填，2-20 字符）
- 邮箱（格式验证）
- 密码（最少 6 位）
- 确认密码（必须与密码一致）
- 实时显示验证反馈

### 任务 2：购物车
实现购物车功能：
- 显示商品列表（名称、价格、数量）
- 增减商品数量
- 删除商品
- 计算总价
- 清空购物车

---

## 🔗 下一步

掌握 State 后，让我们学习如何与用户交互！

[→ 05 - 事件处理](../05-event-handling/)
