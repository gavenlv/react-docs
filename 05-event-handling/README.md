# 05 - 事件处理

## 🎯 本节目标
- 理解 React 中的合成事件系统
- 掌握常见的事件处理模式
- 学会正确绑定事件处理器
- 了解事件对象的用法

---

## 📖 React 事件系统概述

React 使用**合成事件（SyntheticEvent）**系统，统一了不同浏览器的事件接口。

### 为什么使用合成事件？

1. **跨浏览器兼容**: 自动处理 IE 和现代浏览器的差异
2. **高性能**: 使用事件委托减少内存占用
3. **一致性**: 提供统一的 API

---

## 🎯 基本语法

### 事件命名规范

```jsx
// React 事件使用 camelCase
onClick        // 点击
onChange       // 值改变
onSubmit       // 表单提交
onKeyDown      // 键盘按下
onMouseEnter   // 鼠标进入
onFocus        // 获得焦点
```

### 定义事件处理器

```jsx
function MyComponent() {
  // 方式一：箭头函数（推荐）
  const handleClick = () => {
    console.log('按钮被点击了！');
  };
  
  return <button onClick={handleClick}>点我</button>;
}
```

---

## 🖱️ 常见事件类型

### 鼠标事件

```jsx
function MouseDemo() {
  const handleClick = (event) => {
    console.log('点击位置:', event.clientX, event.clientY);
    console.log('目标元素:', event.target);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{ width: '200px', height: '100px', background: 'lightblue' }}
    >
      点击我
    </div>
  );
}
```

### 键盘事件

```jsx
function KeyboardDemo() {
  const handleKeyDown = (event) => {
    console.log('按键:', event.key);
    
    // 常用按键检测
    if (event.key === 'Enter') console.log('回车键');
    if (event.key === 'Escape') console.log('ESC键');
    
    // 组合键
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      console.log('Ctrl+S 保存');
    }
  };
  
  return <input onKeyDown={handleKeyDown} placeholder="按任意键" />;
}
```

### 表单事件

```jsx
function FormEvents() {
  const [value, setValue] = useState('');
  
  const handleChange = (e) => {
    setValue(e.target.value);  // 获取输入值
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();  // 阻止页面刷新！重要！
    console.log('提交:', value);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

---

## ⚙️ 传递参数给事件处理器

```jsx
function ParameterDemo() {
  const users = ['Alice', 'Bob', 'Charlie'];
  
  // 使用内联箭头函数传参
  const handleDelete = (userName) => {
    console.log(`删除用户: ${userName}`);
  };
  
  return (
    <ul>
      {users.map(user => (
        <li key={user}>
          {user}
          <button onClick={() => handleDelete(user)}>删除</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🛡️ 阻止默认行为和冒泡

```jsx
function EventControlDemo() {
  const handleClick = (e) => {
    e.preventDefault();   // 阻止默认行为（如链接跳转、表单提交）
    e.stopPropagation();  // 阻止事件冒泡到父元素
    
    console.log('处理完成');
  };
  
  return (
    <div onClick={() => console.log('父元素被点击')}>
      <a href="https://example.com" onClick={handleClick}>
        点击链接（不会跳转）
      </a>
    </div>
  );
}
```

---

## ✅ 阶段检查清单

- [ ] 理解合成事件系统
- [ ] 掌握鼠标、键盘、表单事件的用法
- [ ] 能够传递参数给事件处理器
- [ ] 知道如何阻止默认行为和事件冒泡

---

## 📝 练习任务

1. **计算器**: 实现加减乘除，支持键盘输入
2. **Todo 列表**: 添加、删除、切换完成状态

---

[→ 06 - 条件渲染](../06-conditional-rendering/)
