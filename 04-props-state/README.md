# 04 - Props 与 State

## 🎯 本节目标
- 深入理解 Props 的使用场景和最佳实践
- 掌握 State 的概念和管理方式
- 理解 Props 和 State 的区别
- 学会正确地管理组件状态
- 理解 React 数据流动的底层哲学

---

## 📖 Props vs State

### 核心区别

| 特性 | Props (属性) | State (状态) |
|------|-------------|--------------|
| **来源** | 从父组件接收 | 组件内部定义 |
| **可变性** | 只读，不可修改 | 可变 |
| **作用** | 配置组件行为 | 管理动态数据 |
| **类比** | 函数参数 | 函数内部变量 |

### 生活中的类比理解

想象你在经营一家 **奶茶店**：

```
Props = 你点单时告诉店员的要求（如"少糖、加冰、珍珠奶茶"）
       → 这是你给店员的"指令"，店员只能照做，不能自己改

State  = 奶茶店的库存量（珍珠还剩多少、冰块够不够）
       → 这是店内部的数据，会随着时间变化
       → 比如卖出一杯珍珠奶茶，珍珠库存就会减少
```

再举个例子——**寄快递**：

```
Props = 快递单上的信息（收件人姓名、地址、电话）
       → 这些信息是寄件人填好的，快递员不能自己改

State  = 包裹当前的位置状态（在仓库 → 运输中 → 派送中 → 已签收）
       → 这些信息会随着时间自动变化
```

### 为什么 React 要区分 Props 和 State？

这是 React 设计哲学的核心之一：**单向数据流（Unidirectional Data Flow）**。

> 如果所有组件都能随意修改彼此的数据，那么当出现 Bug 时，你根本不知道是谁改了数据、什么时候改的。就像一间教室里如果所有人都能随便改成绩单，那最后谁也不知道哪个成绩是真的。
>
> React 的做法是：**数据只能从父组件流向子组件（通过 Props），子组件如果需要改变数据，只能通知父组件来改（通过回调函数）**。这样数据的变化路径就是清晰可追踪的。

---

## 📦 Props 深度解析

### 什么是 Props？

**Props（Properties 的缩写）** 是 React 组件之间传递数据的方式。你可以把它理解为：

- **函数的参数**：就像 `function add(a, b)` 中的 `a` 和 `b` 一样，Props 是传递给组件的"输入"
- **组件的"配置项"**：就像你买手机时选择颜色、内存大小一样，Props 用来告诉组件"你应该是什么样子"

**关键特性：Props 是只读的（Read-Only）**

这个规则非常重要！子组件绝对不能修改接收到的 Props。为什么？

> 假设你爸爸给了你 100 块零花钱（Props），你不能自己偷偷改成 200 块。如果你需要更多钱，你必须**告诉爸爸**（调用回调函数），让爸爸来决定是否给你更多。
>
> 如果子组件能随意修改 Props，父组件就失去了对数据的控制权，整个应用的数据流就会变成一团乱麻。

### Props 的本质——函数参数

```jsx
// React 组件本质上就是一个函数
function Greeting(props) {
  // props 就像函数的参数
  return <h1>Hello, {props.name}!</h1>;
}

// 调用组件 = 调用函数，传入参数
<Greeting name="张三" />
// 等价于调用函数：Greeting({ name: "张三" })
```

看到没有？**React 组件就是一个函数，Props 就是这个函数的参数**。你传入不同的参数，函数就返回不同的结果。就这么简单！

### Props 类型检查

**为什么需要类型检查？**

> 想象你是奶茶店的店员，客人点单时说"我要一杯奶茶"。但你不知道他想要什么口味、什么大小、多少糖。如果客人没说清楚，你可能会做错。
>
> Props 类型检查就是帮你在开发阶段就发现"客人没说清楚"的问题，而不是等到用户使用时才发现 Bug。

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
  name: PropTypes.string.isRequired,  // 字符串类型，必填
  age: PropTypes.number,               // 数字类型，选填
  email: PropTypes.string.isRequired,  // 字符串类型，必填
  isActive: PropTypes.bool             // 布尔类型，选填
};

// 默认值（当父组件没传这个 prop 时，使用默认值）
UserCard.defaultProps = {
  age: 18,
  isActive: false
};
```

### 使用 TypeScript（推荐）

如果你使用 TypeScript，类型检查会更加强大和自然：

```tsx
// TypeScript 在编译时就能检查类型，比 PropTypes 更早发现问题
interface UserCardProps {
  name: string;        // 必填：字符串
  age?: number;        // 选填：数字（? 表示可选）
  email: string;       // 必填：字符串
  isActive?: boolean;  // 选填：布尔值
}

function UserCard({ 
  name, 
  age = 18,          // 默认值
  email, 
  isActive = false   // 默认值
}: UserCardProps) {
  return (
    <div className={`user-card ${isActive ? 'active' : ''}`}>
      <h2>{name}</h2>
      <p>年龄: {age}</p>
      <p>邮箱: {email}</p>
    </div>
  );
}
```

**Props 和 TypeScript 的关系**：TypeScript 把类型检查提前到了你写代码的时候（编译时），而 PropTypes 是在运行时才检查。这就好比 TypeScript 是"未雨绸缪"，PropTypes 是"亡羊补牢"——当然，两者一起用也可以。

### Props 解构技巧

解构赋值是 JavaScript 的语法，但在 React 中用得特别多，因为它让代码更简洁。

```jsx
// 基本解构：直接从 props 中取出需要的属性
// 等价于写 const name = props.name; const content = props.content; ...
function Component({ title, content, author }) {
  return <h1>{title} - by {author}</h1>;
}

// 带默认值的解构：如果父组件没传，就用默认值
function Button({ label = 'Click', color = 'blue', onClick = () => {} }) {
  return <button style={{ color }}>{label}</button>;
}

// 重命名 + 默认值
// props 中叫 name，但组件内部想叫 userName
function User({ name: userName, age: userAge = 0 }) {
  return <p>{userName} - {userAge}岁</p>;
}

// 展开运算符收集剩余 props
// 类似于 Python 中的 **kwargs
function Card({ title, ...restProps }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div {...restProps} />  {/* 将其他 props 传递给子元素 */}
    </div>
  );
}

// 使用场景示例
// 父组件传了很多 props 给 Card，Card 只需要 title，其他的全部传给内部的 div
<Card 
  title="我的卡片"
  className="custom-card"
  id="card-1"
  data-testid="test-card"
  onClick={handleClick}
/>
// Card 内部：title = "我的卡片", restProps = { className, id, data-testid, onClick }
```

### children —— React 中最特殊的 Prop

`children` 是 React 内置的一个特殊 Prop，代表组件标签之间的内容。它非常重要，几乎每个 React 开发者都会用到。

```jsx
// 定义一个"卡片容器"组件
function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">
        {children}  {/* 这里会渲染标签之间的所有内容 */}
      </div>
    </div>
  );
}

// 使用时，标签之间的内容就是 children
function App() {
  return (
    <Card title="用户信息">
      <p>姓名：张三</p>
      <p>年龄：25</p>
      <button>编辑</button>
    </Card>
  );
}
// 在 Card 组件内部，children = [<p>姓名：张三</p>, <p>年龄：25</p>, <button>编辑</button>]
```

**生活中的类比**：`children` 就像一个**相框**。相框本身是固定的（`Card` 组件），但你可以在里面放任何照片（`children`）。相框不知道也不关心你放的是什么照片，它只负责展示你放进去的东西。

### 回调函数作为 Props

这是 React 中**父子组件通信**的核心方式。子组件不能直接修改父组件的数据，但可以通过"回调函数"告诉父组件"我需要你做什么"。

```jsx
// 子组件：一个删除按钮，它不知道怎么删除数据，但它可以"通知"父组件
function DeleteButton({ onConfirm, itemName }) {
  const handleClick = () => {
    if (window.confirm(`确定要删除 ${itemName} 吗？`)) {
      onConfirm();  // 调用父组件传来的函数，相当于"按门铃通知父母"
    }
  };
  
  return <button onClick={handleClick}>删除</button>;
}

// 父组件：知道怎么管理数据，把删除逻辑作为回调传给子组件
function ItemList() {
  const [items, setItems] = useState(['项目1', '项目2', '项目3']);
  
  // 父组件定义"怎么删除"，通过 props 传给子组件
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
            // onConfirm 就是一个回调函数
            // 子组件调用它，相当于子组件告诉父组件"请帮我删除第 index 个项目"
          />
        </li>
      ))}
    </ul>
  );
}
```

**生活中的类比**：这就像酒店的**门铃**。

> 酒店房间里的门铃（子组件）不能自己开门，但它可以发出通知。当客人按下门铃时，前台（父组件）就会收到通知，然后前台来决定要不要开门。
>
> `onConfirm` 就是门铃的"信号线"——子组件按下按钮，信号通过这条线传给父组件，父组件收到信号后执行相应的操作。

---

## 🔄 State 完全指南

### 什么是 State？

**State（状态）** 是组件内部用来存储和管理**会变化的数据**的机制。它是 React 组件的"记忆"。

**生活中的类比**：

> 想象一个**计算器**。当你按了 "5" 再按 "+" 再按 "3"，计算器需要"记住"当前的值是 8。这个"记忆"就是 State。
>
> 再比如一个**电子手表**，它每秒钟都需要更新时间。这个"当前时间"就是 State——它在不断变化，组件需要根据它来重新显示界面。

**State 和普通变量的区别**（这是很多人初学时的困惑）：

```jsx
function Counter() {
  // 普通变量 —— 修改它不会触发界面更新！
  let count = 0;
  
  const handleClick = () => {
    count = count + 1;  // ❌ 变量确实变成了 1，但界面不会变！
    console.log(count);  // 打印 1
  };
  
  return (
    <div>
      <p>当前计数: {count}</p>  {/* 永远显示 0 */}
      <button onClick={handleClick}>增加</button>
    </div>
  );
}
```

> 为什么普通变量不行？因为 React 的工作方式是：**当 State 或 Props 变化时，React 会重新调用组件函数，生成新的界面**。普通变量的变化不会触发这个过程，所以界面不会更新。
>
> 这就像一面**智能镜子**：State 是镜子里显示的内容。当你改变了 State（比如做了个鬼脸），镜子会自动"刷新"，显示你新的样子。但如果你只在一个普通变量里记录了什么，镜子是不知道的。

### useState Hook 基础

`useState` 是 React 提供的一个"钩子"（Hook），用来给函数组件添加 State 能力。

```jsx
import { useState } from 'react';

function Counter() {
  // 声明一个 state 变量 "count"，初始值为 0
  // count: 当前的值（只读，不要直接修改它）
  // setCount: 更新 count 的函数（必须用它来修改 count）
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
- `initialValue`: state 的初始值（可以是任意类型：数字、字符串、数组、对象、布尔值...）

**返回值（一个数组，包含两个元素）：**
- `stateValue`: 当前的 state 值（在当前渲染周期内，它是固定不变的）
- `setStateValue`: 更新 state 的函数（调用它才会触发重新渲染）

**这行代码做了什么？**

> 1. `useState(0)` —— 告诉 React："我要创建一个叫 count 的状态，初始值是 0"
> 2. React 把这个状态存在自己的"记忆库"里
> 3. 每次你的组件被渲染时，`count` 就是记忆库里的当前值
> 4. 当你调用 `setCount(newValue)` 时，React 会更新记忆库里的值，然后**自动重新渲染你的组件**

**为什么用数组解构？**

```jsx
// useState 返回的是一个数组：[当前值, 更新函数]
// 所以 const [count, setCount] = useState(0) 等价于：
const result = useState(0);
const count = result[0];       // 当前值
const setCount = result[1];    // 更新函数

// 数组解构只是一种更简洁的写法，名字你可以随意起
const [myCount, updateMyCount] = useState(0);  // 完全可以
const [age, setAge] = useState(25);             // 也可以
```

### State 更新规则

#### 规则一：State 更新是异步的

这是初学者最容易踩坑的地方！

```jsx
function Example() {
  const [count, setCount] = useState(0);
  
  // ❌ 你可能以为这会让 count 变成 2，但实际上只会变成 1
  const handleMultipleUpdates = () => {
    setCount(count + 1);     // 基于 count=0 → 1
    setCount(count + 1);     // 仍然基于 count=0 → 1（不是 2！）
    console.log(count);       // 输出 0（因为此时还没重新渲染）
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

**为什么会这样？**

> 想象你在餐厅点菜。你对服务员说："我要加一盘炒饭"，然后紧接着又说："我还要再加一盘炒饭"。
>
> 如果服务员还没来得及把第一个订单传给厨房（异步处理），他就会记住两份炒饭的请求，然后一次性传给厨房："客人要两盘炒饭"。
>
> 但如果你用的是 `setCount(count + 1)` 这种写法，React 会把你这两句话都理解为"在当前数量（0）的基础上加 1"，最终结果只是 1。
>
> 而使用 `setCount(prev => prev + 1)` 这种函数式更新，就相当于你告诉服务员："无论现在有几盘炒饭，都再加一盘"。这样服务员就能正确地累积你的请求。

**函数式更新的 `prev` 是什么？**

`prev` 是 React 提供的**最新的 state 值**。即使有多次更新排队，React 也会保证每次调用时 `prev` 都是最新的。这个名字可以随便取（`prevCount`、`oldValue`、`current` 都可以），它只是参数名而已。

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

**渲染过程详解**：

> 1. 初始渲染：React 调用 `RenderExample()`，`name` 是 `''`，显示一个空的输入框
> 2. 用户输入 "A"：触发 `onChange` → `setName('A')` → React 重新调用 `RenderExample()`，此时 `name` 是 `'A'`
> 3. 用户输入 "B"：触发 `onChange` → `setName('AB')` → React 再次重新调用 `RenderExample()`，此时 `name` 是 `'AB'`
>
> 每次调用 `setName` 都会触发这个循环。React 做了大量优化工作（后面会学到的 Virtual DOM 和 Diff 算法），让这个"重新渲染"过程尽量高效。

#### 规则三：不要直接修改 State（不可变性原则）

```jsx
// ❌ 错误：直接修改（Mutation）
function BadExample() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const addItem = () => {
    items.push(4);           // 直接修改原数组
    setItems(items);         // React 无法检测到变化！因为数组的引用没变
  };
}

// ✅ 正确：创建新对象（Immutable）
function GoodExample() {
  const [items, setItems] = useState([1, 2, 3]);
  
  const addItem = () => {
    const newItems = [...items, 4];  // 创建一个全新的数组
    setItems(newItems);               // React 发现是新数组，触发更新
  };
}
```

**为什么 React 要求不可变性？**

这是 React 性能优化的核心。React 使用"引用比较"来判断 State 是否变化了：

> 想象两个完全一样的笔记本（`[1, 2, 3]` 和 `[1, 2, 3]`）。React 不检查笔记本里面写了什么内容（那太慢了），它只检查"这是不是同一本笔记本"（比较引用地址）。
>
> - 如果你直接修改原数组 `items.push(4)`，笔记本还是同一本，React 以为没变化 → 不更新界面
> - 如果你创建新数组 `[...items, 4]`，这是一本全新的笔记本 → React 发现不同 → 更新界面
>
> 这就是为什么必须创建新对象！因为 React 靠"是不是同一个对象"来判断是否需要更新，而不是深入比较对象的内容（内容比较太消耗性能了）。

**常用的不可变操作速查**：

```jsx
// 数组操作
const newArr = [...arr];                    // 复制数组
const newArr = [...arr, newItem];           // 末尾添加
const newArr = [newItem, ...arr];           // 开头添加
const newArr = arr.filter(item => ...);    // 删除元素
const newArr = arr.map(item => ...);       // 更新元素

// 对象操作
const newObj = { ...obj };                 // 复制对象
const newObj = { ...obj, key: newValue };  // 更新属性
const { keyToRemove, ...newObj } = obj;    // 删除属性
```

### 复杂 State 管理

#### 对象类型 State

当 State 是一个对象时，更新时需要特别小心——你必须保留不想改变的其他属性。

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
  
  // ✅ 更新单个属性（保留其他属性不变）
  const updateName = (newName) => {
    setUser(prevUser => ({
      ...prevUser,   // 先展开旧对象，保留 name、email、age、address
      name: newName  // 然后覆盖 name 属性
    }));
  };
  
  // ✅ 更新嵌套属性（需要展开两层）
  const updateCity = (newCity) => {
    setUser(prevUser => ({
      ...prevUser,               // 保留外层所有属性
      address: {                  // 覆盖 address
        ...prevUser.address,      // 保留 address 的其他属性（street）
        city: newCity             // 覆盖 city
      }
    }));
  };
  
  // ❌ 错误：这样会丢失 address 属性！
  const badUpdate = (newName) => {
    setUser({ name: newName });  // email、age、address 全丢了！
  };
}
```

**展开运算符 `...` 的作用**：

> `...prevUser` 就像把 `prevUser` 这个对象的所有属性"摊开"铺在地上，然后你可以选择性地覆盖某些属性。没有被覆盖的属性会保留原样。
>
> ```
> 旧对象：{ name: '张三', email: 'xxx', age: 25 }
> 展开后：name: '张三', email: 'xxx', age: 25
> 覆盖 name：
> 新对象：{ name: '李四', email: 'xxx', age: 25 }  ← email 和 age 被保留了
> ```

#### 数组类型 State

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习 React', completed: false },
    { id: 2, text: '写代码', completed: true }
  ]);
  
  // ✅ 添加项：创建新数组，包含旧数组所有元素 + 新元素
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };
  
  // ✅ 删除项：用 filter 创建一个不包含目标元素的新数组
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // ✅ 切换完成状态：用 map 创建一个新数组，只修改目标元素
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  // ✅ 清空已完成：用 filter 筛选出未完成的项
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
}
```

### 多个 State 还是单个 State？

这是实际开发中经常面临的选择。

```jsx
// 方案一：多个独立的 state
// 适用场景：数据之间没有关联
function FormMultipleStates() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // 每个状态独立更新，互不影响
  // ✅ 优点：更新某个字段时不会影响其他字段
  // ✅ 优点：不需要合并对象，代码简单
  // ❌ 缺点：状态多了会很分散
}

// 方案二：单个对象 state
// 适用场景：数据逻辑上属于同一实体
function FormSingleState() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // 一个 handleChange 处理所有输入框的变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value  // [name] 是计算属性名，name 的值作为对象的 key
    }));
  };
  
  // ✅ 优点：表单重置只需 setFormData({ username: '', email: '', password: '' })
  // ✅ 优点：可以把 formData 整体传给子组件或 API
  // ❌ 缺点：更新时需要展开旧对象，代码稍复杂
}
```

**选择建议：**
- 数据之间没有关联 → 多个独立 State
- 数据逻辑上属于同一实体（如一个表单、一个用户对象）→ 单个 State 对象
- 不确定时 → 先用多个独立 State，后面发现需要整体操作时再合并

---

## 💡 最佳实践

### 1. 提升 State 到合适的位置

**"State 应该放在需要使用它的最低层级的公共父组件中"**

```jsx
// ❌ 不必要的重复状态
// 子组件把 props 的值又存到了自己的 state 里，这是多余的
function Parent() {
  const [user, setUser] = useState({ name: '张三' });
  return <Child name={user.name} />;
}

function Child({ name }) {
  const [displayName, setDisplayName] = useState(name);  // 冗余！
  // 问题：当父组件的 user.name 变化时，displayName 不会自动更新！
  return <h1>{displayName}</h1>;
}

// ✅ 直接使用 props
function Child({ name }) {
  return <h1>{name}</h1>;
  // 当父组件的 name 变化时，这里会自动更新
}
```

> **为什么要这样做？** 这叫 **"单一数据源原则"（Single Source of Truth）**。
>
> 想象一个班级的成绩单。如果老师在电脑里存了一份，助教在纸上也抄了一份，学生自己又记了一份，那三份成绩单一旦不一致，谁也不知道哪个是对的。
>
> 数据应该只存在一个地方（父组件），其他需要用到的组件通过 Props 获取。这样就能保证所有人看到的数据总是一致的。

### 2. 避免过度同步 State

```jsx
// ❌ 冗余的状态：firstName 和 lastName 完全可以从 fullName 推导出来
// 不需要为它们单独创建 state
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

// ✅ 只保留真正需要"记住"的数据，其他的数据在需要时计算
function GoodForm() {
  const [fullName, setFullName] = useState('');
  
  // 这些是"派生值"（Derived Value），每次渲染时实时计算
  // 不需要 state，因为它们可以从 fullName 推导出来
  const firstName = fullName.split(' ')[0];
  const lastName = fullName.split(' ').slice(1).join(' ');
}
```

> **判断标准**：问自己"这个值能不能从已有的 state 计算出来？"
> - 如果能 → 不要创建新的 state，用计算/推导即可
> - 如果不能 → 才需要创建新的 state

### 3. 合理初始化 State

```jsx
// ❌ 每次组件渲染时都会调用 expensiveFunction()
// 即使你只想在第一次渲染时用它
const [data, setData] = useState(expensiveFunction());
// 问题：如果组件因为其他 state 变化而重新渲染，expensiveFunction() 会被白白调用

// ✅ 传入一个函数，React 只会在第一次渲染时调用它
// 后续重新渲染时，React 会直接使用上一次的值，不再调用这个函数
const [data, setData] = useState(() => expensiveFunction());

// 这叫做"惰性初始化"（Lazy Initialization）
const [data, setData] = useState(() => {
  const initial = computeInitialValue();
  return initial;
});
```

> 这就像你去酒店入住：第一次办理入住时需要出示身份证（执行初始化函数），之后每次回到房间不需要再出示身份证，直接进去就行（直接使用之前的值）。

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
- **React DevTools** 浏览器扩展 —— 可以查看每个组件的 Props 和 State，实时监控变化
- **Console 日志** —— 最简单的调试方式
- **React Profiler** —— 分析组件渲染性能，找出不必要的重新渲染

---

## 🧠 核心概念总结

| 概念 | 一句话解释 | 生活中的类比 |
|------|-----------|-------------|
| Props | 父传子的只读数据 | 快递单上的收件信息 |
| State | 组件内部的动态数据 | 手机的当前电量 |
| 单向数据流 | 数据只能从父流向子 | 河水只能从高处流向低处 |
| 不可变性 | 修改数据要创建新对象 | 修改文件要另存为新文件 |
| 惰性初始化 | 初始值只在第一次计算 | 酒店入住只需登记一次 |
| 派生值 | 从已有数据计算得出 | 身高可以从体检数据中得知 |

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 清楚区分 Props 和 State 的适用场景
- [ ] 正确使用 useState 管理各种类型的 State
- [ ] 遵循不可变性原则更新 State
- [ ] 使用函数式更新处理连续更新
- [ ] 设计合理的 State 结构
- [ ] 理解为什么 Props 是只读的
- [ ] 能够通过回调函数实现父子组件通信

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
