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

## 🔗 下一步

准备好迎接更高级的 React 技巧了吗？

[→ 第二阶段：进阶提升](../11-custom-hooks/)
