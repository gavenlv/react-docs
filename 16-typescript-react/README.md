# 16 - TypeScript 与 React

## 🎯 本节目标
- 掌握 TypeScript 在 React 中的最佳实践
- 学会类型定义和组件类型化
- 掌握泛型组件和工具类型的用法
- 构建类型安全的 React 应用

---

## 📖 为什么在 React 中使用 TypeScript？

### TypeScript 的优势

| 方面 | JavaScript | TypeScript |
|------|-----------|------------|
| **类型安全** | ❌ 运行时才发现错误 | ✅ 编译时捕获错误 |
| **IDE 支持** | 基础补全 | 智能提示、重构、导航 |
| **可维护性** | 大项目难以维护 | 类型即文档，易于维护 |
| **重构信心** | 害怕改坏代码 | 类型系统保驾护航 |

---

## 🚀 快速开始

### 创建 TS 项目

```bash
# 使用 Create React App
npx create-react-app my-app --template typescript

# 使用 Vite (推荐)
npm create vite@latest my-app -- --template react-ts

# 使用 Next.js
npx create-next-app@latest my-app --typescript
```

### tsconfig.json 关键配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🧩 组件类型定义

### 函数组件基础

```tsx
// ✅ 基本函数组件
import { FC } from 'react';

// 方式一: FC 类型（FunctionComponent）
const Greeting: FC<{ name: string; age?: number }> = ({ name, age }) => (
  <div>
    Hello, {name}! 
    {age && <span> You are {age} years old.</span>}
  </div>
);

// 方式二: 直接标注函数签名（推荐，更简洁）
function Welcome({ name }: { name: string }) {
  return <h1>Welcome, {name}!</h1>;
}

// 方式三: 接口定义 Props
interface UserCardProps {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onUserClick?: (userId: number) => void;  // 可选回调
}

function UserCard({ user, onUserClick }: UserCardProps) {
  return (
    <div className="user-card" onClick={() => onUserClick?.(user.id)}>
      <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}
```

### Children 属性

```tsx
// 方式一: 使用 ReactNode
interface CardProps {
  title: string;
  children: React.ReactNode;  // 可以是任何可渲染内容
}

function Card({ title, children }: CardProps) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

// 使用
<Card title="用户信息">
  <p>姓名：张三</p>              {/* ReactElement */}
  <button>编辑</button>           {/* ReactElement */}
  {[1, 2, 3].map(i => <span key={i}>{i}</span>)}  {/* ReactNode[] */}
</Card>

// 方式二: 使用 Render Props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor?.(item) ?? index}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// 使用
<List<User>
  items={users}
  keyExtractor={(user) => user.id.toString()}
  renderItem={(user) => (
    <span>{user.name} ({user.email})</span>
  )}
/>
```

### 事件处理类型

```tsx
import { ChangeEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react';

function EventDemo() {
  // Input onChange 事件
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);  // 自动推断为 HTMLInputElement
    console.log(e.target.type);   // 'text', 'number' 等
  };

  // Select onChange 事件
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(e.target.value);
  };

  // 表单提交事件
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('表单提交');
  };

  // 键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('回车键按下');
    }
  };

  // 鼠标事件
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    console.log('点击位置:', e.clientX, e.clientY);
    e.currentTarget.disabled = true;  // 正确访问按钮元素
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" onChange={handleInputChange} onKeyDown={handleKeyDown} />
      
      <select onChange={handleSelectChange}>
        <option value="1">选项1</option>
        <option value="2">选项2</option>
      </select>

      <button type="submit" onClick={handleClick}>提交</button>
    </form>
  );
}
```

---

## 🔧 Hooks 类型化

### useState 泛型

```tsx
// 基本用法（自动推断）
const [count, setCount] = useState(0);          // 推断为 number
const [name, setName] = useState('');            // 推断为 string
const [isActive, setIsActive] = useState(false); // 推断为 boolean

// 显式指定类型（当初始值可能为 null/undefined 时）
type UserData = {
  id: number;
  name: string;
  email: string;
};

const [user, setUser] = useState<UserData | null>(null);

// 复杂对象状态
interface FormState {
  username: string;
  email: string;
  password: string;
  errors: Partial<Record<keyof Omit<FormState, 'errors'>, string>>;
}

const [form, setForm] = useState<FormState>({
  username: '',
  email: '',
  password: '',
  errors: {}
});

// 更新复杂状态的辅助方法
const updateField = (field: keyof FormState, value: string) => {
  setForm(prev => ({
    ...prev,
    [field]: value,
    errors: { ...prev.errors, [field]: undefined }
  }));
};
```

### useEffect 清理函数

```tsx
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    try {
      const response = await fetch('/api/data', {
        signal: controller.signal
      });
      const data: DataType = await response.json();
      setData(data);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setError(error as Error);
      }
    }
  }

  fetchData();
  
  // 返回清理函数
  return () => controller.abort();
}, [url]);
```

### useRef 类型

```tsx
// DOM 元素引用
const inputRef = useRef<HTMLInputElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);
const formRef = useRef<HTMLFormElement>(null);

// 使用 ref 操作 DOM
const focusInput = () => {
  if (inputRef.current) {
    inputRef.current.focus();
    inputRef.current.select();
  }
};

// 存储任意值（不触发重渲染）
const timerRef = useRef<NodeJS.Timeout | null>(null);
const previousValueRef = useRef<string>('');

useEffect(() => {
  timerRef.current = setInterval(() => {
    console.log('Timer tick');
  }, 1000);
  
  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, []);
```

### useCallback & useMemo

```typescript
// useCallback
const handleClick = useCallback((id: number): void => {
  setSelectedId(id);
  navigate(`/users/${id}`);
}, [navigate]);

const handleSubmit = useCallback(async (formData: FormDataType): Promise<void> => {
  setIsLoading(true);
  try {
    await api.submitForm(formData);
    showToast('提交成功！');
  } finally {
    setIsLoading(false);
  }
}, []);

// useMemo - 缓存计算结果
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

const filteredProducts = useMemo<Product[]>(() => {
  return products
    .filter(p => p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.price - b.price);
}, [products, selectedCategory, searchQuery]);

// useMemo - 缓存对象避免子组件不必要的重渲染
const themeContextValue = useMemo<ThemeContextType>(() => ({
  mode,
  colors: mode === 'dark' ? darkColors : lightColors,
  toggleMode
}), [mode]);
```

### useContext 类型

```tsx
// 定义 Context 类型
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<User>;
}

// 创建带类型的 Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 自定义 Hook（确保在 Provider 内部使用）
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider 实现
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  const value: AuthContextType = useMemo(() => ({
    ...state,
    login: async (email, password) => { /* ... */ },
    logout: () => { /* ... */ },
    register: async (userData) => { /* ... */ }
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### useReducer 复杂状态管理

```typescript
// 状态类型
interface TodoState {
  todos: Todo[];
  filter: FilterStatus;
  loading: boolean;
  error: Error | null;
}

// Action 类型（使用联合类型）
type TodoAction =
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Omit<Todo, 'id'> }
  | { type: 'TOGGLE_TODO'; payload: number }  // todo id
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'SET_FILTER'; payload: FilterStatus }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null };

// Reducer 函数
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'SET_TODOS':
      return { ...state, todos: action.payload, loading: false };
    
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, { ...action.payload, id: Date.now() }]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// 使用
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  
  const addTodo = (text: string): void => {
    dispatch({
      type: 'ADD_TODO',
      payload: { text, completed: false, createdAt: new Date().toISOString() }
    });
  };
  
  // ...
}
```

---

## 🎨 高级类型模式

### 1. 工具类型（Utility Types）

```typescript
// Partial - 所有属性变为可选
interface RequiredFields {
  name: string;
  email: string;
  age: number;
}

type OptionalFields = Partial<RequiredFields>;
// 等同于:
// { name?: string; email?: string; age?: number; }

// Required - 所有属性变为必需
interface ConfigOptions {
  theme?: 'light' | 'dark';
  language?: string;
  showNotifications?: boolean;
}

type StrictConfig = Required<ConfigOptions>;
// { theme: 'light' | 'dark'; language: string; showNotifications: boolean }

// Pick - 选择部分属性
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type PublicUserInfo = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string; }

// Omit - 排除部分属性
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; createdAt: Date; }

// Record - 创建键值对类型
type RolePermissions = Record<'admin' | 'editor' | 'viewer', string[]>;

const permissions: RolePermissions = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read']
};

// Exclude / Extract - 联合类型操作
type Status = 'pending' | 'active' | 'completed' | 'cancelled';

type ActiveStatus = Exclude<Status, 'pending' | 'cancelled'>
// 'active' | 'completed'

type StringStatus = Extract<Status, string>
// 'pending' | 'active' | 'completed' | 'cancelled'
```

### 2. 条件类型与映射类型

```typescript
// 条件类型：根据条件选择不同类型
type ApiResponse<T> = T extends string 
  ? { data: T; success: true }
  : { error: Error; success: false };

// 映射类型：批量转换属性
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

type OptionalUser = {
  [K in keyof User]?: User[K];
};
```

### 3. 泛型组件

```tsx
// 列表组件泛型
interface GenericListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  onItemClick?: (item: T) => void;
  loading?: boolean;
}

function GenericList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = '暂无数据',
  onItemClick,
  loading = false
}: GenericListProps<T>) {
  if (loading) return <LoadingSpinner />;
  if (!items.length) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="generic-list">
      {items.map(item => (
        <li 
          key={keyExtractor(item)}
          onClick={() => onItemClick?.(item)}
          role={onItemClick ? 'button' : undefined}
        >
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}

// 使用示例 1：用户列表
interface User {
  id: number;
  name: string;
  avatar: string;
}

function UserList() {
  const users: User[] = [...];
  
  return (
    <GenericList<User>
      items={users}
      keyExtractor={user => user.id}
      renderItem={user => (
        <>
          <img src={user.avatar} alt={user.name} />
          <span>{user.name}</span>
        </>
      )}
      onItemClick={user => navigate(`/users/${user.id}`)}
      emptyMessage="还没有用户"
    />
  );
}

// 使用示例 2：商品列表
interface Product {
  sku: string;
  name: string;
  price: number;
  image: string;
}

function ProductGrid() {
  const products: Product[] = [...];
  
  return (
    <GenericList<Product>
      items={products}
      keyExtractor={product => product.sku}
      renderItem={product => (
        <ProductCard product={product} />
      )}
      emptyMessage="没有找到相关商品"
    />
  );
}
```

---

## 🛠️ 实战：类型安全的表单系统

### 定义表单字段配置

```typescript
// 字段类型
type FieldType = 'text' | 'password' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';

// 验证规则
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: unknown) => string | null;  // 返回错误信息或null
}

// 字段配置
interface FieldConfig {
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;  // for select
  validation?: ValidationRule;
  disabled?: boolean;
  defaultValue?: unknown;
}

// 表单配置（Record 映射）
type FormConfig = Record<string, FieldConfig>;

// 表单值类型（动态生成）
type FormValues<T extends FormConfig> = {
  [K in keyof T]?: T[K]['defaultValue'] extends infer V
    ? V extends undefined
      ? T[K]['type'] extends 'checkbox'
        ? boolean
        : string
      : V
    : unknown
};

// 表单验证结果类型
type FormErrors<T extends FormConfig> = Partial<Record<keyof T, string>>;

// 动态表单组件
function DynamicForm<T extends FormConfig>({
  config,
  onSubmit,
  initialValues
}: {
  config: T;
  onSubmit: (values: FormValues<T>) => Promise<void> | void;
  initialValues?: Partial<FormValues<T>>;
}) {
  const [values, setValues] = useState<FormValues<T>>(initialValues || {});
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (fieldName: keyof T, value: unknown): string | null => {
    const fieldConfig = config[fieldName];
    const rules = fieldConfig.validation;

    if (!rules) return null;
    if (rules.required && !value) return `${fieldConfig.label} 是必填项`;
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `${fieldConfig.label} 至少需要 ${rules.minLength} 个字符`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return `${fieldConfig.label} 不能超过 ${rules.maxLength} 个字符`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${fieldConfig.label} 格式不正确`;
      }
    }
    if (rules.customValidator) {
      return rules.customValidator(value);
    }

    return null;
  };

  const handleChange = (fieldName: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // 实时清除该字段的错误
    const error = validateField(fieldName, value);
    setErrors(prev => error ? { ...prev, [fieldName]: error } : { ...prev, [fieldName]: undefined });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 全量验证
    const newErrors: FormErrors<T> = {};
    let hasError = false;
    
    for (const fieldName of Object.keys(config) as (keyof T)[]) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {(Object.entries(config) as [keyof T, FieldConfig][]).map(([fieldName, fieldConfig]) => (
        <FormField
          key={String(fieldName)}
          name={fieldName}
          config={fieldConfig}
          value={values[fieldName]}
          error={errors[fieldName]}
          onChange={(value) => handleChange(fieldName, value)}
          isSubmitting={isSubmitting}
        />
      ))}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

### 使用动态表单

```tsx
// 用户注册表单配置
const registrationConfig: FormConfig = {
  username: {
    label: '用户名',
    type: 'text',
    placeholder: '请输入用户名（2-20个字符）',
    validation: {
      required: true,
      minLength: 2,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      customValidator: (value) => {
        if (typeof value === 'string' && value.includes(' ')) {
          return '用户名不能包含空格';
        }
        return null;
      }
    }
  },

  email: {
    label: '邮箱',
    type: 'email',
    placeholder: 'example@mail.com',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },

  password: {
    label: '密码',
    type: 'password',
    placeholder: '至少6位，包含字母和数字',
    validation: {
      required: true,
      minLength: 6
    }
  },

  confirmPassword: {
    label: '确认密码',
    type: 'password',
    placeholder: '再次输入密码',
    validation: {
      required: true,
      customValidator: (value) => {
        if (value !== values.password) {
          return '两次密码不一致';
        }
        return null;
      }
    }
  },

  role: {
    label: '角色',
    type: 'select',
    options: [
      { label: '普通用户', value: 'user' },
      { label: '开发者', value: 'developer' },
      { label: '管理员', value: 'admin' }
    ],
    defaultValue: 'user',
    validation: { required: true }
  },

  agreeTerms: {
    label: '同意服务条款',
    type: 'checkbox',
    defaultValue: false,
    validation: {
      customValidator: (value) => {
        if (!value) return '必须同意服务条款才能注册';
        return null;
      }
    }
  }
};

function RegistrationPage() {
  const handleSubmit = async (values: FormValues<typeof registrationConfig>) => {
    // values 类型完全安全！
    console.log('提交数据:', values);
    await api.register(values as RegisterData);
    toast.success('注册成功！跳转到登录页...');
    navigate('/login');
  };

  return (
    <div className="registration-page">
      <h1>创建账户</h1>
      <DynamicForm config={registrationConfig} onSubmit={handleSubmit} />
    </div>
  );
}
```

---

## 💡 最佳实践总结

### 1. 文件组织结构

```
src/
├── types/
│   ├── index.ts         # 导出所有类型
│   ├── api.ts           # API 相关类型
│   ├── components.ts    # 组件通用类型
│   └── domain.ts        # 业务领域模型
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Button.types.ts  # 或内联 interface
│       └── index.ts
└── hooks/
    └── useAuth.ts
```

### 2. 导出类型策略

```typescript
// types/index.ts
// 统一导出，方便导入
export type { User, UserRole } from './domain';
export type { ApiResponse, ApiError } from './api';
export type { ComponentSize, ButtonVariant } from './components';

// 使用时只需一行导入
import { User, ApiResponse, ButtonVariant } from '@/types';
```

### 3. 避免类型断言（as）过多

```typescript
// ❌ 过度使用类型断言
const element = document.getElementById('myDiv') as HTMLDivElement;
const data = JSON.parse(jsonString) as UserData[];

// ✅ 类型守卫和类型窄化
function isHTMLElement(element: Element): element is HTMLElement {
  return element instanceof HTMLElement;
}

if (element && isHTMLElement(element)) {
  // 这里 element 自动推断为 HTMLElement
}

// JSON 解析使用 zod 等运行时验证库
const userDataSchema = z.array(UserDataSchema);
const data = userDataSchema.parse(JSON.parse(jsonString));  // 类型安全！
```

### 4. 利用 typeof 从值推导类型

```typescript
// API 配置
const API_CONFIG = {
  baseURL: 'https://api.example.com',
  timeout: 10000,
  endpoints: {
    users: '/users',
    posts: '/posts',
    comments: '/comments'
  }
} as const;

// 从配置对象自动推导出类型
type ApiConfig = typeof API_CONFIG;
type EndpointKey = keyof typeof API_CONFIG.endpoints;  // 'users' | 'posts' | 'comments'
```

---

## ✅ 阶段检查清单

- [ ] 能够正确类型化各种 React 组件（FC、普通函数、类组件）
- [ ] 掌握所有常用 Hooks 的类型化写法
- [ ] 能熟练运用工具类型简化类型定义
- [ ] 会编写和使用泛型组件
- [ ] 了解如何构建类型安全的表单系统
- [ ] 形成良好的 TypeScript 项目结构和命名规范

---

## 📝 练习任务

1. **类型化 Todo App**: 将第10章的Todo App完全迁移到TypeScript
2. **通用表格组件**: 实现一个支持排序、筛选、分页的类型安全表格组件
3. **API 类型系统**: 为你的后端API创建完整的请求/响应类型定义

---

[→ 17 - 单元测试](../17-testing/)
