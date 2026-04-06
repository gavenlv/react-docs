# 14 - 状态管理进阶 (Redux Toolkit & Zustand)

## 本节目标

- 真正理解"状态管理"到底在解决什么问题——为什么 `useState` 和 `props` 不够用
- 搞懂 **Flux 架构**和**单向数据流**的核心理念
- 掌握 Redux Toolkit (RTK) 的现代用法
- 学会 Zustand 轻量级状态管理
- 能够在实际项目中做出正确的技术选型——包括**什么时候不需要**全局状态管理

---

## 状态管理到底是什么？

### 先从一个问题开始

假设你在做一个电商网站，用户登录后，以下这些地方都需要知道"当前用户是谁"：

- 顶部导航栏要显示用户头像和名字
- 购物车页面要显示用户的地址信息
- 订单页面要显示用户的历史订单
- 个人中心要显示用户的详细资料

如果你只用 `useState` 和 `props`，数据传递路径大概是这样的：

```
App (存放 user 状态)
 └── Navbar (props: user) → 显示头像
 └── Router
      ├── CartPage (props: user) → 显示地址
      ├── OrderPage (props: user) → 显示订单
      └── ProfilePage (props: user) → 显示资料
```

这看起来还行？那如果中间还有更多层级呢？

```
App
 └── Layout
      ├── Sidebar
      │    └── UserMenu (props: user) → 需要知道用户是谁
      └── MainContent
           ├── Router
           │    ├── CartPage
           │    │    └── AddressForm (props: user.address) → 需要用户地址
           │    │         └── ProvinceSelect (props: user.address.province) → 需要省份
           │    └── ...
```

**这就是所谓的 "Prop Drilling"（属性逐层传递）问题**：为了让最底层的组件获取数据，每一层中间组件都必须接收并传递这个 prop，即使它们自己根本不用这个数据。

这不是"写不写得出来"的问题，而是"维护起来很痛苦"的问题。想象一下，你要把 `user` 改名为 `currentUser`——你需要修改经过的每一个组件。

### 有什么解决方案？

| 场景 | 解决方案 | 生活比喻 |
|------|---------|---------|
| 自己口袋里的钱 | `useState` | 只有你自己知道有多少钱 |
| 父亲告诉儿子零花钱 | Props | 父亲直接给，单向传递 |
| 家庭公告板 | Context | 贴在公告板上，谁都可以看 |
| **市政府公告系统** | **Redux/Zustand** | **全城广播，任何人都可收听** |

**关键区别**：Context 和全局状态管理都能解决 Prop Drilling，但 Context 有一些局限性：
- 每次 Context 值变化，所有消费该 Context 的组件都会重新渲染（性能问题）
- Context 没有内置的"中间件"来处理异步操作（如 API 请求）
- Context 缺乏调试工具（无法追踪状态变化历史）
- 复杂应用中，Context 容易变成"大杂烩"，什么状态都往里塞

这就是为什么我们需要更专业的状态管理工具。

---

## Flux 架构与单向数据流

### 什么是 Flux 架构？

Flux 是 Facebook（现 Meta）提出的一种**应用架构思想**，React 本身就深受 Flux 的影响。理解 Flux 是理解 Redux 的钥匙。

用一个餐厅的比喻来理解：

```
顾客（用户操作）
  ↓ 下单
服务员（Action）→ 把顾客的需求写成订单
  ↓ 送到厨房
厨房（Store/Reducer）→ 根据订单准备菜品（更新状态）
  ↓ 菜做好了
窗口（View/组件）→ 展示做好的菜品（重新渲染）
  ↓ 顾客看到菜
顾客（用户操作）→ 可以继续点菜...
```

**核心规则：数据只能单向流动。** 顾客不能直接冲进厨房做菜，厨房不能直接把菜塞到顾客嘴里。

对应到代码中：

```
用户点击按钮（事件）
  → 派发一个 Action（描述"发生了什么"）
    → Reducer 根据 Action 计算新状态（纯函数）
      → Store 更新状态
        → 组件因为状态变化而重新渲染
          → 用户看到新的 UI
```

### 为什么是"单向"？

想象一下双向绑定的场景（比如某些框架的 `v-model`）：

```
视图 ↔ 数据模型
```

当数据模型变化，视图自动更新；当用户在视图中输入，数据模型自动变化。看起来很方便，但当应用变复杂后，你会发现很难回答这个问题：**"这个数据现在为什么是这个值？"**

因为它可能被任何地方修改了，你很难追踪变化来源。

而单向数据流的好处是：**每个状态变化都是可预测的**。你只需要看 Action 就知道发生了什么，看 Reducer 就知道状态会怎么变。

```
Action: { type: 'todos/add', payload: { text: '学习 React' } }
```

看到这行代码，你立刻知道："哦，有人添加了一个新待办事项"。

### Redux 的三大原则

1. **单一数据源（Single Source of Truth）**：整个应用的状态存在一个"仓库"（Store）里，就像一个城市的中央数据库
2. **State 是只读的（State is Read-Only）**：你不能直接修改状态，只能通过派发 Action 来描述你想做什么改变
3. **Reducer 必须是纯函数**：相同的输入永远产生相同的输出，没有副作用（不发网络请求、不操作 DOM）

---

## 什么时候需要全局状态管理？

### 需要全局状态的典型场景

1. **跨多个页面/路由共享的数据**：用户登录信息、购物车数据、全局通知
2. **多个不相关组件需要同一份数据**：主题设置、语言国际化、权限信息
3. **需要追踪状态变化历史的场景**：撤销/重做功能、调试
4. **复杂异步流程**：登录流程涉及多个步骤和 API 调用

### 什么时候不需要全局状态管理？

这一点非常重要——**不要为了用而用**。

**不需要全局状态管理的场景：**

1. **组件内部状态**：表单输入、开关状态、展开/折叠——用 `useState`
2. **父子组件传递**：父组件传给子组件的配置——用 Props
3. **只跨越两三层的简单数据**：用 Context 就够了
4. **只在一个页面内使用的数据**：用 `useState` 或局部 Context
5. **服务端数据**：考虑用 React Query / SWR 等数据请求库，它们更擅长管理服务端状态

**一个实用的判断标准**：如果你需要问自己"我需要全局状态管理吗？"，那答案很可能是"暂时不需要"。等你真正遇到 Prop Drilling 痛苦了，或者发现状态在组件间同步很困难了，再引入也不迟。

### 主流方案对比

| 特性 | Redux (RTK) | Zustand | Context API |
|------|-------------|---------|-------------|
| **Bundle Size** | ~7KB (gzipped) | ~300B (gzipped) | 0（内置） |
| **学习曲线** | 中等 | 低 | 低 |
| **DevTools 调试** | 完善（时间旅行） | 有 | 无 |
| **中间件支持** | 强大 | 插件灵活 | 无 |
| **处理异步** | 内置 thunk/saga | 原生支持 | 需要自己实现 |
| **适合场景** | 大型应用 | 中小型/大型均可 | 简单共享数据 |

---

## Redux Toolkit (RTK)

### 传统 Redux 的问题

在 Redux Toolkit 出现之前，写 Redux 代码被称为"样板代码地狱"：

```javascript
// 传统 Redux：做一个"加法"需要这么多代码！

// 1. 定义 Action Type（常量）
const INCREMENT = 'counter/increment';
const DECREMENT = 'counter/decrement';
const SET_AMOUNT = 'counter/setAmount';

// 2. 创建 Action Creator（函数）
function increment() {
  return { type: INCREMENT };
}
function decrement() {
  return { type: DECREMENT };
}
function setAmount(amount) {
  return { type: SET_AMOUNT, payload: amount };
}

// 3. 创建 Reducer（还得写 switch-case）
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case DECREMENT:
      return { count: state.count - 1 };
    case SET_AMOUNT:
      return { count: action.payload };
    default:
      return state;
  }
}

// 4. 配置 Store
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { devToolsEnhancer } from 'redux-devtools-extension';

const store = createStore(
  combineReducers({ counter: counterReducer }),
  compose(applyMiddleware(thunk), devToolsEnhancer())
);
```

光是一个计数器就要写这么多代码！而且还要确保不可变更新（不能直接修改 state）：

```javascript
// 传统 Redux 中的不可变更新——很繁琐
function todoReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.payload]; // 创建新数组
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed } // 创建新对象
          : todo
      );
    default:
      return state;
  }
}
```

### RTK 如何解决这个问题

Redux Toolkit 把上面那些繁琐的步骤全部自动化了：

```typescript
// RTK：同样的功能，代码量减少 70% 以上

import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { count: 0 },
  reducers: {
    // 直接写"你想怎么改"，RTK 自动帮你处理不可变更新
    increment: state => { state.count += 1; },
    decrement: state => { state.count -= 1; },
    setAmount: (state, action) => { state.count = action.payload; },
  }
});

const store = configureStore({
  reducer: { counter: counterSlice.reducer }
});

// Action creators 自动创建好了！
store.dispatch(counterSlice.actions.increment());
```

**RTK 的秘密武器是 Immer**：它让你可以"直接修改" state，但底层仍然保证了不可变性。你写的 `state.count += 1`，实际上 Immer 会帮你创建一个新的 state 对象。

### 安装与配置

```bash
npm install @reduxjs/toolkit react-redux
# 或
yarn add @reduxjs/toolkit react-redux
```

### 项目结构

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

### Slice：RTK 的核心概念

Slice（切片）就是把应用状态按照功能模块"切"成小块。每个 Slice 管理自己那部分状态，就像一个公司里不同部门各管各的业务。

```typescript
// src/store/slices/todoSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// ---- 第一步：定义数据的形状（TypeScript 接口） ----
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface TodosState {
  items: Todo[];                          // 所有待办事项
  status: 'idle' | 'loading' | 'succeeded' | 'failed';  // 异步请求状态
  error: string | null;                   // 错误信息
  filter: 'all' | 'active' | 'completed'; // 当前筛选条件
}

// ---- 第二步：定义初始状态 ----
const initialState: TodosState = {
  items: [],
  status: 'idle',   // 空闲
  error: null,
  filter: 'all'
};

// ---- 第三步：定义异步操作（Thunk） ----
// 什么是 Thunk？简单说就是一个"可以延迟执行的函数"
// 在 Redux 里，普通 Action 只能是纯对象，不能包含异步操作
// Thunk 让你可以 dispatch 一个函数，在函数里执行异步逻辑

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',  // 这个字符串是 Action 的 type 前缀
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

// ---- 第四步：创建 Slice ----
const todoSlice = createSlice({
  name: 'todos',           // Slice 名称，会拼到 Action type 里
  initialState,             // 初始状态

  // reducers: 定义同步操作（直接修改状态的函数）
  reducers: {
    toggleTodo: (state, action: PayloadAction<number>) => {
      // 注意：这里直接修改 state 是安全的！Immer 会在底层帮你处理
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
  },

  // extraReducers: 处理异步操作的生命周期
  // createAsyncThunk 会自动创建 3 种状态：pending（进行中）、fulfilled（成功）、rejected（失败）
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;  // API 返回的数据
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

// ---- 第五步：导出 ----
// Action creators 自动创建，直接解构导出即可
export const {
  toggleTodo,
  deleteTodo,
  clearCompletedTodos,
  setFilter,
} = todoSlice.actions;

// Reducer 也导出
export default todoSlice.reducer;
```

### 配置 Store

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './slices/todoSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

// configureStore 是一个"一站式"配置函数
// 它自动帮你：配置 Redux DevTools、添加 redux-thunk 中间件、检查序列化问题
export const store = configureStore({
  reducer: {
    todos: todoReducer,  // state.todos 对应 todoSlice 管理的状态
    auth: authReducer,   // state.auth 对应 authSlice 管理的状态
    ui: uiReducer        // state.ui 对应 uiSlice 管理的状态
  },
  devTools: process.env.NODE_ENV !== 'production'
});

// 导出类型，方便组件中使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 连接到 React：Provider

在应用入口处，用 `Provider` 包裹整个应用：

```tsx
// src/main.tsx
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

**Provider 的作用**：它把 Store 放到 React 的 Context 中，这样应用内的任何组件都能通过 `useSelector` 和 `useDispatch` 访问 Store。你可以把它想象成一个"全局广播站"，Provider 就是那根广播天线。

### 在组件中使用

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { fetchTodos, toggleTodo, deleteTodo, setFilter } from '../../store/slices/todoSlice';
import type { RootState, AppDispatch } from '../../store';

// 类型安全的 Hooks（推荐封装成自定义 Hook）
const useAppSelector = useSelector.withTypes<RootState>();
const useAppDispatch = useDispatch.withTypes<AppDispatch>();

function TodoList() {
  const dispatch = useAppDispatch();

  // 从 Store 中读取状态
  const todos = useAppSelector(state => state.todos.items);
  const status = useAppSelector(state => state.todos.status);
  const error = useAppSelector(state => state.todos.error);
  const filter = useAppSelector(state => state.todos.filter);

  // 组件挂载时获取数据
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos());  // 派发异步 Action
    }
  }, [dispatch, status]);

  // 根据 filter 过滤数据
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);

  // 派发同步 Action
  const handleToggle = (id: number) => {
    dispatch(toggleTodo(id));
  };

  return (
    <div>
      <div className="filters">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => dispatch(setFilter(f))}
          >
            {f}
          </button>
        ))}
      </div>

      {status === 'loading' && <p>加载中...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <span
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={() => handleToggle(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Selectors：从 Store 中提取数据的"查询器"

Selector 是一个函数，它接收整个 state，返回你需要的部分数据。

```typescript
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// 基础 Selector：直接从 state 中取值
export const selectAllTodos = (state: RootState) => state.todos.items;
export const selectTodoFilter = (state: RootState) => state.todos.filter;

// Memoized Selector：带缓存的计算
// 只有当输入值变化时，才会重新计算
// 这就像 Excel 公式：如果引用的单元格没变，公式结果也不会变
export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectTodoFilter],  // 输入（依赖）
  (todos, filter) => {                 // 计算逻辑
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }
);

// 在组件中使用 Selector
function TodoCount() {
  // createSelector 的缓存避免每次渲染都重新过滤数组
  const filteredTodos = useAppSelector(selectFilteredTodos);
  return <p>共 {filteredTodos.length} 项</p>;
}
```

**为什么需要 Memoized Selector？** 假设你有 3 个组件都在使用 `selectFilteredTodos`，如果没有缓存，每次任何一个组件重新渲染时，数组过滤操作都会重复执行 3 次。有了 `createSelector` 的缓存，只要 `todos` 和 `filter` 没变，就只计算一次。

---

## Zustand（轻量级替代方案）

### 为什么会有 Zustand？

Zustand（德语，意为"状态"）的出现是因为很多开发者觉得 Redux 虽然功能强大，但对于中小型项目来说太重了。Zustand 的核心理念是：**用最简单的 API 实现全局状态管理**。

**对比 Redux 的几个关键区别：**

| 特性 | Redux | Zustand |
|------|-------|---------|
| 需要 Provider 包裹？ | 是 | **不需要！** |
| 创建 Action Creator？ | 需要 | **不需要，直接写函数** |
| 安装大小 | ~7KB | ~300B（不到 Redux 的 5%） |
| 学习概念 | store、action、reducer、dispatch、selector... | **只需要知道一个 `create`** |

### 安装

```bash
npm install zustand
```

### 基础用法：5 分钟上手

```typescript
// stores/useCountStore.ts
import { create } from 'zustand';

// create 接收一个函数，返回包含 state 和 actions 的对象
const useCountStore = create<{ count: number; increment: () => void; reset: () => void }>((set) => ({
  // State
  count: 0,

  // Actions（直接修改 state 的函数）
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));

export default useCountStore;
```

```tsx
// 组件中使用——就像用 useState 一样简单
import useCountStore from '../stores/useCountStore';

function Counter() {
  // 只订阅你需要的部分，其他部分变化不会触发重渲染
  const count = useCountStore((state) => state.count);
  const increment = useCountStore((state) => state.increment);
  const reset = useCountStore((state) => state.reset);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```

注意到没有？**没有 Provider，没有 connect，没有 mapStateToProps**。就这么简单。

### 实战：用户认证 Store

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// persist 中间件：自动把 state 保存到 localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始 State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Action: 登录
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!response.ok) throw new Error('登录失败');

          const data = await response.json();
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      },

      // Action: 登出
      logout: () => {
        set({ user: null, token: null });
      },

      // Action: 清除错误
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',  // localStorage 的 key 名
      partialize: (state) => ({
        // 只持久化这两个字段（不保存 isLoading 和 error）
        user: state.user,
        token: state.token,
      }),
    }
  )
);
```

```tsx
// 使用示例
function LoginButton() {
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await login(formData.get('email') as string, formData.get('password') as string);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <input name="email" type="email" placeholder="邮箱" />
      <input name="password" type="password" placeholder="密码" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '登录中...' : '登录'}
      </button>
    </form>
  );
}

// 在另一个完全不相关的组件中也能直接使用
function Navbar() {
  const { user, logout } = useAuthStore();

  if (!user) return <a href="/login">登录</a>;

  return (
    <nav>
      <span>{user.name} ({user.role})</span>
      <button onClick={logout}>退出</button>
    </nav>
  );
}
```

### Zustand 的中间件

中间件就是给 Store 增加额外功能的"插件"：

```typescript
import { create } from 'zustand';
import { devtools, persist, immer } from 'zustand/middleware';

const useStore = create(
  devtools(               // 开发者工具（可以在 Redux DevTools 中调试）
    persist(              // 持久化（保存到 localStorage）
      immer(              // Immer（像 RTK 一样支持直接修改 state）
        (set, get) => ({
          // ... 你的 state 和 actions
        })
      ),
      { name: 'my-store' }
    )
  )
);
```

---

## 技术选型：Redux 还是 Zustand？

### 选择 Redux Toolkit 的场景

- 应用规模**很大**（几十个页面/功能模块）
- 团队已经熟悉 Redux
- 需要**时间旅行调试**（回溯每一步状态变化）
- 需要**严格的架构约束**（多人协作时代码风格统一）
- 配合 RTK Query 做数据请求管理

### 选择 Zustand 的场景

- 追求**简单和快速上手**
- 不想写那么多样板代码
- 不想被 Provider 包裹
- Bundle size 敏感（比如移动端应用）
- 需要在组件外使用 Store（如工具函数、定时器中）

### 可以混合使用

```tsx
// 完全可以同时使用两者
// Redux：管理核心业务数据（用户、订单等）
// Zustand：管理 UI 状态（侧边栏、模态框、通知等）

function App() {
  return (
    <Provider store={rtkStore}>     {/* Redux 管理业务数据 */}
      <Sidebar />                    {/* Zustand 控制侧边栏 */}
      <MainContent />                {/* Redux 管理业务内容 */}
      <ToastContainer />             {/* Zustand 控制通知 */}
    </Provider>
  );
}
```

---

## 阶段检查清单

- [ ] 理解 Flux 架构和单向数据流的核心思想
- [ ] 能解释为什么需要全局状态管理、什么时候不需要
- [ ] 掌握 RTK 的 Slice、createAsyncThunk、Selector 的用法
- [ ] 能用 Zustand 快速创建一个带持久化的 Store
- [ ] 能根据项目规模做出合理的技术选型

---

## 练习任务

1. **迁移练习**：把第 12 章用 Context 管理的主题切换，迁移到 Zustand（体会代码简化的程度）
2. **完整 CRUD**：用 RTK 实现一个用户管理的增删改查功能，包含异步请求和错误处理
3. **对比实验**：分别用 Redux 和 Zustand 实现同一个购物车功能，对比代码量和开发体验

---

## 🔬 状态管理方案的深层原理对比

### 1. 为什么需要全局状态管理？

#### Props 层级传递的痛点

当应用变大后，数据往往需要在多个不相关的组件之间共享。如果没有全局状态管理，你只能一层一层用 props 传递——这就是 **Props Drilling**。

```
数据流向：App → Layout → Sidebar → UserMenu → Avatar

问题：
┌──────────────────────────────────────────────────┐
│  App（持有 user 数据）                             │
│   └── Layout（不关心 user，但必须接收并传递）       │
│        └── Sidebar（不关心 user，但必须接收并传递） │
│             └── UserMenu（不关心 user，但必须传递）│
│                  └── Avatar（终于用了 user！）     │
│                                                   │
│  💡 中间 3 层组件完全是"无辜的搬运工"              │
│  如果要改 user 的名字，要改 5 个组件的代码          │
└──────────────────────────────────────────────────┘
```

> 💡 **生活类比**：Props Drilling 就像你在公司里想找 CEO 谈件事，但你不能直接去 CEO 办公室。你必须先告诉组长，组长告诉经理，经理告诉总监，总监告诉副总裁，副总裁告诉 CEO。中间每个人都只是"传话的"，但缺了谁都不行。

#### 状态管理的本质问题：共享 + 变更通知

所有状态管理工具，无论 Redux、Zustand 还是 Jotai，本质上都在解决两个问题：

```
问题 1：共享——如何让任意组件访问到同一个数据？

┌─────────────────────────────────────────┐
│           ┌────────┐                    │
│           │ Store  │  ← 单一数据中心    │
│           └───┬────┘                    │
│         ┌─────┼─────┐                  │
│         ↓     ↓     ↓                  │
│    Component1  Component2  Component3   │
│    (直接读取)  (直接读取)  (直接读取)   │
└─────────────────────────────────────────┘

问题 2：变更通知——数据变了，怎么通知用到它的组件？

  Store 数据变化
      ↓
  找到所有订阅了这个数据的组件
      ↓
  触发它们重新渲染
      ↓
  组件用新数据更新 UI
```

> 💡 **大白话**：全局状态管理就像公司的"公告栏"。所有人都可以看公告栏上的内容（共享）。公告栏上的内容更新了，所有订阅了通知的人都会收到提醒（变更通知）。

---

### 2. Redux 的核心原理

#### 单一数据源（Single Source of Truth）

Redux 的核心理念是：**整个应用的所有状态都存在一个对象树里**，这个对象树就叫 Store。

```
一个电商应用的 Redux Store 示例：

{
  cart: {
    items: [
      { id: 1, name: 'React 入门书', price: 59, quantity: 1 },
      { id: 2, name: 'TypeScript 教程', price: 79, quantity: 2 },
    ],
    totalAmount: 217
  },
  user: {
    name: '张三',
    role: 'admin',
    isLoggedIn: true
  },
  ui: {
    theme: 'dark',
    sidebarOpen: true,
    language: 'zh-CN'
  }
}

💡 整个应用的状态一目了然，就像一个"全息地图"
```

> 💡 **类比**：Redux Store 就像一本"总账本"。公司所有的进出账目都记在这一本账里，不会有第二本。你想查任何数据，都来这一本账里找。

#### Store 的发布-订阅模式实现

Redux Store 内部就是一个经典的**发布-订阅模式（Pub/Sub）**：

```javascript
// ====== 迷你 Redux 实现（约 50 行）======

// 1. createStore：创建 Store
function createStore(reducer, initialState) {
  let state = initialState;     // 当前状态
  let listeners = [];           // 订阅者列表

  // getState：读取当前状态
  function getState() {
    return state;
  }

  // dispatch：派发 Action，触发状态更新
  function dispatch(action) {
    // 调用 reducer 计算新状态（纯函数，无副作用）
    state = reducer(state, action);
    // 通知所有订阅者
    listeners.forEach(listener => listener());
  }

  // subscribe：订阅状态变化
  function subscribe(listener) {
    listeners.push(listener);
    // 返回取消订阅的函数
    return function unsubscribe() {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  return { getState, dispatch, subscribe };
}

// 2. Reducer：纯函数，定义状态如何变化
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state;  // 未知 action，返回原状态
  }
}

// 3. 使用
const store = createStore(counterReducer, { count: 0 });

// 订阅状态变化
store.subscribe(() => {
  console.log('新状态:', store.getState());
});

// 派发 Action
store.dispatch({ type: 'INCREMENT' });  // 新状态: { count: 1 }
store.dispatch({ type: 'INCREMENT' });  // 新状态: { count: 2 }
store.dispatch({ type: 'DECREMENT' });  // 新状态: { count: 1 }
```

```
Redux 的数据流（单向）：

  ┌─────────┐    Action     ┌─────────┐
  │  View   │ ──────────→  │ Store   │
  │(组件 UI)│              │(状态仓库)│
  └────┬────┘              └────┬────┘
       │                        │
       │  订阅通知               │  调用 Reducer
       │ ←────────────────────── │
       │                        │
       │  重新渲染               │
       └───────────────────────→│
```

> 💡 **大白话**：View 发出一个"指令"（Action），Store 收到后交给"决策者"（Reducer），Reducer 算出新状态存到 Store 里，Store 通知 View "数据变了，你该更新了"。

#### Reducer 的纯函数哲学

Reducer 必须是**纯函数**，这意味着：

```javascript
// ✅ 纯函数 Reducer（正确）
function todosReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      // 返回新对象，不修改原 state
      return [...state, { id: Date.now(), text: action.text, done: false }];
    default:
      return state;
  }
}

// ❌ 非纯函数（错误示例）
function badReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      state.push({ id: Date.now(), text: action.text });  // 直接修改了原 state！
      return state;
    case 'FETCH_DATA':
      fetch('/api/data');  // 副作用！不应该在 Reducer 里发网络请求
      return state;
    case 'RANDOM':
      return { ...state, value: Math.random() };  // 不确定的结果！
    default:
      return state;
  }
}
```

| 纯函数要求 | 说明 | 生活类比 |
|-----------|------|---------|
| 相同输入 → 相同输出 | 给定同一个 state 和 action，结果永远一样 | 同一个配方 + 同样的材料 = 永远做出同样的菜 |
| 不修改输入参数 | 不能直接改 state，必须返回新对象 | 食谱不会修改你买来的食材 |
| 没有副作用 | 不发请求、不操作 DOM、不写 localStorage | 厨师只管做菜，不管送餐和收钱 |

> ⚠️ **为什么要纯函数？** 因为 Redux 的 DevTools 需要能够"时间旅行"——回放每一个 Action 的效果。如果 Reducer 有副作用或不确定行为，回放结果就会不一致，调试就无从谈起。

#### Redux Toolkit 做了哪些简化？

```
传统 Redux 代码量 vs Redux Toolkit 代码量对比：

传统 Redux                          Redux Toolkit
─────────────────────              ─────────────────────
定义 Action Type 常量 (3行)         →  ❌ 不需要了
创建 Action Creator (3行)           →  ❌ 不需要了
写 switch-case Reducer (10行)       →  ✅ 直接写修改逻辑 (1行/个)
手动处理不可变更新                    →  ✅ Immer 自动处理
手动配置 middleware                  →  ✅ configureStore 内置
手动写 createSelector               →  ✅ createSlice 配合 createSelector

总计：约 20 行 → 约 5 行（减少 75%）
```

```javascript
// 传统 Redux 写一个 increment：
const INCREMENT = 'counter/increment';
const increment = () => ({ type: INCREMENT });
function counterReducer(state, action) {
  if (action.type === INCREMENT) return { count: state.count + 1 };
  return state;
}

// RTK 写一个 increment：
increment: (state) => { state.count += 1; }

// 看出差距了吧？RTK 通过 createSlice 自动生成：
// - Action type 字符串：'counter/increment'
// - Action creator 函数：{ type: 'counter/increment' }
// - Immer 帮你处理不可变更新
```

---

### 3. Zustand 的原理

#### 为什么 Zustand 比 Redux 简单？

Zustand 去掉了 Redux 中"多余"的概念：

```
Redux 的概念链：
  Action Type → Action Creator → Action → Reducer → Store → useSelector → useDispatch
  (6 个概念，6 步操作)

Zustand 的概念链：
  create(state) → useStore(selector)
  (2 个概念，2 步操作)

本质区别：
┌────────────────┬───────────────────────────────┐
│    Redux       │        Zustand                │
├────────────────┼───────────────────────────────┤
│ 需要 Provider  │ 不需要 Provider               │
│ 需要 Reducer   │ 直接写修改函数                 │
│ 需要 dispatch  │ 直接调用函数                   │
│ 需要 Action    │ 不需要，函数就是 Action        │
│ 需要 Selector  │ 可选，支持精准订阅             │
└────────────────┴───────────────────────────────┘
```

> 💡 **大白话**：Redux 像一个"大公司"——有严格的流程（写申请 → 领导审批 → 执行）。Zustand 像一个"自由职业者"——想改就改，没有那么多流程。

#### Zustand 的订阅机制（基于 useSyncExternalStore）

Zustand 在 React 18 中使用了 `useSyncExternalStore` 来实现精准订阅：

```javascript
// ====== 迷你 Zustand 实现（约 30 行）======

function createStore(createState) {
  // 状态和订阅者列表
  let state;
  const listeners = new Set();

  // 初始化状态
  const api = {
    setState: (partial) => {
      // 支持传入新状态对象或更新函数
      const nextState = typeof partial === 'function'
        ? partial(state)
        : partial;
      state = { ...state, ...nextState };
      // 通知所有订阅者
      listeners.forEach(listener => listener());
    },
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  // 执行 createState，将 api 传入，让用户定义初始状态和 actions
  state = createState(api.setState, api.getState, api);

  return api;
}

// 创建 Hook，让组件可以订阅 Store
function useStore(api, selector) {
  // 使用 React 18 的 useSyncExternalStore
  // 它能保证状态变化时只触发使用了变化数据的组件重渲染
  return useSyncExternalStore(
    api.subscribe,                            // 订阅函数
    () => selector(api.getState()),           // 获取当前值
    () => selector(api.getInitialState())     // 服务端渲染用的快照
  );
}

// ====== 使用示例 ======
const useCountStore = createStore((set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

function Counter() {
  // 精准订阅：只关心 count，其他字段变化不触发重渲染
  const count = useStore(useCountStore, state => state.count);
  const increment = useStore(useCountStore, state => state.increment);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

```
Zustand 与 React 的交互：

  组件调用 useStore(selector)
    ↓
  useSyncExternalStore 订阅 Zustand store
    ↓
  store.setState() 被调用
    ↓
  store 通知所有订阅者
    ↓
  useSyncExternalStore 检查 selector 返回值是否变化
    ↓
  只有返回值变化的组件才会重新渲染
    ↓
  🔍 关键：selector 做了 Object.is 比较
     如果返回的是对象/数组，每次都是新引用 → 总是重渲染
     如果返回的是原始值（数字、字符串、布尔） → 精准比较
```

> ⚠️ **Zustand 的 selector 注意事项**：如果 selector 返回对象，需要用 `shallow` 比较函数，否则每次都是新引用导致重渲染。

---

### 4. Jotai/Valtio 的原子化原理

#### 原子状态 vs 集中式状态

```
集中式状态（Redux/Zustand）：
┌─────────────────────────────────────┐
│            Big Store                 │
│  ┌──────┬──────┬──────┬──────┐     │
│  │ user │ cart │ ui   │ ...  │     │
│  └──────┴──────┴──────┴──────┘     │
│                                     │
│  任何字段变化 → 所有订阅者收到通知   │
│  需要用 selector 过滤                │
└─────────────────────────────────────┘

原子化状态（Jotai）：
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ atom │ │ atom │ │ atom │ │ atom │  ← 每个状态独立
│userN │ │cartN │ │theme│ │lang │
└──┬──┘ └──┬──┘ └─────┘ └─────┘
   │       │
   ↓       ↓
┌─────┐ ┌─────┐
│Comp1│ │Comp2│  ← 各组件订阅各自的 atom
└─────┘ └─────┘

  userN 变化 → 只有 Comp1 重渲染
  cartN 变化 → 只有 Comp2 重渲染
  theme 变化 → 没人订阅 → 无人重渲染
```

> 💡 **大白话**：集中式状态像"大锅饭"——一个锅里煮所有菜，加了一种调料，所有人都尝到变化。原子化状态像"自助餐"——每道菜独立装盘，想吃哪盘拿哪盘，改了其中一道菜不影响其他人。

```javascript
// Jotai 的原子化状态
import { atom, useAtom } from 'jotai';

// 每个 atom 就是一个独立的状态单元
const userAtom = atom({ name: '张三', age: 25 });
const themeAtom = atom('dark');
const countAtom = atom(0);

// 组件只订阅自己需要的 atom
function UserName() {
  const [user] = useAtom(userAtom);
  // 只有 userAtom 变化时才重渲染
  // themeAtom、countAtom 变化不影响这个组件
  return <span>{user.name}</span>;
}

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  // 只有 countAtom 变化时才重渲染
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

#### 依赖图和精准重渲染

Jotai 的强大之处在于**派生 atom**——一个 atom 可以依赖其他 atom，自动形成依赖图：

```javascript
import { atom, useAtom } from 'jotai';

// 基础 atom（原始数据源）
const priceAtom = atom(100);
const quantityAtom = atom(2);

// 派生 atom（根据基础 atom 计算）
// 使用 read 函数自动追踪依赖
const totalAtom = atom((get) => {
  const price = get(priceAtom);
  const quantity = get(quantityAtom);
  return price * quantity;  // 200
});

// 组件使用
function TotalDisplay() {
  const [total] = useAtom(totalAtom);
  return <p>总价: {total}</p>;
}
```

```
Jotai 的依赖图和更新传播：

  priceAtom ────┐
                ├──→ totalAtom ──→ TotalDisplay
  quantityAtom ─┘

当 quantityAtom 变化（2 → 3）：
  1. quantityAtom 通知自己的订阅者
  2. totalAtom 发现自己依赖 quantityAtom → 重新计算
  3. TotalDisplay 订阅了 totalAtom → 重新渲染

当 priceAtom 变化（100 → 120）：
  1. priceAtom 通知自己的订阅者
  2. totalAtom 发现自己依赖 priceAtom → 重新计算
  3. TotalDisplay 订阅了 totalAtom → 重新渲染

🔍 关键：如果 priceAtom 和 quantityAtom 都没变，
   totalAtom 就不会重算，TotalDisplay 也不会重渲染。
   这是真正的"精准重渲染"——和 Excel 公式一模一样！
```

> 💡 **Excel 类比**：Jotai 的 atom 就像 Excel 的单元格。`A1=100`、`B1=2`、`C1=A1*B1`。当你修改 A1 时，只有 C1 自动更新。其他与 A1、B1、C1 无关的单元格不受影响。

#### Proxy 在 Valtio 中的应用

Valtio 采用了完全不同的思路：**用 JavaScript 的 Proxy 拦截对象操作**，让状态修改看起来就像普通的属性赋值。

```javascript
import { proxy, useSnapshot } from 'valtio';

// proxy 创建一个可观察的状态对象
const state = proxy({
  count: 0,
  user: { name: '张三', age: 25 },
});

// 修改状态就像修改普通对象——直接赋值！
// 不需要 set()、dispatch()、Action Creator
function increment() {
  state.count += 1;  // 就这么简单！
}
function renameUser(newName) {
  state.user.name = newName;  // 深层修改也没问题！
}

// 组件中使用 useSnapshot 获取响应式快照
function Counter() {
  const snap = useSnapshot(state);
  // snap.count 是响应式的——state.count 变化时组件重渲染
  // snap 是只读的代理对象，不能通过 snap 修改状态
  return <button onClick={increment}>{snap.count}</button>;
}
```

```
Valtio 的 Proxy 工作原理：

┌──────────────────────────────────────────┐
│  const state = proxy({ count: 0 })      │
│                                          │
│  实际创建了一个 Proxy 对象：              │
│  ┌─────────────────────────────┐        │
│  │  Proxy Handler:             │        │
│  │                             │        │
│  │  get(target, prop) {        │        │
│  │    // 读取时：追踪依赖       │        │
│  │    track(target, prop);     │        │
│  │    return target[prop];     │        │
│  │  }                          │        │
│  │                             │        │
│  │  set(target, prop, value) { │        │
│  │    // 修改时：触发通知       │        │
│  │    target[prop] = value;    │        │
│  │    notify(target, prop);    │        │
│  │  }                          │        │
│  └─────────────────────────────┘        │
└──────────────────────────────────────────┘

useSnapshot 的原理：
  1. 读取 snap.count → 触发 Proxy 的 get handler → 追踪依赖
  2. state.count = 5 → 触发 Proxy 的 set handler → 通知组件
  3. 组件重渲染 → 读取新的 snap.count → 返回 5
```

> 💡 **大白话**：Valtio 就像一个"智能保险箱"。你往里面放东西、取东西看起来和普通箱子一模一样（直接赋值、直接读取），但箱子内部有人在暗中记录"谁拿了什么"（依赖追踪）和"什么被改了"（变更通知）。你不需要学任何特殊的 API，就是写普通的 JavaScript。

```
三种方案的核心理念对比：

┌──────────┬─────────────────┬──────────────────┬──────────────────┐
│          │     Redux       │     Jotai        │     Valtio       │
├──────────┼─────────────────┼──────────────────┼──────────────────┤
│ 核心思想 │ 集中式 + 纯函数 │ 原子化 + 依赖图  │ Proxy 代理       │
│ 修改方式 │ dispatch(action)│ set(newValue)    │ state.x = v      │
│ 学习成本 │ 高               │ 低               │ 最低             │
│ 适合场景 │ 大型团队协作     │ 中小型项目       │ 快速原型/个人项目 │
│ 精准渲染 │ 需要 selector   │ 天然精准         │ 天然精准         │
└──────────┴─────────────────┴──────────────────┴──────────────────┘
```

---

[← 13 - 路由管理](../13-router/) | [→ 15 - 性能优化](../15-performance-optimization/)
