# 10 - 入门项目实战：Todo App

## 🎯 项目目标

综合运用前 9 节学到的所有知识，构建一个功能完整的 Todo 应用。

### 功能需求
- ✅ 添加新的待办事项
- ✅ 标记完成/未完成
- ✅ 删除待办事项
- ✅ 筛选显示（全部/进行中/已完成）
- ✅ 统计任务数量
- ✅ 数据持久化到 LocalStorage
- ✅ 响应式设计

---

## 📁 项目结构

```
todo-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # 头部组件
│   │   ├── TodoForm.jsx        # 添加表单
│   │   ├── TodoList.jsx        # 列表容器
│   │   ├── TodoItem.jsx        # 单个待办项
│   │   └── FilterButtons.jsx   # 过滤按钮组
│   ├── hooks/
│   │   └── useLocalStorage.js  # 自定义 Hook
│   ├── App.css                 # 样式文件
│   ├── App.jsx                 # 主应用组件
│   └── main.jsx                # 入口文件
└── package.json
```

---

## 🔧 完整实现代码

### 1. 自定义 Hook：useLocalStorage

```jsx
// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
```

### 2. Header 组件

```jsx
// src/components/Header.jsx
import React from 'react';

function Header({ todoCount }) {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <header className="header">
      <h1>📝 待办事项</h1>
      <p className="date">{today}</p>
      <p className="stats">共 {todoCount} 个任务</p>
    </header>
  );
}

export default Header;
```

### 3. TodoForm 组件

```jsx
// src/components/TodoForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert('请输入待办内容！');
      return;
    }

    onAdd({
      id: Date.now(),
      text: text.trim(),
      completed: false,
      priority,
      createdAt: new Date().toISOString()
    });

    setText('');
    setPriority('medium');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="添加新的待办事项... (按 Enter 提交)"
        className="todo-input"
        autoFocus
      />
      
      <select 
        value={priority} 
        onChange={(e) => setPriority(e.target.value)}
        className="priority-select"
      >
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>
      </select>

      <button type="submit" className="add-btn">
        ➕ 添加
      </button>
    </form>
  );
}

TodoForm.propTypes = {
  onAdd: PropTypes.func.isRequired
};

export default TodoForm;
```

### 4. TodoItem 组件

```jsx
// src/components/TodoItem.jsx
import React from 'react';
import PropTypes from 'prop-types';

function TodoItem({ todo, onToggle, onDelete }) {
  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336'
  };

  const handleToggle = () => {
    onToggle(todo.id);
  };

  const handleDelete = () => {
    if (window.confirm(`确定要删除 "${todo.text}" 吗？`)) {
      onDelete(todo.id);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="todo-checkbox"
        />
        
        <span className="todo-text">{todo.text}</span>
        
        <span 
          className={`priority-badge priority-${todo.priority}`}
          style={{ backgroundColor: priorityColors[todo.priority] }}
        >
          {{ low: '低', medium: '中', high: '高' }[todo.priority]}
        </span>
      </div>
      
      <button onClick={handleDelete} className="delete-btn">
        🗑️
      </button>
    </div>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    priority: PropTypes.string.isRequired
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default TodoItem;
```

### 5. TodoList 组件

```jsx
// src/components/TodoList.jsx
import React from 'react';
import TodoItem from './TodoItem';
import PropTypes from 'prop-types';

function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>🎉 太棒了！没有待办事项</p>
        <p>去添加一些新任务吧！</p>
      </div>
    );
  }

  // 按优先级排序：高 > 中 > 低，然后按创建时间
  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.id - a.id;  // 最新的在前面
  });

  return (
    <ul className="todo-list">
      {sortedTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default TodoList;
```

### 6. FilterButtons 组件

```jsx
// src/components/FilterButtons.jsx
import React from 'react';
import PropTypes from 'prop-types';

const FILTERS = [
  { key: 'all', label: '全部', emoji: '📋' },
  { key: 'active', label: '进行中', emoji: '⏳' },
  { key: 'completed', label: '已完成', emoji: '✅' }
];

function FilterButtons({ currentFilter, onFilterChange, counts }) {
  return (
    <div className="filter-buttons">
      {FILTERS.map(filter => (
        <button
          key={filter.key}
          className={`filter-btn ${currentFilter === filter.key ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.emoji} {filter.label}
          ({counts[filter.key]})
        </button>
      ))}
    </div>
  );
}

FilterButtons.propTypes = {
  currentFilter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  counts: PropTypes.object.isRequired
};

export default FilterButtons;
```

### 7. 主应用组件

```jsx
// src/App.jsx
import React, { useState, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import './App.css';

function App() {
  // 使用自定义 hook 管理状态和持久化
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [filter, setFilter] = useState('all');

  // 计算统计数据
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    return {
      all: total,
      active,
      completed
    };
  }, [todos]);

  // 根据过滤条件筛选 todos
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // 添加新的 todo
  const handleAdd = (newTodo) => {
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

  // 切换完成状态
  const handleToggle = (id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // 删除 todo
  const handleDelete = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  // 清空已完成的 todo
  const clearCompleted = () => {
    if (window.confirm('确定要清除所有已完成的任务吗？')) {
      setTodos(prevTodos => prevTodos.filter(t => !t.completed));
    }
  };

  return (
    <div className="app">
      <Header todoCount={stats.all} />
      
      <main className="main">
        <TodoForm onAdd={handleAdd} />
        
        <FilterButtons
          currentFilter={filter}
          onFilterChange={setFilter}
          counts={stats}
        />
        
        <TodoList
          todos={filteredTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
        
        {stats.all > 0 && (
          <footer className="footer">
            <p>
              {stats.active} 个进行中 · {stats.completed} 个已完成
            </p>
            {stats.completed > 0 && (
              <button onClick={clearCompleted} className="clear-btn">
                清除已完成
              </button>
            )}
          </footer>
        )}
      </main>
    </div>
  );
}

export default App;
```

### 8. 样式文件

```css
/* src/App.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.app {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2.5em;
  margin-bottom: 8px;
}

.date {
  opacity: 0.9;
  margin-bottom: 5px;
}

.stats {
  font-size: 0.95em;
  opacity: 0.85;
}

/* Form */
.todo-form {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.todo-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
}

.priority-select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  background: white;
}

.add-btn {
  padding: 12px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s, background 0.3s;
}

.add-btn:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* Filters */
.filter-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.filter-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.filter-btn:hover {
  background: #e0e0e0;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

/* Todo List */
.todo-list {
  list-style: none;
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.todo-item:hover {
  background: #fafafa;
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.todo-checkbox {
  width: 22px;
  height: 22px;
  cursor: pointer;
  accent-color: #667eea;
}

.todo-text {
  font-size: 16px;
  flex: 1;
}

.priority-badge {
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  padding: 4px 8px;
}

.delete-btn:hover {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin: 5px 0;
  font-size: 18px;
}

/* Footer */
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.clear-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.clear-btn:hover {
  background: #dd3333;
}

/* Responsive */
@media (max-width: 480px) {
  .todo-form {
    flex-direction: column;
  }

  .filter-buttons {
    flex-wrap: wrap;
  }

  .header h1 {
    font-size: 1.8em;
  }
}
```

---

## 🚀 运行项目

```bash
# 创建项目
npx create-react-app my-todo-app
cd my-todo-app

# 安装依赖
npm install prop-types

# 将上述代码复制到对应文件中

# 启动项目
npm start
```

浏览器访问 `http://localhost:3000` 即可看到效果！

---

## 💡 功能扩展建议（进阶挑战）

完成基础版本后，可以尝试添加以下功能：

1. **编辑模式**: 双击待办项进入编辑状态
2. **拖拽排序**: 实现拖拽调整顺序
3. **分类标签**: 支持给待办事项添加分类
4. **截止日期**: 设置提醒时间
5. **搜索功能**: 快速查找特定待办事项
6. **暗色主题**: 切换明暗模式
7. **动画效果**: 添加/删除时的过渡动画
8. **数据导出**: 导出为 JSON 或 CSV

---

## ✅ 阶段总结

恭喜你完成了第一个完整的 React 项目！你已经掌握了：

- ✅ JSX 和组件编写
- ✅ Props 和 State 管理
- ✅ 事件处理
- ✅ 条件渲染和列表渲染
- ✅ 表单处理
- ✅ 自定义 Hooks
- ✅ 数据持久化
- ✅ 组件组合与复用

---

## 🔧 项目实战经验与开发技巧

### 1. 从零搭建项目的完整流程

#### 技术选型决策（Vite vs CRA vs Next.js）

```
项目需求分析
│
├─ 简单单页应用 / 工具类 / 个人项目
│   → Vite + React（⭐ 首选，构建快、配置简单）
│
├─ 需要 SEO / 服务端渲染
│   → Next.js（SSR / SSG / ISR）
│
├─ 中后台管理系统 / 企业级 SPA
│   → Vite + React + Ant Design / Shadcn UI
│
└─ 需要 SSR + 复杂 API 路由
    → Next.js App Router
```

| 对比维度 | Vite | CRA | Next.js |
|---------|------|-----|---------|
| 构建速度 | ⚡ 极快（esbuild） | 🐢 慢（webpack） | ⚡ 快（webpack/turbopack） |
| 开发体验 | ⭐⭐⭐ HMR 极快 | ⭐⭐ 中等 | ⭐⭐⭐ |
| 配置灵活度 | ⭐⭐⭐ 高 | ⭐ 低（零配置） | ⭐⭐ 中等 |
| 生产部署 | SPA（需额外配置 SSR） | SPA | 内置 SSR/SSG |
| 学习成本 | ⭐ 低 | ⭐ 最低 | ⭐⭐⭐ 较高 |

#### 项目初始化检查清单

```bash
# 1. 创建项目
npm create vite@latest my-app -- --template react-ts
cd my-app

# 2. 安装核心依赖
npm install react-router-dom axios zustand

# 3. 安装开发依赖
npm install -D \
  tailwindcss postcss autoprefixer \
  @types/node \
  eslint prettier \
  husky lint-staged

# 4. 初始化 Tailwind
npx tailwindcss init -p

# 5. 初始化 Git hooks
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

📋 **初始化后的文件检查清单：**

```
my-app/
├── .editorconfig          # 编辑器配置统一
├── .eslintrc.cjs          # ESLint 规则
├── .prettierrc            # Prettier 格式化规则
├── .gitignore             # Git 忽略规则
├── .env.example           # 环境变量模板（勿提交 .env！）
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── package.json           # 包含 lint-staged 和 husky 配置
```

#### 目录结构设计原则

```
src/
├── assets/            # 静态资源（图片、字体、SVG）
│   ├── images/
│   └── fonts/
├── components/        # 通用 UI 组件（与业务无关）
│   ├── ui/            # 基础组件（Button、Input、Modal）
│   ├── layout/        # 布局组件（Header、Sidebar、Footer）
│   └── Loading.tsx    # 通用加载组件
├── features/          # 业务功能模块（按功能划分）
│   ├── auth/          # 认证模块
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── todo/          # 待办模块
│   └── dashboard/     # 仪表盘模块
├── hooks/             # 全局自定义 Hooks
├── lib/               # 第三方库封装 / 工具函数
│   ├── axios.ts       # Axios 实例配置
│   └── utils.ts       # 通用工具函数
├── pages/             # 页面组件（路由入口）
├── stores/            # 全局状态管理
├── types/             # 全局类型定义
├── styles/            # 全局样式
└── App.tsx            # 应用入口
```

💡 **设计原则：**
- **按功能划分（Feature-based）优于按类型划分**——相关代码放在一起，方便维护
- **`components/ui` 只放无业务逻辑的纯 UI 组件**——可以在任何项目中复用
- **`features` 是核心**——每个功能模块自包含组件、Hook、API、类型

#### .env 环境变量管理

```bash
# .env.example（提交到 Git，给团队成员参考）
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=My App

# .env.development（开发环境，自动加载）
VITE_API_BASE_URL=http://localhost:3000/api
VITE_DEBUG=true

# .env.production（生产环境）
VITE_API_BASE_URL=https://api.myapp.com
VITE_DEBUG=false

# .env.local（本地覆盖，不提交到 Git！）
VITE_API_BASE_URL=http://192.168.1.100:3000/api
```

```tsx
// src/lib/config.ts —— 类型安全的环境变量
const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  debug: import.meta.env.VITE_DEBUG === 'true',
  appTitle: import.meta.env.VITE_APP_TITLE || 'My App',
} as const;

// 使用
console.log(config.apiBaseUrl);
```

#### ESLint + Prettier + Husky 一键配置

```bash
# 安装依赖
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react-hooks \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser husky lint-staged
```

```javascript
// eslint.config.js（flat config）
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  prettierConfig, // 必须放在最后，关闭与 Prettier 冲突的规则
);
```

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

```json
// package.json 中的 lint-staged 配置
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

---

### 2. 代码组织与组件设计

#### 组件拆分的"单一职责"原则

```
组件拆分信号灯：

🔴 需要拆分的信号：
  • 组件超过 200 行
  • useEffect 超过 3 个
  • useState 超过 5 个
  • JSX 嵌套超过 4 层
  • 一个 if-else 分支超过 20 行

🟢 拆分方向：
  • 提取子组件（JSX 块）
  • 提取自定义 Hook（逻辑块）
  • 提取工具函数（纯计算）
```

#### 公共组件 / 业务组件 / 页面组件的分层

```
┌─────────────────────────────────────────────────┐
│  页面组件（Pages）                                │
│  路由入口，组合业务组件，处理路由参数               │
│  示例：TodoPage、ProfilePage                      │
├─────────────────────────────────────────────────┤
│  业务组件（Features）                             │
│  包含业务逻辑，可跨页面复用                        │
│  示例：TodoList、UserCard、OrderStatus            │
├─────────────────────────────────────────────────┤
│  公共组件（UI Components）                        │
│  纯 UI，无业务逻辑，可在任何项目中复用             │
│  示例：Button、Input、Modal、Toast                │
└─────────────────────────────────────────────────┘
```

#### 命名规范大全

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件名（组件） | PascalCase | `UserProfile.tsx` |
| 文件名（Hook） | camelCase + use 前缀 | `useLocalStorage.ts` |
| 文件名（工具） | camelCase | `formatDate.ts` |
| 组件名 | PascalCase | `export function UserProfile` |
| 函数名 | camelCase | `function formatDate()` |
| 常量名 | UPPER_SNAKE_CASE | `const MAX_RETRY_COUNT = 3` |
| 类型/接口 | PascalCase + 描述性后缀 | `interface UserProfileProps` |
| CSS 类名 | kebab-case 或 BEM | `.user-card`, `.user-card__avatar` |
| 事件处理 | handle + 动作 | `handleClick`, `handleSubmit` |
| 回调 Props | on + 动作 | `onClick`, `onChange` |
| 布尔 Props | is/has/should 前缀 | `isLoading`, `hasError` |
| 渲染 Props | render + 名词 | `renderHeader`, `renderItem` |

#### Props 类型定义的最佳实践

```tsx
// ✅ 最佳实践：使用 interface + 描述性命名
interface UserCardProps {
  /** 用户信息 */
  user: {
    id: number;
    name: string;
    avatar: string;
    email?: string; // 可选属性
  };
  /** 是否显示关注按钮 */
  showFollowButton?: boolean;
  /** 关注按钮点击回调 */
  onFollow?: (userId: number) => void;
  /** 子元素（渲染插槽） */
  children?: React.ReactNode;
}

// ✅ 对齐组件 Props 类型导出
export function UserCard({ user, showFollowButton = true, onFollow, children }: UserCardProps) {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <span>{user.name}</span>
      {showFollowButton && onFollow && (
        <button onClick={() => onFollow(user.id)}>关注</button>
      )}
      {children}
    </div>
  );
}

// 导出类型，方便外部使用
export type { UserCardProps };
```

---

### 3. 状态管理实战经验

#### 什么时候用什么？—— 决策树

```
你的状态需要共享给多个组件吗？
│
├─ 不需要（仅组件内部使用）
│   → useState / useReducer ✅
│
├─ 需要共享，但只在一个组件树内
│   │
│   ├─ 层级浅（1-2层）
│   │   → Props 传递 ✅
│   │
│   └─ 层级深 / 多个兄弟组件需要
│       → useContext ✅
│
└─ 需要全局共享 / 跨路由共享
    │
    ├─ 简单的全局状态（主题、语言、用户信息）
    │   → Zustand / Context ✅
    │
    └─ 复杂的状态（关联数据、异步操作、缓存）
        → Zustand + React Query ⭐
```

#### 状态管理选型决策树

| 方案 | 适用场景 | 学习成本 | 体积 |
|------|---------|---------|------|
| `useState` | 单组件内部状态 | ⭐ 最低 | 0 |
| `useReducer` | 复杂的单组件状态逻辑 | ⭐⭐ 低 | 0 |
| `useContext` | 跨层级的共享状态 | ⭐⭐ 低 | 0 |
| **Zustand** | 全局状态（⭐ 推荐） | ⭐ 低 | 1KB |
| **Jotai** | 原子化状态管理 | ⭐⭐ 低 | 2KB |
| Redux Toolkit | 大型项目、复杂状态 | ⭐⭐⭐ 较高 | 11KB |
| MobX | 响应式状态管理 | ⭐⭐ 中等 | 16KB |

#### API 数据放在哪里？（Server State vs Client State）

```
┌────────────────────┬───────────────────────┐
│   Server State     │     Client State      │
│  （服务端状态）      │   （客户端状态）       │
├────────────────────┼───────────────────────┤
│ 用户列表            │ 模态框开关            │
│ 商品详情            │ 表单输入值            │
│ 订单数据            │ 侧边栏展开/收起       │
│ 搜索结果            │ 暗黑模式开关          │
│ 通知消息            │ 分页页码             │
├────────────────────┼───────────────────────┤
│ ⭐ React Query /   │ ⭐ useState /         │
│   SWR 管理          │   Zustand 管理        │
│                    │                       │
│ 特点：             │ 特点：                 │
│ • 自动缓存          │ • 组件级              │
│ • 自动重新验证       │ • 不需要持久化         │
│ • 乐观更新          │ • 纯 UI 驱动          │
│ • 请求去重          │                       │
└────────────────────┴───────────────────────┘
```

```tsx
// Server State —— 用 React Query 管理
import { useQuery, useMutation } from '@tanstack/react-query';

function UserList() {
  // React Query 自动处理 loading/error/data 状态
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新请求
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client State —— 用 useState 管理
function SearchBar() {
  const [keyword, setKeyword] = useState(''); // 纯 UI 状态
  return <input value={keyword} onChange={e => setKeyword(e.target.value)} />;
}
```

---

### 4. 常见开发问题与解决方案

#### 路由守卫（登录后才能访问）

```tsx
// components/AuthGuard.tsx
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 保存当前路径，登录后跳回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// 在路由配置中使用
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthGuard>
            <SettingsPage />
          </AuthGuard>
        }
      />
    </Routes>
  );
}
```

#### 全局 Loading 状态

```tsx
// stores/useLoadingStore.ts（Zustand 示例）
import { create } from 'zustand';

interface LoadingStore {
  loadingCount: number;
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loadingCount: 0,
  isLoading: false,
  startLoading: () =>
    set((state) => ({
      loadingCount: state.loadingCount + 1,
      isLoading: true,
    })),
  stopLoading: () =>
    set((state) => {
      const newCount = Math.max(0, state.loadingCount - 1);
      return { loadingCount: newCount, isLoading: newCount > 0 };
    }),
}));
```

#### 表单验证（React Hook Form 推荐）

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 用 zod 定义验证规则
const schema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(1, '请输入姓名'),
});

type FormValues = z.infer<typeof schema>;

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    await api.register(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

#### 暗黑模式（Dark Mode）

```tsx
// 方案：Tailwind CSS + Context
const ThemeContext = createContext({
  theme: 'light' as 'light' | 'dark',
  toggleTheme: () => {},
});

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 优先读取 localStorage，其次跟随系统偏好
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

#### 图片懒加载

```tsx
// 方案 1：原生 loading="lazy"（最简单）
<img src={largeImage} alt="description" loading="lazy" />

// 方案 2：Intersection Observer（更精细的控制）
function LazyImage({ src, alt, fallback }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect(); // 加载一次后不再监听
        }
      },
      { rootMargin: '200px' } // 提前 200px 开始加载
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ minHeight: 200 }}>
      {isLoaded ? (
        <img src={src} alt={alt} />
      ) : (
        fallback || <div className="skeleton" />
      )}
    </div>
  );
}

// 方案 3：react-lazy-load-image-component 库
```

#### 大文件上传（分片上传 + 进度条）

```tsx
function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB 一片
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = `${Date.now()}_${file.name}`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('chunkIndex', String(i));
      formData.append('totalChunks', String(totalChunks));
      formData.append('chunk', chunk);

      await api.uploadChunk(formData);
      setProgress(Math.round(((i + 1) / totalChunks) * 100));
    }

    // 通知后端合并分片
    await api.mergeChunks({ fileId, fileName: file.name, totalChunks });
    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && (
        <div>
          <progress value={progress} max={100} />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

#### 复制到剪贴板

```tsx
import { useState } from 'react';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级方案：使用 textarea + execCommand
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleCopy}>
      {copied ? '✅ 已复制' : '📋 复制'}
    </button>
  );
}
```

#### 移动端适配

```css
/* 方案 1：Tailwind 响应式前缀 */
/* <div className="text-sm md:text-base lg:text-lg"> */

/* 方案 2：CSS 媒体查询 */
/* @media (max-width: 768px) { ... } */

/* 方案 3：viewport 单位 */
.container {
  width: min(100vw - 32px, 1200px);
  padding: 0 16px;
  margin: 0 auto;
}
```

```tsx
// 方案 4：useMediaQuery Hook
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// 使用
function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

---

### 5. 代码审查（Code Review）清单

#### 代码审查看什么？

```
代码审查四维度
│
├─ 🔴 正确性（必须通过）
│   • 逻辑是否正确？边界条件是否处理？
│   • 是否有潜在 bug？
│
├─ 🟠 安全性（必须通过）
│   • 是否有 XSS 风险？（dangerouslySetInnerHTML）
│   • 敏感信息是否暴露？（API Key、密码）
│   • 用户输入是否做了校验？
│
├─ 🟡 可维护性（重要）
│   • 代码是否易读？命名是否清晰？
│   • 组件是否过大？是否需要拆分？
│   • 是否有重复代码可以提取？
│
└─ 🟢 可读性（建议）
    • 注释是否充分？（复杂逻辑必须有注释）
    • 代码风格是否一致？
    • 是否有合理的 TypeScript 类型？
```

#### 常见的代码坏味道

| 坏味道 | 示例 | 改进 |
|--------|------|------|
| 组件过大 | 300+ 行的组件 | 拆分子组件和自定义 Hook |
| Prop Drilling | 5 层传递 `theme` | 用 Context / Zustand |
| useEffect 依赖缺失 | `useEffect(() => { fn(a) }, [])` | 添加 `a` 到依赖数组 |
| 硬编码字符串 | `<h1>欢迎</h1>` | 使用 i18n 或常量 |
| 嵌套三元运算 | `a ? b ? c : d : e` | 用 early return 或提取变量 |
| index 作 key | `list.map((_, i) => <div key={i}>)` | 使用唯一 ID |
| 未处理的 Promise | `fetch(url)` 不处理错误 | 加 `try/catch` 或 `.catch()` |
| any 类型泛滥 | `const data: any` | 定义具体类型 |

#### 30 条 React 代码审查要点

**组件设计：**
1. ✅ 组件是否有单一职责？
2. ✅ Props 是否有 TypeScript 类型定义？
3. ✅ 组件是否过大？（超过 200 行需要拆分）
4. ✅ 是否有合理的默认 Props？
5. ✅ 是否正确处理了 `children`？

**性能：**
6. ✅ 是否有不必要的 `useEffect`？
7. ✅ 列表渲染是否使用了唯一的 `key`？
8. ✅ 是否对昂贵的计算使用了 `useMemo`？
9. ✅ 传递给子组件的回调是否用了 `useCallback`？（仅大列表需要）
10. ✅ 是否有可以懒加载的组件？（`React.lazy`）

**状态管理：**
11. ✅ 状态是否放在了合理的层级？
12. ✅ `useEffect` 的依赖数组是否完整？
13. ✅ 是否在 `useEffect` 中正确清理了副作用？（清除定时器、取消订阅）
14. ✅ 是否避免了在 `useEffect` 中直接修改 state 引用？（应使用函数式更新）
15. ✅ 全局状态是否合理使用？（不要把所有状态都放全局）

**错误处理：**
16. ✅ 异步操作是否有 try/catch？
17. ✅ API 请求是否有错误处理？
18. ✅ 用户是否能看到友好的错误提示？
19. ✅ 是否使用了 Error Boundary 捕获渲染错误？
20. ✅ 竞态条件是否处理？（组件卸载时取消未完成的请求）

**安全：**
21. ✅ 是否避免了 `dangerouslySetInnerHTML`？
22. ✅ 用户输入是否做了转义/校验？
23. ✅ API Key 等敏感信息是否放在了环境变量中？
24. ✅ 是否检查了依赖中的已知漏洞？（`npm audit`）

**可访问性：**
25. ✅ 图片是否有 `alt` 属性？
26. ✅ 表单输入是否有 `label`？
27. ✅ 按钮是否有语义化的文本？
28. ✅ 颜色对比度是否足够？
29. ✅ 是否支持键盘导航？

**代码质量：**
30. ✅ 命名是否清晰、一致？

#### 如何写好 Code Review 意见

```
📋 Code Review 意见模板：

【严重】（必须修改）
> 安全问题 / Bug / 逻辑错误
> "这里存在 XSS 风险，用户输入没有转义就插入到了 innerHTML 中"

【建议】（推荐修改）
> 性能优化 / 可维护性改进
> "这个 useEffect 可以拆分成两个独立的 effect，分别处理数据获取和事件监听"

【讨论】（可以讨论）
> 架构选择 / 设计决策
> "这个功能用 React Query 还是 SWR？我倾向 React Query 因为团队更熟悉，你怎么看？"

【表扬】（值得肯定）
> "这个自定义 Hook 封装得很优雅，逻辑清晰，复用性强 👍"
```

> 💡 **核心原则：** Code Review 的目的是**提升代码质量**，而不是挑刺。语气友善、给出具体改进建议、对好的代码给予肯定。

---

## 🔗 下一步

准备好迎接更高级的 React 技巧了吗？

[→ 第二阶段：进阶提升](../11-custom-hooks/)
