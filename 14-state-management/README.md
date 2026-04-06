# 14 - 状态管理进阶 (Redux Toolkit & Zustand)

## 🎯 本节目标
- 理解何时需要全局状态管理
- 掌握 Redux Toolkit (RTK) 的现代用法
- 学会 Zustand 轻量级状态管理
- 能够在实际项目中做出正确的技术选型

---

## 📖 状态管理概览

### 什么时候需要状态管理？

| 场景 | 解决方案 | 示例 |
|------|---------|------|
| 单组件内部 | `useState` | 表单输入、toggle 开关 |
| 父子组件传递 | Props | UI 组件配置 |
| 跨多层组件 | Context | 主题、语言、认证 |
| **复杂全局状态** | **Redux/Zustand** | **购物车、用户设置、缓存数据** |

### 主流方案对比

| 特性 | Redux (RTK) | Zustand | Jotai | Recoil |
|------|-------------|---------|-------|--------|
| **Bundle Size** | ~7KB (gzipped) | ~300B (gzipped) | ~2KB | ~7KB |
| **学习曲线** | 中等 | 低 | 低 | 中等 |
| **DevTools** | ✅ 完善 | ✅ 有 | ⚠️ 部分 | ✅ 有 |
| **中间件支持** | 强大 | 插件灵活 | 原子化 | 原子化 |
| **适合场景** | 大型应用 | 中小型/大型均可 | 组件级状态 | 大型应用 |

---

## 🍕 Redux Toolkit (RTK)

### 为什么选择 RTK？

传统 Redux 的问题：
- 样板代码太多（actions、reducers、thunks...）
- 配置繁琐
- 容易出错

RTK 的解决方案：
- 内置 Immer（可直接修改 state）
- 自动创建 action creators
- 简化的 store 配置
- 内置 DevTools 和中间件

### 安装与配置

```bash
npm install @reduxjs/toolkit react-redux
# 或
yarn add @reduxjs/toolkit react-redux
```

### 基本结构

```
src/
├── store/
│   ├── index.ts           # Store 配置
│   └── slices/
│       ├── authSlice.ts   # 认证状态
│       ├── todoSlice.ts   # 待办事项
│       └── uiSlice.ts     # UI 状态
├── features/
│   ├── auth/
│   │   └── AuthForm.tsx
│   └── todos/
│       ├── TodoList.tsx
│       └── AddTodo.tsx
└── hooks/
    └── useTypedSelector.ts  # 类型安全的 useSelector
```

### 创建 Slice（核心概念）

Slice 将 reducers、actions、初始状态组合在一起：

```typescript
// src/store/slices/todoSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// 状态接口
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface TodosState {
  items: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'all' | 'active' | 'completed';
}

// 初始状态
const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'all'
};

// 异步 Thunk：获取待办列表
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch');
      return (await response.json()) as Todo[];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// 异步 Thunk：添加新待办
export const addNewTodo = createAsyncThunk(
  'todos/addNewTodo',
  async (newTodo: Omit<Todo, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      return (await response.json()) as Todo;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// 创建 Slice
const todoSlice = createSlice({
  name: 'todos',
  initialState,
  
  reducers: {
    // 同步 reducer（直接操作，Immer 处理不可变更新）
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find(t => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },

    deleteTodo: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },

    clearCompletedTodos: (state) => {
      state.items = state.items.filter(t => !t.completed);
    },

    setFilter: (state, action: PayloadAction<TodosState['filter']>) => {
      state.filter = action.payload;
    },

    reorderTodos: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const [removed] = state.items.splice(action.payload.sourceIndex, 1);
      state.items.splice(action.payload.destinationIndex, 0, removed);
    }
  },
  
  // 处理异步 thunk 的生命周期
  extraReducers: (builder) => {
    builder
      // fetchTodos pending
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // fetchTodos fulfilled
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      // fetchTodos rejected
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // addNewTodo
      .addCase(addNewTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);  // 新增到开头
      });
  }
});

// 导出 actions（自动创建）
export const {
  toggleTodo,
  deleteTodo,
  clearCompletedTodos,
  setFilter,
  reorderTodos
} = todoSlice.actions;

// 导出 reducer
export default todoSlice.reducer;
```

### 配置 Store

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './slices/todoSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// 配置并创建 store
export const store = configureStore({
  reducer: {
    todos: todoReducer,
    auth: authReducer,
    ui: uiReducer
  },
  
  // 中间件（已默认包含 redux-thunk 和序列化检查）
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略特定 action 类型的检查（如日期对象等）
        ignoredActions: ['persist/PERSIST']
      }
    }),
  
  // 开发环境下的额外配置
  devTools: process.env.NODE_ENV !== 'production'
});

// 导出 RootState 和 AppDispatch 类型供组件使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型安全的 Hooks
export const useAppSelector = TypedUseSelectorHook.withTypes<RootState>();
export const useAppDispatch = () => useDispatch<AppDispatch>();
```

### 连接到 React

```tsx
// src/main.tsx 或 index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### 在组件中使用

```tsx
// src/features/todos/TodoList.tsx
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchTodos, 
  addNewTodo, 
  toggleTodo, 
  deleteTodo,
  selectAllTodos,
  selectFilteredTodos,
  selectTodoStatus,
  selectTodoError
} from '../../store/slices/todoSlice';
import { useEffect, useState } from 'react';
import { TodoItem } from './TodoItem';
import { AddTodoForm } from './AddTodoForm';

function TodoList() {
  const dispatch = useAppDispatch();
  
  // 使用 selectors（从 slice 导出的 memoized selectors）
  const todos = useAppSelector(selectFilteredTodos);
  const status = useAppSelector(selectTodoStatus);
  const error = useAppSelector(selectTodoError);
  const filter = useAppSelector(state => state.todos.filter);
  
  // 组件挂载时获取数据
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos());
    }
  }, [dispatch, status]);

  // 处理添加新 todo
  const handleAddTodo = async (text: string, priority: Todo['priority']) => {
    await dispatch(addNewTodo({
      text,
      completed: false,
      priority
    }));
  };

  // 渲染不同状态
  if (status === 'loading' && todos.length === 0) {
    return <LoadingSkeleton />;
  }

  if (status === 'failed') {
    return <ErrorMessage message={error || '未知错误'} onRetry={() => dispatch(fetchTodos())} />;
  }

  return (
    <div className="todo-container">
      <header>
        <h1>我的待办事项</h1>
        <div className="filters">
          <FilterButtons currentFilter={filter} onFilterChange={(f) => dispatch(setFilter(f))} />
        </div>
      </header>

      <AddTodoForm onAdd={handleAddTodo} />

      <main>
        {todos.length > 0 ? (
          <ul className="todo-list">
            {todos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => dispatch(toggleTodo(todo.id))}
                onDelete={() => dispatch(deleteTodo(todo.id))}
              />
            ))}
          </ul>
        ) : (
          <EmptyState message="暂无待办事项" />
        )}
        
        {todos.some(t => t.completed) && (
          <footer>
            <button onClick={() => dispatch(clearCompletedTodos())}>
              清除已完成 ({todos.filter(t => t.completed).length})
            </button>
          </footer>
        )}
      </main>
    </div>
  );
}
```

### Selectors 最佳实践

```typescript
// 在 slice 文件中定义 memoized selectors
import { createSelector } from '@reduxjs/toolkit';

// 基础 selector（直接从 state 取值）
export const selectAllTodos = (state: RootState) => state.todos.items;
export const selectTodoStatus = (state: RootState) => state.todos.status;
export const selectTodoFilter = (state: RootState) => state.todos.filter;

// Memoized selector（派生数据，带缓存）
export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectTodoFilter],
  (todos, filter) => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }
);

// 更复杂的 selector（多级依赖）
export const selectTodoStats = createSelector(
  [selectAllTodos],
  (todos) => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
    highPriorityActive: todos.filter(t => t.priority === 'high' && !t.completed).length
  })
);
```

---

## 🐻 Zustand（轻量级替代）

### 为什么选择 Zustand？

✅ **极简**: API 简单，学习成本低  
✅ **轻量**: gzip 后仅 ~300 bytes  
✅ **灵活**: 不需要 Provider 包裹整个应用  
✅ **强大**: 支持中间件、持久化、DevTools  

### 安装

```bash
npm install zustand
# 可选中间件
npm install immer zustand/middleware
```

### 基础用法

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

// 创建 store（不需要 Provider！）
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,
      
      // Actions
      login: async (email: password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          
          set({
            user: response.user,
            token: response.token,
            isLoading: false
          });
          
          // 设置后续请求的 Authorization header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        } catch (error) {
          set({
            error: (error as Error).message || '登录失败',
            isLoading: false
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const user = await authAPI.register(data);
          set({ user, isLoading: false });
        } catch (error) {
          set({
            error: (error as Error).message || '注册失败',
            isLoading: false
          });
        }
      },

      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('auth-storage');  // 清除持久化
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',  // localStorage 的 key
      partialize: (state) => ({
        // 只持久化这些字段
        user: state.user,
        token: state.token
      })
    }
  )
);
```

### 在组件中使用

```tsx
// components/AuthButton.tsx
import { useAuthStore } from '../stores/useAuthStore';

function LoginButton() {
  const { login, isLoading, error } = useAuthStore();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(credentials.email, credentials.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... 表单字段 ... */}
      
      {error && <Alert type="error" message={error} />}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}

// components/UserProfile.tsx
function UserProfile() {
  // 只订阅需要的部分（性能优化！）
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const updateUser = useAuthStore(state => state.updateUser);

  if (!user) return <LoginPrompt />;

  return (
    <div className="profile">
      <Avatar src={user.avatar} name={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Badge variant={user.role === 'admin' ? 'danger' : 'info'}>
        {user.role}
      </Badge>
      
      <button onClick={() => updateUser({ name: 'New Name' })}>
        修改名称
      </button>
      
      <button onClick={logout}>退出</button>
    </div>
  );
}
```

### 进阶特性

#### 1. Slice Pattern（拆分大型 Store）

```typescript
// stores/useTodoStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TodoSlice {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  
  addTodo: (text: string) => void;
  removeTodo: (id: number) => void;
  toggleTodo: (id: number) => void;
  setFilter: (filter: TodoSlice['filter']) => void;
  clearCompleted: () => void;
}

const createTodoSlice = (set: any) => ({
  todos: [],
  filter: 'all' as const,
  
  addTodo: (text: string) =>
    set(immer((state: any) => {
      state.todos.unshift({
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      });
    })),
  
  removeTodo: (id: number) =>
    set((state: any) => ({
      todos: state.todos.filter((t: Todo) => t.id !== id)
    })),
  
  toggleTodo: (id: number) =>
    set(immer((state: any) => {
      const todo = state.todos.find((t: Todo) => t.id === id);
      if (todo) todo.completed = !todo.completed;
    })),
  
  // ... 其他 actions
});

// 组合多个 slices
export const useStore = create<any>()(
  devtools(
    (...args) => ({
      ...createTodoSlice(...args),
      // 其他 slices...
    }),
    { name: 'app-store' }  // DevTools 名称
  )
);
```

#### 2. 异步操作

```typescript
// stores/useProductStore.ts
export const useProductStore = create((set, get) => ({
  products: [] as Product[],
  status: 'idle' as 'idle' | 'loading' | 'success' | 'error',
  error: null as string | null,

  // 简单的异步 action
  fetchProducts: async (categoryId?: number) => {
    set({ status: 'loading', error: null });

    try {
      let url = '/api/products';
      if (categoryId) url += `?category=${categoryId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const products: Product[] = await response.json();
      
      set({ status: 'success', products });
      return products;
    } catch (error) {
      const message = (error as Error).message || '加载失败';
      set({ status: 'error', error: message });
      throw error;
    }
  },

  // 带缓存的智能请求
  fetchProductsCached: async (categoryId?: number) => {
    const { products, status } = get();
    
    // 如果已有数据且不是错误状态，直接返回缓存
    if (products.length > 0 && status === 'success') {
      return products;
    }

    return get().fetchProducts(categoryId);
  }
}));
```

#### 3. 订阅优化

```tsx
// 只订阅特定字段变化（避免不必要的重渲染）
function TodoStats() {
  // ✅ 只订阅 stats 相关的数据
  const total = useStore(state => state.todos.length);
  const completed = useStore(state => state.todos.filter(t => t.completed).length);
  
  return (
    <div>
      已完成 {completed}/{total}
    </div>
  );
}

// 使用 shallow 比较（针对对象/数组）
import { shallow } from 'zustand/shallow';

function TodoList() {
  // ✅ 使用 shallow 比较，只在数组引用或元素变化时重渲染
  const todos = useStore(
    (state) => state.todos.filter(t => !t.completed),
    shallow  // 浅比较
  );

  // 或者手动控制比较逻辑
  const expensiveData = useStore(
    (state) => computeExpensiveValue(state),
    (a, b) => a.id === b.id && a.value === b.value  // 自定义比较函数
  );

  return <ul>{todos.map(/* ... */)}</ul>;
}
```

---

## 🔄 技术选型指南

### 选择 Redux Toolkit 如果...

- 应用规模**很大**（数十个页面/功能模块）
- 团队熟悉 Redux 模式
- 需要强大的**时间旅行调试**
- 需要**严格的单向数据流**约束
- 已经在使用其他 Redux 生态工具（如 RTK Query）

### 选择 Zustand 如果...

- 追求**简单和灵活性**
- 不想被 Provider 包裹
- 需要在组件外使用 Store（如 utils、hooks 中）
- Bundle size 敏感
- 喜欢**极简 API**

### 混合使用

```tsx
// 完全可以同时使用两者！
// Zustand 用于轻量的 UI 状态（侧边栏、模态框等）
// RTK 用于核心业务数据（用户、购物车、订单等）

function App() {
  return (
    <Provider store={rtkStore}>  {/* 只包裹需要的部分 */}
      <Sidebar />  {/* 使用 Zustand 管理 */}
      <MainContent />  {/* 使用 RTK 管理 */}
    </Provider>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 理解 Redux Toolkit 的核心理念和优势
- [ ] 能够创建和配置 RTK store 及 slices
- [ ] 掌握异步 thunks 的使用和错误处理
- [ ] 会编写高效、memoized 的 selectors
- [ ] 熟悉 Zustand 的基本和高级用法
- [ ] 能根据项目需求做出合适的技术选型

---

## 📝 练习任务

1. **迁移现有应用**: 尝试将 Context API 管理的状态迁移到 RTK 或 Zustand
2. **实现完整 CRUD**: 使用任一方案构建用户管理的增删改查功能
3. **性能对比**: 对比两种方案在大量数据更新时的表现差异

---

[→ 15 - 性能优化](../15-performance-optimization/)
