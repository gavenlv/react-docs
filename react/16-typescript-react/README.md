# 16 - TypeScript 与 React

## 本节目标

- 真正理解"类型"是什么——不是约束，而是你的编程助手
- 理解"编译时"和"运行时"的区别——这是 TypeScript 的核心价值
- 掌握 TypeScript 在 React 中的最佳实践
- 学会用类型让代码更安全、更好维护

---

## TypeScript 到底是什么？

### 一个通俗的比喻

假设你是一名建筑设计师，JavaScript 就像是在白纸上自由画画——想怎么画就怎么画，非常灵活，但当你把图纸交给施工队时，可能会出现各种问题：

- "这个尺寸是多少？图纸没标注啊"
- "这根柱子承重够吗？材料没写清楚"
- "这里两个房间的门对不上"

TypeScript 就像是给白纸加上了**尺寸标注和材料说明**。你画图的自由度没有减少，但施工队（编译器）会在施工前帮你检查出所有问题。

### 什么是"类型"？

类型（Type）就是对"数据的形状和种类"的描述。它告诉计算机（和你的同事）："这个变量里面存的是什么样的东西"。

```typescript
// JavaScript：没有类型约束
let name = '张三';
name = 123;         // JavaScript 允许！运行时可能出 bug
name.toUpperCase(); // 运行时报错！数字没有 toUpperCase 方法

// TypeScript：有类型约束
let name: string = '张三';
name = 123;         // ❌ 编译时直接报错！根本不会运行到浏览器

// TypeScript 告诉你：name 是 string 类型，你不能给它赋值 number
```

### 编译时 vs 运行时

这是理解 TypeScript 最重要的概念：

| | 编译时（Compile Time） | 运行时（Runtime） |
|---|---|---|
| **什么时候** | 你写完代码后，运行前 | 代码在浏览器/Node.js 中执行时 |
| **谁在检查** | TypeScript 编译器 | JavaScript 引擎（V8 等） |
| **发现错误的成本** | 低（还没上线就能发现） | 高（用户已经看到了 bug） |
| **类比** | 写完作文后自己先检查一遍 | 考试时交卷后老师批改 |

```
你的开发流程：

  写 TypeScript 代码
       ↓
  TypeScript 编译器检查（编译时）
       ↓ 发现错误 → 修改代码 → 重新检查
  编译成 JavaScript
       ↓
  在浏览器中运行（运行时）
```

**TypeScript 的核心价值**：把"运行时才会发现的错误"提前到"编译时就能发现"。越早发现 bug，修复成本越低。

### TypeScript 的实际好处

#### 1. 捕获低级错误

```typescript
// JavaScript 中常见的低级错误
function formatDate(date) {
  return date.toLocaleDateString();
}

formatDate('2024-01-01');    // 运行时报错！字符串没有 toLocaleDateString
formatDate(undefined);      // 运行时报错！undefined 没有 toLocaleDateString
formatDate(12345);           // 运行时报错！数字没有 toLocaleDateString

// TypeScript 直接帮你拦住
function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

formatDate('2024-01-01');  // ❌ 编译错误：类型 "string" 不能赋给类型 "Date"
formatDate(undefined);    // ❌ 编译错误
formatDate(12345);        // ❌ 编译错误
formatDate(new Date());   // ✅ 正确
```

#### 2. 智能代码提示（IDE 自动补全）

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const user: User = fetchUser();

user.  // ← 输入 user. 时，IDE 自动提示 id, name, email, role
// 你不需要去查文档或翻代码，IDE 就知道这个对象有哪些属性
```

这在大型项目中特别有价值——你不用记住每个 API 返回什么数据、每个函数接受什么参数，TypeScript 都会告诉你。

#### 3. 重构信心

```typescript
// 假设你要把 User 的 name 字段拆分成 firstName 和 lastName

interface User {
  name: string;  // 旧版
}

// 改成
interface User {
  firstName: string;  // 新版
  lastName: string;   // 新版
}

// TypeScript 会自动在所有使用 user.name 的地方报错
// 你不会遗漏任何一个地方
```

---

## 快速开始

### 创建 TypeScript 项目

```bash
# Vite（推荐，速度快）
npm create vite@latest my-app -- --template react-ts

# Create React App
npx create-react-app my-app --template typescript

# Next.js
npx create-next-app@latest my-app --typescript
```

### tsconfig.json 关键配置

```json
{
  "compilerOptions": {
    "target": "ES2020",              // 编译目标（现代浏览器都支持 ES2020）
    "module": "ESNext",              // 使用 ES Module
    "jsx": "react-jsx",              // 支持 JSX（新版写法，不需要手动 import React）

    // 最重要的配置
    "strict": true,                  // 开启所有严格检查（强烈推荐！）

    // strict 包含以下选项：
    // "strictNullChecks": true,      // null 和 undefined 是独立的类型
    // "noImplicitAny": true,        // 不允许隐式 any 类型
    // "strictFunctionTypes": true,   // 严格检查函数类型
    // 等等...
  }
}
```

**`strict: true` 是什么？** 它是一个"总开关"，开启后 TypeScript 会进行最严格的类型检查。刚开始可能会觉得"报错好多"，但这是好事——它帮你发现了很多你不知道的潜在问题。

---

## React 中的 TypeScript

### 组件 Props 的类型定义

Props 就是组件的"参数"——你必须告诉 TypeScript 这个组件接受哪些参数、每个参数是什么类型。

```tsx
// 方式一：内联类型（简单组件推荐）
function Greeting({ name, age }: { name: string; age?: number }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {age && <p>你今年 {age} 岁了</p>}
    </div>
  );
}

// 方式二：使用 interface（复杂组件推荐，可复用）
interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;         // ? 表示可选属性
  };
  onUserClick?: (userId: number) => void;  // 可选的回调函数
  isActive: boolean;
}

function UserCard({ user, onUserClick, isActive }: UserCardProps) {
  return (
    <div
      className={isActive ? 'active' : ''}
      onClick={() => onUserClick?.(user.id)}  // ?. 安全调用（可选链）
    >
      <img src={user.avatar || '/default.png'} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

**为什么推荐用 interface 而不是内联类型？**
1. interface 有名称，在报错信息中更容易理解
2. interface 可以被多个组件复用
3. interface 支持声明合并（扩展第三方库的类型时有用）

### children 属性

```tsx
// children：组件标签之间的内容
<Card title="用户信息">
  <p>姓名：张三</p>
  <button>编辑</button>
</Card>

// 类型定义
interface CardProps {
  title: string;
  children: React.ReactNode;  // ReactNode 可以是任何可渲染内容
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="content">{children}</div>
    </div>
  );
}
```

`React.ReactNode` 是什么？它是 React 中"任何可以渲染的东西"的集合类型，包括：
- 字符串：`"Hello"`
- 数字：`42`
- React 元素：`<div />`
- React 数组：`[<li />, <li />]`
- `null` / `undefined` / `boolean`（不会渲染但合法）

### 事件处理类型

React 提供了一整套事件类型，你不需要自己写：

```tsx
import { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent } from 'react';

function EventDemo() {
  // input 的 change 事件
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // TypeScript 自动知道 e.target 是 HTMLInputElement
    console.log(e.target.value);   // string ✅
    console.log(e.target.type);    // 'text' | 'number' | ... ✅
  };

  // 表单提交事件
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // TypeScript 知道 e.key 是 string
    if (e.key === 'Enter') {
      console.log('回车键');
    }
  };

  // 按钮点击事件
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // e.currentTarget 是按钮元素（不是 target，注意区别）
    e.currentTarget.disabled = true;
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>提交</button>
    </form>
  );
}
```

**不需要死记这些类型**——当你写事件处理函数但不确定类型时，可以先把鼠标悬停在事件上，让 IDE 告诉你类型：

```tsx
<input onChange={(e) => {
  // 鼠标悬停在 e 上，IDE 会显示：e: ChangeEvent<HTMLInputElement>
  // 然后把这个类型复制过来就行
}} />
```

---

## Hooks 的类型化

### useState

```tsx
// TypeScript 会自动推断类型——大多数情况不需要手动指定
const [count, setCount] = useState(0);          // 自动推断为 number
const [name, setName] = useState('');            // 自动推断为 string
const [isOpen, setIsOpen] = useState(false);     // 自动推断为 boolean

// 什么时候需要手动指定类型？
// 当初始值和最终类型不一致时
const [user, setUser] = useState<User | null>(null);
// 初始值是 null，但最终会变成 User 对象
// 所以类型是 User | null（User 或者 null）

const [items, setItems] = useState<Item[]>([]);
// 初始值是空数组 []，TypeScript 推断为 never[]
// 需要手动指定为 Item[]

// 复杂状态
interface FormState {
  username: string;
  email: string;
  errors: {
    username?: string;
    email?: string;
  };
}

const [form, setForm] = useState<FormState>({
  username: '',
  email: '',
  errors: {},
});
```

### useRef

```tsx
// 引用 DOM 元素
const inputRef = useRef<HTMLInputElement>(null);
const formRef = useRef<HTMLFormElement>(null);

// 使用时需要判空（因为 ref.current 可能是 null）
const focusInput = () => {
  if (inputRef.current) {  // TypeScript 要求你做 null 检查
    inputRef.current.focus();
  }
};

// 存储非 DOM 值
const timerRef = useRef<number | null>(null);   // setInterval 返回 number
const prevValueRef = useRef<string>('');         // 存储上一次的值
```

### useContext

```tsx
// 1. 定义 Context 的类型
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. 创建 Context（初始值设为 undefined，表示"必须在 Provider 内使用"）
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. 自定义 Hook（封装 useContext，确保在 Provider 内使用）
function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用');
  }
  return context;
}

// 4. Provider 组件
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const value: ThemeContextType = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => (t === 'light' ? 'dark' : 'light')),
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 5. 在组件中使用
function MyComponent() {
  const { theme, toggleTheme } = useTheme();  // 类型安全！
  return <button onClick={toggleTheme}>当前：{theme}</button>;
}
```

### useReducer

```typescript
// 定义状态类型
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

// 定义 Action 类型（联合类型——多种 Action 的集合）
type TodoAction =
  | { type: 'ADD_TODO'; payload: { text: string } }
  | { type: 'TOGGLE_TODO'; payload: number }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'SET_FILTER'; payload: 'all' | 'active' | 'completed' };

// Reducer 函数
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload.text,
          completed: false,
        }],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    // ...
  }
}
```

---

## 高级类型：工具类型

TypeScript 提供了很多内置的"工具类型"，可以让你在已有类型的基础上快速创建新类型。

### 常用的工具类型

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

// Partial：所有属性变成可选
type PartialUser = Partial<User>;
// 等同于 { id?: number; name?: string; email?: string; password?: string; role?: 'admin' | 'user' }
// 使用场景：更新用户信息时，你只需要传你想改的字段

// Required：所有属性变成必选
type RequiredConfig = Required<{ theme?: string; lang?: string }>;
// { theme: string; lang: string }

// Pick：从一个类型中选取部分属性
type PublicUserInfo = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }
// 使用场景：API 返回用户信息时，不暴露 password

// Omit：从一个类型中排除部分属性（Pick 的反面）
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; role: 'admin' | 'user' }
// 使用场景：把用户数据传给前端时，去掉敏感字段

// Record：创建"键值对"类型
type RolePermissions = Record<'admin' | 'editor' | 'viewer', string[]>;
// { admin: string[]; editor: string[]; viewer: string[] }

// Exclude：从联合类型中排除某些值
type Status = 'pending' | 'active' | 'completed' | 'cancelled';
type ActiveStatus = Exclude<Status, 'pending' | 'cancelled'>;
// 'active' | 'completed'
```

### 泛型组件

泛型（Generic）是 TypeScript 最强大的特性之一。简单说，泛型就是"类型的参数化"——让你写出适用于多种类型的组件。

**生活中的类比**：泛型就像"模板"。比如一个饼干模具，不管你用什么面团（类型参数），都能压出对应形状的饼干。

```tsx
// 泛型列表组件：不限制列表项的类型
interface ListProps<T> {
  items: T[];                              // 任意类型的数组
  renderItem: (item: T) => React.ReactNode; // 渲染每一项的函数
  keyExtractor: (item: T) => string;        // 提取唯一 key
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={keyExtractor(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// 使用时，T 分别是 User 和 Product
<List<User>
  items={users}
  keyExtractor={u => u.id.toString()}
  renderItem={u => <span>{u.name}</span>}
/>

<List<Product>
  items={products}
  keyExtractor={p => p.sku}
  renderItem={p => <span>{p.name} - ¥{p.price}</span>}
/>
```

---

## 最佳实践

### 1. 优先使用 interface 而不是 type

```typescript
// ✅ 推荐：interface（可扩展、可合并）
interface User {
  name: string;
  email: string;
}

// 可以 later 扩展
interface User {
  age: number;  // 自动合并到上面的定义
}

// ❌ 不推荐：type（简单场景可以，但不支持声明合并）
type User = {
  name: string;
  email: string;
};
```

### 2. 避免 `as` 类型断言

类型断言就是告诉 TypeScript："我比你更清楚这个值是什么类型"。虽然有时候必须用，但过多使用会失去类型安全的意义。

```typescript
// ❌ 过度使用类型断言
const data = JSON.parse(jsonString) as UserData[];
const element = document.getElementById('myDiv') as HTMLDivElement;

// ✅ 使用类型守卫
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'name' in value;
}

const data = JSON.parse(jsonString);
if (Array.isArray(data) && data.every(isUser)) {
  // 这里 data 自动推断为 User[]
}

// ✅ 使用运行时验证库（如 zod）
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const result = UserSchema.parse(data);  // 类型安全 + 运行时验证
```

### 3. 利用 `typeof` 从值推导类型

```typescript
const API_CONFIG = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
} as const;

// 自动推导类型，不需要手写
type ApiConfig = typeof API_CONFIG;
// { readonly baseURL: "https://api.example.com"; readonly timeout: 10000 }

// 从函数返回值推导
function createUser(name: string, age: number) {
  return { name, age, createdAt: new Date() };
}
type User = ReturnType<typeof createUser>;
// { name: string; age: number; createdAt: Date }
```

### 4. 文件组织

```
src/
├── types/
│   ├── index.ts          # 统一导出
│   ├── api.ts            # API 相关类型
│   ├── components.ts     # 组件通用类型
│   └── domain.ts         # 业务模型
├── components/
│   └── Button.tsx        # 类型内联或放在同文件
└── hooks/
    └── useAuth.ts
```

---

## 阶段检查清单

- [ ] 理解"类型"的本质——它是对数据形状的描述
- [ ] 理解"编译时"和"运行时"的区别
- [ ] 能为 React 组件正确定义 Props 类型
- [ ] 掌握常用 Hooks 的类型化写法
- [ ] 能使用 Partial、Pick、Omit 等工具类型
- [ ] 了解泛型组件的写法和适用场景

---

## 🔬 TypeScript 在 React 中的高级类型原理

### 1. React 的类型系统设计哲学

#### 为什么 React 用 TypeScript 重写？

React 从 2019 年开始，逐步将整个代码库从 **Flow**（Facebook 自己开发的类型检查工具）迁移到了 **TypeScript**。这个决定背后的原因很有意思：

```
Flow vs TypeScript 的对比（为什么 React "移情别恋"）：

┌──────────────────┬──────────────────────┬──────────────────────┐
│                  │  Flow（旧爱）          │  TypeScript（新欢）    │
├──────────────────┼──────────────────────┼──────────────────────┤
│ 社区生态         │ 只有 Facebook 在用     │ 全世界开发者在用        │
│ IDE 支持         │ 只能用 Nuclide        │ VS Code 原生支持       │
│ 类型定义         │ 需要手动写 libdef     │ DefinitelyTyped 社区   │
│ 招人成本         │ 需要单独学 Flow       │ 大多数人会 TypeScript  │
│ 第三方库兼容     │ 经常缺类型定义         │ 几乎都有类型定义        │
└──────────────────┴──────────────────────┴──────────────────────┘
```

💡 **大白话**：Flow 就像是 Facebook 自己造了一辆"方言车"，只有自己家人会开。TypeScript 就像是一辆"标准车"，全世界都有加油站和维修厂。React 最终选择了后者——毕竟要服务的是全世界数百万开发者。

#### React 内部类型系统的关键设计

React 的类型系统有几个核心设计原则：

1. **渐进式类型化**：你可以从最简单的写法开始，TypeScript 会自动推导，不需要一上来就写满类型注解
2. **类型推导优先**：React 的类型设计得非常聪明，大部分情况下你不需要手动指定类型
3. **运行时无关**：TypeScript 类型在编译后完全消失，不会影响打包体积

```typescript
// React 类型系统的"聪明"之处——自动推导
// 你写的是这样：
const [count, setCount] = useState(0);

// TypeScript 自动推导成这样：
// const count: number
// const setCount: Dispatch<SetStateAction<number>>

// 你不需要手写类型，编译器替你干了

// 再看一个更复杂的例子：
const [user, setUser] = useState<User | null>(null);
// 初值是 null，TypeScript 推断为 null 类型
// 你手动告诉它：未来会是 User 或 null
```

#### 泛型在 React 中的大量应用

泛型是 React 类型系统的骨架。React 几乎所有 API 都是用泛型设计的：

```typescript
// React 内部大量使用泛型的简化示例：

// useState 的泛型签名（简化版）：
function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
//             ↑
//             S 是一个"占位符"，代表状态的类型
//             你传入什么初始值，S 就是什么

// useRef 的泛型签名（简化版）：
function useRef<T>(initialValue: T): MutableRefObject<T>
//           ↑
//           T 代表 ref 引用的类型

// createContext 的泛型签名（简化版）：
function createContext<T>(defaultValue: T): Context<T>
//               ↑
//               T 代表 Context 中存储的数据类型
```

💡 **大白话**：泛型就像是 React 类型系统的"模具"。`useState<User>` 就是告诉 TypeScript "给我一个 User 形状的模具"。React 内部不知道你需要什么形状，所以留了一个"占位符"，你用的时候再填上。

---

### 2. 深入理解 React 的核心类型

#### React.FC 的争议——为什么现在不推荐用？

```typescript
// React.FC（FunctionComponent）曾经是最流行的写法：
const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}</h1>;
};

// 现在更推荐的写法：
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}
```

⚠️ **为什么不推荐 `React.FC` 了？** 这个问题在 React 社区讨论了很久，主要有以下几个原因：

| 问题 | 说明 |
|------|------|
| **隐式 children** | `React.FC` 曾经自动包含 `children` 属性，导致即使你不需要 children，别人传了也不会报错 |
| **泛型不友好** | 用 `React.FC` 写泛型组件很别扭 |
| **多余的类型包装** | 普通函数声明已经够清晰了，`React.FC` 只是在"加戏" |
| **社区趋势** | React 官方文档和核心团队成员都推荐普通函数写法 |

```typescript
// ❌ 泛型组件用 React.FC 写法很丑：
const List: React.FC<ListProps<Item>> = ({ items }) => { ... };

// ✅ 普通函数写泛型组件很自然：
function List<T>({ items }: ListProps<T>) { ... }

// ❌ React.FC 隐式包含 children（旧版本）
const Card: React.FC<{ title: string }> = ({ title, children }) => { ... };
// children 的类型是隐式的，不直观

// ✅ 普通函数显式声明 children
function Card({ title, children }: { title: string; children: React.ReactNode }) { ... }
// 一眼就能看出这个组件接受 children
```

💡 **大白话**：`React.FC` 就像是给组件穿了一件"过于正式的西装"——看起来很专业，但实际干活时反而碍手碍脚。普通函数声明就像是"休闲工装"，舒服、直观、效率高。

> ⚠️ 注意：在 React 18 中，`React.FC` 已经移除了自动包含 `children` 的行为。但社区仍然倾向于使用普通函数声明。

#### ReactNode vs ReactElement vs JSX.Element 的区别

这三个类型是 React 中最容易混淆的概念，用一张图来说明它们的关系：

```
ReactNode（最大的范围——"任何可以渲染的东西"）
  │
  ├── ReactElement（React 元素——调用 JSX/createElement 的结果）
  │     │
  │     └── JSX.Element（≈ ReactElement，略微不同）
  │
  ├── string（字符串：'hello'）
  ├── number（数字：42）
  ├── boolean（布尔值：true / false）
  ├── null / undefined（空值）
  └── ReactPortal（Portal 传送门）
  └── ReactFragment（Fragment：<>...</>）
```

```typescript
// 用代码来看它们的区别：

// ReactElement：一个具体的 React 元素
const element: React.ReactElement = <div>Hello</div>;
// 就像是"一张画好的画"，它是一个确定的、具体的 React 节点

// JSX.Element：几乎等同于 ReactElement
// 在大多数情况下，你可以把 JSX.Element 当作 ReactElement 的别名
const jsxElement: JSX.Element = <div>Hello</div>;

// ReactNode：最广泛的类型，"任何能渲染的东西"
const node1: React.ReactNode = <div>Hello</div>;      // ✅ ReactElement 也是 ReactNode
const node2: React.ReactNode = "Hello";               // ✅ 字符串也是
const node3: React.ReactNode = 42;                    // ✅ 数字也是
const node4: React.ReactNode = null;                  // ✅ null 也是
const node5: React.ReactNode = undefined;             // ✅ undefined 也是
const node6: React.ReactNode = true;                  // ✅ boolean 也是（但不渲染）
const node7: React.ReactNode = [<li />, <li />];      // ✅ 数组也是
const node8: React.ReactNode = <>Fragment</>;         // ✅ Fragment 也是
```

💡 **大白话**：
- `ReactElement` = 一张**画好的画**（比如 `<div>Hello</div>`）
- `ReactNode` = **任何能挂在墙上给人看的东西**（画、照片、文字、空相框……）
- 用 `ReactNode` 作为 children 的类型，因为你想让组件能接受任何可渲染的内容

#### ComponentType vs ComponentClass vs FunctionComponent

```typescript
// 这三个类型的层级关系：

// FunctionComponent = 函数组件
type FunctionComponent<P = {}> = (props: P) => ReactElement | null;

// ComponentClass = 类组件
type ComponentClass<P = {}> = new (props: P) => Component<P, any>;

// ComponentType = 函数组件 OR 类组件（联合类型）
type ComponentType<P = {}> = FunctionComponent<P> | ComponentClass<P>;
```

```
ComponentType（"任何 React 组件"）
  │
  ├── FunctionComponent（函数组件）
  │     // function App() { return <div /> }
  │
  └── ComponentClass（类组件）
        // class App extends React.Component { render() { return <div /> } }
```

```typescript
// 实际使用场景：
// 当你需要"接受一个组件作为 props"时，用 ComponentType

interface PageProps {
  // 用 ComponentType 表示"传一个 React 组件进来"
  // 不关心它是函数组件还是类组件
  layout: React.ComponentType<{ children: React.ReactNode }>;
}

function Page({ layout: Layout }: PageProps) {
  return (
    <Layout>
      <h1>页面内容</h1>
    </Layout>
  );
}

// 传函数组件：
<Page layout={function MyLayout({ children }) { return <div>{children}</div> }} />

// 传类组件也行：
<Page layout={class MyLayout extends React.Component { render() { return <div>{this.props.children}</div> } }} />
```

#### PropsWithChildren 的工作原理

```typescript
// React 提供了一个工具类型 PropsWithChildren，自动为你的 Props 加上 children：
type PropsWithChildren<P = unknown> = P & { children?: ReactNode | undefined };
//                             ↑
//                             P 是你原来的 Props 类型
//                             & 表示"合并"，自动加上 children 属性

// 使用方式：
interface CardProps {
  title: string;
  // 不需要手动写 children: React.ReactNode
}

function Card({ title, children }: React.PropsWithChildren<CardProps>) {
  // PropsWithChildren 自动帮你加上了 children 属性
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// PropsWithChildren 的展开等价于：
// { title: string; children?: ReactNode | undefined }
```

💡 **大白话**：`PropsWithChildren` 就像是一个"自动加 children 通道"的工具。你只需要定义组件自己需要的 props，`PropsWithChildren` 帮你自动加上 `children`——省得每次都手动写 `children?: React.ReactNode`。

> 🔍 **小知识**：虽然 `PropsWithChildren` 很方便，但现在很多团队更倾向于手动声明 `children`，因为这样更显式、更清晰。

---

### 3. 事件处理类型的原理

#### React.MouseEvent vs NativeMouseEvent 的关系

React 有一套自己的事件系统，它和浏览器原生事件的关系如下：

```
浏览器原生事件（Native Event）     React 合成事件（Synthetic Event）
┌─────────────────────┐          ┌─────────────────────────┐
│ MouseEvent          │          │ React.MouseEvent<T>     │
│ KeyboardEvent       │  ──────> │ React.KeyboardEvent<T>  │
│ ChangeEvent         │  包装     │ React.ChangeEvent<T>    │
│ FocusEvent          │          │ React.FocusEvent<T>     │
│ DragEvent           │          │ React.DragEvent<T>      │
└─────────────────────┘          └─────────────────────────┘
                                         │
                                         │ 跨浏览器兼容
                                         │（抹平了浏览器差异）
                                         ↓
                                  所有浏览器表现一致
```

💡 **大白话**：浏览器原生事件就像是各个手机品牌的充电线（Type-C、Lightning、Micro-USB），接口都不一样。React 合成事件就像是一个**万能转接头**——无论底层浏览器是什么，React 给你的接口都是一样的。

```typescript
// React.MouseEvent 的泛型参数决定了 target 的类型：
type MouseEvent<T = Element, E = NativeMouseEvent> = SyntheticEvent<T, E> & {
  // 继承了 SyntheticEvent 的所有属性
  clientX: number;
  clientY: number;
  // ... 更多鼠标特有属性
};

// 当你写 React.MouseEvent<HTMLButtonElement> 时：
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // TypeScript 知道 e.currentTarget 是 HTMLButtonElement
  // 所以你可以访问按钮特有的属性：
  e.currentTarget.disabled = true;   // ✅ 按钮有 disabled 属性
  e.currentTarget.form;              // ✅ 按钮有 form 属性

  // e.target 可能是按钮内部的子元素，类型是 EventTarget（更宽泛）
  // e.currentTarget 始终是绑定事件的那个元素
};
```

#### 泛型事件类型

```typescript
// ChangeEvent 的泛型决定了 input 元素的类型：
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // TypeScript 知道 e.target 是 HTMLInputElement
  console.log(e.target.value);    // string ✅
  console.log(e.target.type);     // 'text' | 'number' | ... ✅
  console.log(e.target.checked);  // boolean ✅（checkbox 时）
  console.log(e.target.files);    // FileList | null ✅（file input 时）
};

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  // TypeScript 知道 e.target 是 HTMLSelectElement
  console.log(e.target.selectedOptions);  // HTMLCollectionOf<HTMLOptionElement> ✅
};

const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  // TypeScript 知道 e.target 是 HTMLTextAreaElement
  console.log(e.target.value);   // string ✅
  console.log(e.target.rows);    // number ✅（文本域行数）
};

// 更多泛型事件类型：
// React.FormEvent<HTMLFormElement>        - 表单提交
// React.FocusEvent<HTMLInputElement>      - 聚焦/失焦
// React.KeyboardEvent<HTMLInputElement>   - 键盘按下
// React.WheelEvent<HTMLDivElement>        - 鼠标滚轮
// React.DragEvent<HTMLDivElement>         - 拖拽
```

#### 如何为自定义组件定义事件类型

```typescript
// 假设你写了一个自定义 Select 组件：

// 方式一：直接用 React 的 ChangeEvent
interface SelectProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

function Select({ value, onChange }: SelectProps) {
  return (
    <select value={value} onChange={onChange}>
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
  );
}

// 方式二：更简洁的回调签名（推荐）
interface SelectProps {
  value: string;
  // 直接暴露值，而不是暴露整个事件对象
  // 使用方不需要关心事件对象的结构
  onChange?: (value: string) => void;
}

function Select({ value, onChange }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}  // 内部解包事件
    >
      <option value="a">A</option>
      <option value="b">B</option>
    </select>
  );
}

// 使用时更简洁：
<Select value={val} onChange={(v) => setVal(v)} />
// 而不是：
<Select value={val} onChange={(e) => setVal(e.target.value)} />
```

💡 **大白话**：方式二就像是餐厅服务员帮你**剥好虾再端上来**（使用者直接拿到值），方式一就像是把整盘虾端上来让你自己剥（使用者需要自己从事件对象中取值）。对于自定义组件，推荐方式二——封装得越好，使用者越省心。

---

### 4. Hooks 的类型体操

#### useState 的泛型推导原理

```typescript
// useState 的完整类型签名（简化版）：
function useState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];

// SetStateAction 的定义：
type SetStateAction<S> = S | ((prevState: S) => S);
//                        ↑
//                        可以直接传新值，也可以传一个函数

// 推导过程演示：

// 例1：传入字面量
const [count, setCount] = useState(0);
// TypeScript 推导：
// count 的类型 = 0 的字面量类型 → 自动拓宽为 number
// setCount 接受 number 或 ((prev: number) => number)

// 例2：传入 null
const [user, setUser] = useState(null);
// TypeScript 推导：
// count 的类型 = null 的字面量类型 → null（不是你想要的！）
// setUser 只能接受 null 或 ((prev: null) => null)
// ⚠️ 这是一个常见的坑！你需要手动指定泛型：

const [user, setUser] = useState<User | null>(null);
//                        ↑
//                        手动指定泛型参数，告诉 TypeScript 未来会有 User

// 例3：传入空数组
const [items, setItems] = useState([]);
// TypeScript 推导：
// items 的类型 = never[]（空数组无法推导元素类型！）
// ⚠️ 又是坑！需要手动指定：

const [items, setItems] = useState<Item[]>([]);
//                                 ↑
//                                 告诉 TypeScript：数组里装的是 Item 类型
```

```
useState 类型推导流程图：

传入初始值
  │
  ├─ 字面量（0, '', false）→ 自动拓宽为对应基础类型（number, string, boolean）✅
  │
  ├─ null → 类型为 null ⚠️ 通常需要手动指定联合类型
  │
  ├─ []  → 类型为 never[] ⚠️ 通常需要手动指定数组元素类型
  │
  ├─ 对象 { name: '' } → 类型为 { name: string } ✅
  │
  └─ 指定泛型 useState<T>(...) → 类型为 T ✅ 任何情况都适用
```

#### useRef 的类型陷阱——MutableRefObject vs RefObject

这是 TypeScript + React 中最容易踩坑的地方之一：

```typescript
// useRef 的类型签名（简化版）：
function useRef<T>(initialValue: T): MutableRefObject<T>;
function useRef<T>(initialValue: T | null): RefObject<T>;
function useRef<T = undefined>(): MutableRefObject<T | undefined>;

// MutableRefObject：.current 是可变的（可读可写）
interface MutableRefObject<T> {
  current: T;  // 注意：没有 readonly
}

// RefObject：.current 是只读的（只能读不能写）
interface RefObject<T> {
  readonly current: T | null;  // 注意：readonly，且可能是 null
}
```

```typescript
// 陷阱一：DOM 引用
const inputRef = useRef<HTMLInputElement>(null);
//                    ↑ 泛型参数    ↑ 初始值是 null
// 因为初始值是 null，TypeScript 推导为 RefObject<HTMLInputElement>
// RefObject.current 是 readonly 的

// ✅ 读取 DOM（readonly 不影响）
inputRef.current?.focus();   // OK
inputRef.current?.value;     // OK

// ❌ 直接赋值会报错
inputRef.current = document.createElement('input');  // 报错！readonly

// 💡 但在实际使用中，React 会在挂载时自动把 DOM 节点赋给 ref.current
// readonly 只是在 TypeScript 层面的限制，React 内部是可以赋值的

// 陷阱二：存储可变值
const timerRef = useRef<number | null>(null);
// 初始值是 null → RefObject → current 是 readonly 的！
// 但你想在运行时给它赋值：
timerRef.current = window.setInterval(() => {}, 1000);  // ⚠️ 可能报错！

// 解决方案：
const timerRef = useRef<number>(0);
// 初始值不是 null → MutableRefObject → current 可读可写
timerRef.current = window.setInterval(() => {}, 1000);  // ✅

// 或者更优雅的方式——利用类型断言：
const timerRef = useRef<number | null>(null) as React.MutableRefObject<number | null>;
timerRef.current = window.setInterval(() => {}, 1000);  // ✅
```

💡 **大白话**：`useRef` 的类型推导有个"古怪"的规则——如果你初始值传 `null`，它就认为你是要"只读"地引用一个东西（比如引用 DOM 节点，由 React 来赋值）。如果你是想存一个可变的值（比如定时器 ID），初始值不要传 `null`。

```
useRef 类型选择速查：

┌──────────────────────────────┬─────────────────────────┬──────────────┐
│ 使用场景                      │ 写法                      │ current 类型  │
├──────────────────────────────┼─────────────────────────┼──────────────┤
│ 引用 DOM 元素                  │ useRef<HTMLDivElement>(null) │ readonly     │
│ 存储定时器/ID                  │ useRef<number>(0)        │ 可读可写 ✅   │
│ 存储上一轮的值                 │ useRef<string>('')       │ 可读可写 ✅   │
│ 存储可变对象                   │ useRef<MyObj | null>(null) as MutableRefObject │
└──────────────────────────────┴─────────────────────────┴──────────────┘
```

#### useContext 的类型传递

```typescript
// useContext 的类型传递链：

// 1. 定义 Context 的值类型
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// 2. 创建 Context 时传入类型
const AuthContext = createContext<AuthContextType | undefined>(undefined);
//                                          ↑
//                                          |____ 这里是关键！
//                                                  undefined 表示"还没有提供 Provider"

// 3. useContext 自动推导返回值类型
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  // context 的类型自动推导为 AuthContextType | undefined

  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }

  return context;
  // 返回值的类型是 AuthContextType（因为 undefined 被排除了）
}

// 使用时完全类型安全：
function ProfilePage() {
  const { user, login, logout, isAuthenticated } = useAuth();
  //    ↑ User | null    ↑ (string, string) => Promise<void>
  //    ↑ () => void     ↑ boolean

  // TypeScript 知道 user 可能是 null
  if (user) {
    console.log(user.name);  // ✅ 这里 user 是 User 类型（不是 null）
  }
}
```

💡 **大白话**：`createContext` 传入的类型就像是给 Context 设了一个"模板"，所有消费这个 Context 的组件都会自动继承这个类型。就像你给一个快递盒子贴了"易碎品"标签，所有拿到这个盒子的人都知道要小心轻放。

#### 自定义 Hook 的泛型设计模式

```typescript
// 模式一：泛型状态 Hook——管理任何类型的异步状态
function useAsync<T>(asyncFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    asyncFn()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [asyncFn]);

  return { data: data as T, loading, error } as const;
  //          ↑ 断言为 T（排除 null），因为我们只在 loading 完成后才暴露
}

// 使用：T 分别是 User 和 Product
const { data: user } = useAsync(() => fetchUser(1));
// user 的类型自动推导为 User

const { data: product } = useAsync(() => fetchProduct('sku-001'));
// product 的类型自动推导为 Product


// 模式二：泛型列表 Hook——管理任何类型的列表
function useList<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const addItem = (item: T) => setItems(prev => [...prev, item]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  const updateItem = (index: number, newItem: T) =>
    setItems(prev => prev.map((item, i) => (i === index ? newItem : item)));

  return { items, addItem, removeItem, updateItem };
}

// 使用：
const todoList = useList<Todo>();
todoList.addItem({ id: 1, text: '学习 TypeScript', done: false });
// addItem 的参数类型自动推导为 Todo


// 模式三：泛型分页 Hook
interface PaginationResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  loading: boolean;
  goToPage: (page: number) => void;
}

function usePagination<T>(fetchFn: (page: number) => Promise<{ data: T[]; total: number }>, pageSize = 10) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchFn(page).then(res => {
      setData(res.data);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [page, fetchFn]);

  return {
    data,
    page,
    totalPages: Math.ceil(total / pageSize),
    loading,
    goToPage: setPage,
  } satisfies PaginationResult<T>;
  // satisfies 确保返回值符合 PaginationResult<T> 的结构
}

// 使用：
const usersPagination = usePagination<User>((page) => fetchUsers(page));
// usersPagination.data 的类型是 User[]
```

---

## 练习任务

1. **类型化 Todo App**：将第 10 章的 Todo App 完全迁移到 TypeScript，确保每个组件、每个函数都有正确的类型
2. **类型体操**：尝试实现以下类型工具（不用内置的 Partial/Pick，自己手写）：
   - `MyPartial<T>`：把所有属性变成可选
   - `MyPick<T, K>`：从 T 中选择 K 指定的属性
3. **API 类型系统**：为一个真实的 API（如 JSONPlaceholder）创建完整的请求参数和响应类型定义

---

[← 15 - 性能优化](../15-performance-optimization/) | [→ 17 - 单元测试](../17-testing/)
