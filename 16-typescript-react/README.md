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

## 练习任务

1. **类型化 Todo App**：将第 10 章的 Todo App 完全迁移到 TypeScript，确保每个组件、每个函数都有正确的类型
2. **类型体操**：尝试实现以下类型工具（不用内置的 Partial/Pick，自己手写）：
   - `MyPartial<T>`：把所有属性变成可选
   - `MyPick<T, K>`：从 T 中选择 K 指定的属性
3. **API 类型系统**：为一个真实的 API（如 JSONPlaceholder）创建完整的请求参数和响应类型定义

---

[← 15 - 性能优化](../15-performance-optimization/) | [→ 17 - 单元测试](../17-testing/)
