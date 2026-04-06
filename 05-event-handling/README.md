# 05 - 事件处理

## 🎯 本节目标
- 理解 React 中的合成事件系统
- 掌握常见的事件处理模式
- 学会正确绑定事件处理器
- 了解事件对象的用法
- 理解 React 事件系统的设计哲学

---

## 📖 React 事件系统概述

### 什么是事件？

在理解 React 事件之前，先理解什么是"事件"。

> **生活中的"事件"**：你每天都会遇到各种"事件"——闹钟响了（事件）、有人按了门铃（事件）、快递到了（事件）。你会对这些事件做出"反应"（Reaction）——起床、去开门、去取快递。
>
> **网页中的"事件"**：用户点击了按钮（事件）、用户在输入框里打字（事件）、用户按下了键盘（事件）。程序需要对这些事件做出"反应"——提交表单、显示提示、执行搜索。

**事件处理（Event Handling）** 就是定义"当某个事件发生时，程序应该做什么"。

### React 使用合成事件（SyntheticEvent）

React 使用**合成事件（SyntheticEvent）**系统，统一了不同浏览器的事件接口。

**为什么需要合成事件？**

> 不同的浏览器对事件的处理方式不一样。就像中国的插头和美国的插头形状不同，如果你带了中国的电器去美国，就需要一个**转换器**。
>
> React 的 SyntheticEvent 就是这个"转换器"。你只需要按照 React 的标准写事件处理代码，React 会在底层自动处理各种浏览器的差异。这样你写一份代码，在 Chrome、Firefox、Safari、Edge 上都能正常工作。

**合成事件的三大优势：**

1. **跨浏览器兼容**：自动处理 IE 和现代浏览器的差异，你不用再写 `event = event || window.event` 这种兼容代码
2. **高性能**：使用事件委托（Event Delegation），只在根节点上绑定一个事件监听器，而不是在每个元素上都绑定，大大减少了内存占用
3. **一致性**：提供统一的 API，不管底层浏览器是什么，你的代码写法都一样

### 事件委托（Event Delegation）—— 合成事件高效的原因

> 想象一个学校有 1000 个学生。校长想给每个学生发通知：
>
> - **方法一**：给每个学生单独打电话（传统 DOM 事件）→ 需要 1000 次通话，太累了
> - **方法二**：通知班主任，让班主任转达（事件委托）→ 只需 1 次通话
>
> React 选择的是方法二。它不会给每个按钮、每个输入框都绑定事件监听器，而是只在根元素上绑定一个，然后通过"冒泡"机制来分发事件。这就是**事件委托**。

---

## 🎯 基本语法

### 事件命名规范

```jsx
// 原生 HTML 事件使用全小写
// <button onclick="handleClick()">点我</button>

// React 事件使用 camelCase（驼峰命名）
onClick        // 点击
onChange       // 值改变
onSubmit       // 表单提交
onKeyDown      // 键盘按下
onKeyUp        // 键盘抬起
onMouseEnter   // 鼠标进入
onMouseLeave   // 鼠标离开
onFocus        // 获得焦点
onBlur         // 失去焦点
onScroll       // 滚动
onDragStart    // 开始拖拽
```

> **为什么要用 camelCase？** 因为 React 的 JSX 本质上就是 JavaScript，而 JavaScript 的命名惯例是 camelCase。这不是 React 故意要搞特殊，而是跟 JavaScript 保持一致。

### 定义事件处理器的几种方式

```jsx
function MyComponent() {
  // ✅ 方式一：箭头函数（最推荐）
  // 箭头函数自动绑定 this（虽然函数组件中没有 this 的问题）
  const handleClick = () => {
    console.log('按钮被点击了！');
  };

  // ✅ 方式二：普通函数声明
  // 在函数组件中也可以用，因为函数组件没有 this
  function handleDoubleClick() {
    console.log('双击了！');
  }

  // ✅ 方式三：在 JSX 中直接写箭头函数
  // 适合简单的逻辑
  // 注意：这种方式每次渲染都会创建新的函数对象，有轻微性能影响
  return (
    <div>
      <button onClick={handleClick}>点我</button>
      <button onDoubleClick={handleDoubleClick}>双击我</button>
      <button onClick={() => console.log('直接写的逻辑')}>
        内联箭头函数
      </button>
    </div>
  );
}
```

**为什么推荐方式一？**

> 1. **性能更好**：函数只创建一次，不会每次渲染都重新创建
> 2. **可读性更好**：逻辑集中在一个地方，JSX 模板更简洁
> 3. **可测试**：函数可以单独导出进行单元测试
> 4. **可复用**：函数可以被多个元素共享使用

---

## 🖱️ 常见事件类型

### 鼠标事件

```jsx
function MouseDemo() {
  const handleClick = (event) => {
    console.log('点击位置:', event.clientX, event.clientY);
    console.log('目标元素:', event.target);
  };

  const handleDoubleClick = () => {
    console.log('双击了！');
  };

  const handleMouseEnter = () => {
    console.log('鼠标进来了');
  };

  const handleMouseLeave = () => {
    console.log('鼠标离开了');
  };

  const handleMouseMove = (event) => {
    console.log(`鼠标位置: (${event.clientX}, ${event.clientY})`);
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ width: '200px', height: '100px', background: 'lightblue' }}
    >
      在这里移动和点击鼠标
    </div>
  );
}
```

**event 对象的常用属性：**

| 属性 | 含义 | 示例值 |
|------|------|--------|
| `event.target` | 触发事件的元素 | `<button>` 元素 |
| `event.currentTarget` | 绑定事件处理器的元素 | 外层 `<div>` |
| `event.clientX` | 鼠标相对于浏览器窗口的 X 坐标 | 350 |
| `event.clientY` | 鼠标相对于浏览器窗口的 Y 坐标 | 200 |
| `event.preventDefault()` | 阻止默认行为 | 阻止链接跳转 |
| `event.stopPropagation()` | 阻止事件冒泡 | 防止父元素也收到事件 |

### 键盘事件

```jsx
function KeyboardDemo() {
  const handleKeyDown = (event) => {
    console.log('按键:', event.key);
    console.log('键码:', event.keyCode);  // 已废弃，但了解一下

    // 常用按键检测
    if (event.key === 'Enter') console.log('回车键被按下了');
    if (event.key === 'Escape') console.log('ESC 键被按下了');
    if (event.key === 'Tab') console.log('Tab 键被按下了');
    if (event.key === 'Backspace') console.log('退格键被按下了');

    // 修饰键检测
    console.log('是否按了 Ctrl:', event.ctrlKey);
    console.log('是否按了 Shift:', event.shiftKey);
    console.log('是否按了 Alt:', event.altKey);

    // 组合键
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();  // 阻止浏览器默认的 Ctrl+S 保存行为
      console.log('Ctrl+S → 自定义保存');
    }

    if (event.ctrlKey && event.key === 'c') {
      console.log('Ctrl+C → 复制');
    }
  };

  const handleKeyUp = (event) => {
    console.log(`按键 ${event.key} 被松开了`);
  };

  return (
    <div>
      <input
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="按任意键试试"
      />
      <p>试试按 Ctrl+S，看看会发生什么</p>
    </div>
  );
}
```

### 表单事件

```jsx
function FormEvents() {
  const [value, setValue] = useState('');

  // onChange：输入框内容变化时触发
  // 注意：在 React 中，onChange 会在每次输入时触发
  // （与原生 HTML 的 onchange 只在失去焦点时触发不同！）
  const handleChange = (e) => {
    setValue(e.target.value);  // e.target.value 获取输入框当前值
  };

  // onSubmit：表单提交时触发
  const handleSubmit = (e) => {
    e.preventDefault();  // ⚠️ 极其重要！阻止页面刷新！
    // 如果不调用 e.preventDefault()，表单提交会导致页面刷新
    // 页面刷新 = 所有 state 丢失 = 你的单页应用白干了
    console.log('提交的内容:', value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleChange} />
      <button type="submit">提交</button>
    </form>
  );
}
```

**为什么 `e.preventDefault()` 这么重要？**

> 在传统网页中，提交表单会让浏览器向服务器发送请求并刷新整个页面。但在 React 这种**单页应用（SPA）** 中，你不想刷新页面，而是想用 JavaScript 来处理提交逻辑。
>
> 如果不调用 `e.preventDefault()`，点击提交按钮后：
> 1. 页面会刷新
> 2. 所有 React 组件的状态都会丢失
> 3. 用户需要重新操作
>
> 调用 `e.preventDefault()` 后：
> 1. 页面不会刷新
> 2. 你可以在 `handleSubmit` 里用 JavaScript 处理提交逻辑（比如发送 API 请求）
> 3. 用户体验流畅

---

## ⚙️ 传递参数给事件处理器

这是实际开发中最常见的需求之一。

### 内联箭头函数

```jsx
function ParameterDemo() {
  const users = ['Alice', 'Bob', 'Charlie'];

  // 我们想让 handleClick 知道是哪个用户被点击了
  const handleClick = (userName) => {
    console.log(`你点击了: ${userName}`);
  };

  return (
    <ul>
      {users.map(user => (
        <li key={user}>
          {user}
          {/* ✅ 使用内联箭头函数传参 */}
          <button onClick={() => handleClick(user)}>
            查看
          </button>
        </li>
      ))}
    </ul>
  );
}
```

**为什么不能这样写？**

```jsx
{/* ❌ 错误！这样会在渲染时就执行函数，而不是在点击时执行 */}
<button onClick={handleClick(user)}>查看</button>

// 相当于：
// 1. 组件渲染时，handleClick('Alice') 被立即执行
// 2. 执行结果（undefined）被传给 onClick
// 3. 点击按钮时，onClick 收到的是 undefined，什么都不做
```

**正确的三种方式：**

```jsx
// 方式一：内联箭头函数（最常用）
<button onClick={() => handleClick(user)}>查看</button>

// 方式二：bind 方法（旧写法，不推荐）
<button onClick={handleClick.bind(null, user)}>查看</button>

// 方式三：如果需要 event 对象
<button onClick={(e) => handleClick(e, user)}>查看</button>
// 这样 handleClick 同时能收到 event 和 user 参数

// handleClick 的定义：
const handleClick = (event, userName) => {
  console.log('事件:', event);
  console.log('用户:', userName);
};
```

### 同时传递 event 和自定义参数

```jsx
function DeleteButton({ itemId, itemName }) {
  const handleDelete = (event, id, name) => {
    event.stopPropagation();       // 阻止事件冒泡
    console.log(`删除 ${name} (ID: ${id})`);
  };

  return (
    <button onClick={(e) => handleDelete(e, itemId, itemName)}>
      删除 {itemName}
    </button>
  );
}
```

---

## 🛡️ 阻止默认行为和冒泡

### 默认行为（preventDefault）

浏览器对某些元素有"默认行为"，比如：

| 元素 | 默认行为 |
|------|---------|
| `<a>` 标签 | 点击后跳转到 href 指定的页面 |
| `<form>` | 提交后刷新页面 |
| `<input type="checkbox">` | 点击后切换选中状态 |
| 右键菜单 | 弹出浏览器默认菜单 |

```jsx
function PreventDefaultDemo() {
  // 阻止链接跳转
  const handleLinkClick = (e) => {
    e.preventDefault();
    console.log('链接被点击了，但没有跳转');
    // 你可以在这里做自定义的事情，比如弹出确认框
  };

  // 阻止表单刷新
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('表单被提交了，但页面没有刷新');
    // 你可以在这里用 fetch/axios 发送 API 请求
  };

  return (
    <div>
      <a href="https://example.com" onClick={handleLinkClick}>
        点击我（不会跳转）
      </a>
      <form onSubmit={handleFormSubmit}>
        <input placeholder="输入内容" />
        <button type="submit">提交（不会刷新页面）</button>
      </form>
    </div>
  );
}
```

### 事件冒泡（stopPropagation）

**什么是事件冒泡？**

> 想象你在湖里丢了一块石头，水面会泛起一圈圈涟漪，从中心向外扩散。**事件冒泡也是类似的**——当你点击一个按钮时，事件不仅会在按钮上触发，还会一层一层向上"冒泡"到父元素、祖父元素。

```jsx
function BubblingDemo() {
  return (
    <div onClick={() => console.log('① div 被点击了')}>
      <p onClick={() => console.log('② p 被点击了')}>
        <button onClick={() => console.log('③ 按钮被点击了')}>
          点击我
        </button>
      </p>
    </div>
  );
}
// 点击按钮后，控制台会输出：
// ③ 按钮被点击了
// ② p 被点击了
// ① div 被点击了
// 事件从按钮 → p → div，这就是"冒泡"
```

**什么时候需要阻止冒泡？**

```jsx
// 场景：表格中每一行有一个删除按钮，点击整行可以选中
// 但点击删除按钮时不应该触发行的选中
function TableRow({ item, onSelect, onDelete }) {
  return (
    <tr onClick={() => onSelect(item.id)}>
      <td>{item.name}</td>
      <td>{item.price}</td>
      <td>
        <button
          onClick={(e) => {
            e.stopPropagation();  // 阻止冒泡！否则会同时触发行的选中
            onDelete(item.id);
          }}
        >
          删除
        </button>
      </td>
    </tr>
  );
}
```

> 如果不阻止冒泡，点击删除按钮时：
> 1. 删除按钮的 onClick 触发 → 执行删除
> 2. 事件冒泡到 `<tr>` → 触发行的 onClick → 选中这一行
> 3. 用户只想删除，结果行也被选中了，体验很奇怪

**注意**：在 React 中，`e.stopPropagation()` 只能阻止 React 合成事件的冒泡。如果同一元素上同时绑定了原生事件和 React 事件，你可能需要同时使用 `e.nativeEvent.stopImmediatePropagation()`。不过这种情况很少见，初学者不必深究。

---

## 🔒 事件处理中的常见陷阱

### 陷阱一：循环中的事件处理器

```jsx
// ❌ 错误示例
function BadList() {
  const items = ['A', 'B', 'C'];

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
          {/* setTimeout 中的 index 永远是 3！ */}
          <button onClick={() => setTimeout(() => {
            console.log(index);  // 总是输出 3，而不是 0、1、2
          }, 1000)}>
            延迟查看
          </button>
        </li>
      ))}
    </ul>
  );
}

// ✅ 正确做法
function GoodList() {
  const items = ['A', 'B', 'C'];

  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item}
          {/* 直接使用 item（闭包捕获了当前循环的 item） */}
          <button onClick={() => setTimeout(() => {
            console.log(item);  // 正确输出 'A'、'B'、'C'
          }, 1000)}>
            延迟查看
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### 陷阱二：在事件处理器中读取过时的 State

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 这样写，handleAlert 中的 count 永远是 0
  // 因为它在第一次渲染时创建，闭包捕获了 count=0
  function handleAlertBad() {
    setTimeout(() => {
      alert(`当前计数: ${count}`);  // 总是显示 0
    }, 3000);
  }

  // ✅ 使用 ref 来获取最新值（进阶用法，了解一下）
  const countRef = useRef(count);
  countRef.current = count;

  function handleAlertGood() {
    setTimeout(() => {
      alert(`当前计数: ${countRef.current}`);  // 显示最新的值
    }, 3000);
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={handleAlertBad}>3秒后查看（错误版）</button>
      <button onClick={handleAlertGood}>3秒后查看（正确版）</button>
    </div>
  );
}
```

> 这个问题叫做**"闭包陷阱"**（Stale Closure）。简单来说，事件处理器"记住"的是创建时的值，而不是最新的值。这是 JavaScript 闭包的特性，不是 React 的 Bug。解决方案是使用函数式更新 `setCount(prev => prev + 1)` 或使用 `useRef`。

---

## 🎨 实战示例：自定义 Hook 封装事件

在实际开发中，你经常需要把事件处理逻辑封装成可复用的 Hook。

```jsx
// 自定义 Hook：处理键盘快捷键
function useKeyboardShortcut(key, callback) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === key) {
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback]);
}

// 使用自定义 Hook
function ShortcutsDemo() {
  useKeyboardShortcut('Escape', () => {
    console.log('按了 ESC，关闭弹窗');
  });

  useKeyboardShortcut('s', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      console.log('Ctrl+S，保存文档');
    }
  });

  return <div>试试按 ESC 或 Ctrl+S</div>;
}
```

### 实战示例：搜索框（防抖处理）

```jsx
import { useState, useEffect } from 'react';

function SearchBox() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setKeyword(value);

    // 防抖（Debounce）：用户停止输入 500ms 后才执行搜索
    // 避免每输入一个字符就发一次请求
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      // 这里可以替换为真实的 API 请求
      console.log('搜索:', value);
      // setResults(await searchAPI(value));
    }, 500);
    setTimer(newTimer);
  };

  return (
    <div>
      <input
        value={keyword}
        onChange={handleChange}
        placeholder="搜索用户..."
      />
      <p>输入中: {keyword}</p>
      {/* 搜索结果列表 */}
    </div>
  );
}
```

> **防抖（Debounce）** 是事件处理中的常用技巧。想象你坐电梯，每有人按一下按钮电梯就关门是不合理的——电梯会等一段时间没人按按钮了才关门。防抖就是类似的思路：**等用户停止操作一段时间后，再执行逻辑**。

---

## 🧠 核心概念总结

| 概念 | 一句话解释 | 生活中的类比 |
|------|-----------|-------------|
| 事件（Event） | 用户或浏览器触发的动作 | 有人按了门铃 |
| 事件处理器（Handler） | 事件触发时执行的函数 | 听到门铃后去开门 |
| 合成事件（SyntheticEvent） | React 统一封装的事件对象 | 万能插头转换器 |
| 事件委托（Delegation） | 在父元素上统一处理子元素的事件 | 校长通知班主任转达 |
| 事件冒泡（Bubbling） | 事件从子元素向上传播到父元素 | 石头丢进水里涟漪扩散 |
| preventDefault | 阻止浏览器的默认行为 | 邮递员不按常规路线走 |
| stopPropagation | 阻止事件向上传播 | 按了门铃但声音不传出去 |

---

## ✅ 阶段检查清单

- [ ] 理解什么是事件、为什么需要事件处理
- [ ] 理解合成事件系统和事件委托
- [ ] 掌握鼠标、键盘、表单事件的用法
- [ ] 能够正确传递参数给事件处理器
- [ ] 知道如何阻止默认行为和事件冒泡
- [ ] 理解为什么表单提交需要 preventDefault
- [ ] 了解闭包陷阱和防抖技巧

---

## 📝 练习任务

### 任务 1：计算器
实现一个计算器：
- 支持加减乘除四则运算
- 支持键盘输入数字和运算符
- 显示当前输入和计算结果
- 有清除和退格功能

### 任务 2：Todo 列表
实现一个功能完整的 Todo 列表：
- 添加新的待办事项（输入框 + 回车提交）
- 删除待办事项
- 切换完成状态（点击复选框）
- 显示未完成数量
- 支持键盘快捷键（如 Ctrl+N 添加新事项）

---

[→ 06 - 条件渲染](../06-conditional-rendering/)
