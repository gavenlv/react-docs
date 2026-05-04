# 10 - 事件处理

## 🎯 本节目标
- 理解事件的概念和机制
- 掌握事件监听和处理
- 了解事件对象和事件委托
- 学会阻止默认行为和事件传播

---

## 📖 什么是事件？

事件是用户或浏览器执行的某种动作，如点击、输入、加载等。JavaScript 可以监听这些事件并执行相应的处理函数。

```javascript
const btn = document.querySelector('button');

btn.addEventListener('click', function() {
  alert('按钮被点击了！');
});
```

---

## 🎧 事件监听

### addEventListener()

```javascript
const btn = document.querySelector('button');

btn.addEventListener('click', function(event) {
  console.log('点击事件触发', event);
});

// 使用箭头函数
btn.addEventListener('click', (e) => {
  console.log('点击位置:', e.clientX, e.clientY);
});

// 添加多个监听器
btn.addEventListener('click', handler1);
btn.addEventListener('click', handler2);
```

### 移除监听器

```javascript
function handleClick() {
  console.log('点击');
}

btn.addEventListener('click', handleClick);
btn.removeEventListener('click', handleClick);

// 注意：匿名函数无法移除
btn.addEventListener('click', () => {});  // 无法移除
```

### 一次性监听

```javascript
btn.addEventListener('click', function() {
  console.log('只执行一次');
}, { once: true });
```

### 事件选项

```javascript
btn.addEventListener('click', handler, {
  once: true,      // 只执行一次
  capture: false,  // 是否在捕获阶段触发
  passive: true    // 不会调用 preventDefault
});
```

---

## 📋 常用事件

### 鼠标事件

| 事件 | 描述 |
|------|------|
| `click` | 单击 |
| `dblclick` | 双击 |
| `mousedown` | 鼠标按下 |
| `mouseup` | 鼠标释放 |
| `mousemove` | 鼠标移动 |
| `mouseenter` | 鼠标进入（不冒泡） |
| `mouseleave` | 鼠标离开（不冒泡） |
| `mouseover` | 鼠标悬停（冒泡） |
| `mouseout` | 鼠标移出（冒泡） |
| `contextmenu` | 右键菜单 |

```javascript
const box = document.querySelector('.box');

box.addEventListener('mouseenter', () => {
  box.style.background = 'blue';
});

box.addEventListener('mouseleave', () => {
  box.style.background = 'gray';
});
```

### 键盘事件

| 事件 | 描述 |
|------|------|
| `keydown` | 按键按下 |
| `keyup` | 按键释放 |
| `keypress` | 按键按下（已废弃） |

```javascript
document.addEventListener('keydown', (e) => {
  console.log('按键:', e.key);
  console.log('键码:', e.code);
  console.log('Ctrl:', e.ctrlKey);
  console.log('Shift:', e.shiftKey);
  console.log('Alt:', e.altKey);
  
  if (e.key === 'Escape') {
    closeModal();
  }
  
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveDocument();
  }
});
```

### 表单事件

| 事件 | 描述 |
|------|------|
| `input` | 输入内容变化 |
| `change` | 值改变并失焦 |
| `focus` | 获得焦点 |
| `blur` | 失去焦点 |
| `submit` | 表单提交 |
| `reset` | 表单重置 |

```javascript
const input = document.querySelector('input');

input.addEventListener('input', (e) => {
  console.log('当前值:', e.target.value);
});

input.addEventListener('focus', () => {
  console.log('获得焦点');
});

input.addEventListener('blur', () => {
  console.log('失去焦点');
});

const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('表单数据:', new FormData(form));
});
```

### 文档/窗口事件

| 事件 | 描述 |
|------|------|
| `DOMContentLoaded` | DOM 加载完成 |
| `load` | 页面完全加载 |
| `resize` | 窗口大小改变 |
| `scroll` | 滚动 |
| `beforeunload` | 页面即将卸载 |

```javascript
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 加载完成');
});

window.addEventListener('load', () => {
  console.log('页面完全加载');
});

window.addEventListener('resize', () => {
  console.log('窗口大小:', window.innerWidth, window.innerHeight);
});

window.addEventListener('scroll', () => {
  console.log('滚动位置:', window.scrollY);
});
```

---

## 📦 事件对象

```javascript
element.addEventListener('click', (e) => {
  e.target;           // 触发事件的元素
  e.currentTarget;    // 绑定事件的元素
  e.type;             // 事件类型
  e.timeStamp;        // 事件时间戳
  
  // 鼠标事件
  e.clientX, e.clientY;   // 相对于视口
  e.pageX, e.pageY;       // 相对于文档
  e.offsetX, e.offsetY;   // 相对于元素
  e.button;               // 鼠标按钮
  
  // 键盘事件
  e.key;              // 按键值
  e.code;             // 物理键码
  e.keyCode;          // 键码（已废弃）
  
  // 修饰键
  e.ctrlKey;
  e.shiftKey;
  e.altKey;
  e.metaKey;
});
```

---

## 🛑 阻止默认行为

```javascript
const link = document.querySelector('a');

link.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('链接点击被阻止');
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('表单提交被阻止');
});

document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  console.log('右键菜单被阻止');
});
```

---

## 🔄 事件传播

事件传播分为三个阶段：

1. **捕获阶段**：从 window 向下传播到目标元素
2. **目标阶段**：到达目标元素
3. **冒泡阶段**：从目标元素向上冒泡到 window

```text
捕获阶段 ↓
window → document → html → body → div → button
                                              目标阶段
冒泡阶段 ↑
window ← document ← html ← body ← div ← button
```

### 阻止事件传播

```javascript
parent.addEventListener('click', () => {
  console.log('父元素点击');
});

child.addEventListener('click', (e) => {
  e.stopPropagation();  // 阻止冒泡
  console.log('子元素点击');
});

// 只有点击子元素时，父元素的事件不会触发
```

### 事件委托

利用事件冒泡，在父元素上统一处理子元素的事件。

```javascript
const ul = document.querySelector('ul');

ul.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('点击了:', e.target.textContent);
  }
});

// 动态添加的元素也能响应事件
const li = document.createElement('li');
li.textContent = '新项目';
ul.appendChild(li);
```

---

## 💻 实战示例：拖拽功能

```javascript
const draggable = document.getElementById('draggable');
let isDragging = false;
let offsetX, offsetY;

draggable.addEventListener('mousedown', (e) => {
  isDragging = true;
  offsetX = e.clientX - draggable.offsetLeft;
  offsetY = e.clientY - draggable.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  draggable.style.left = (e.clientX - offsetX) + 'px';
  draggable.style.top = (e.clientY - offsetY) + 'px';
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解事件的概念
- [ ] 会使用 addEventListener 监听事件
- [ ] 了解常用事件类型
- [ ] 掌握事件对象的使用
- [ ] 理解事件传播和事件委托

---

## 📝 练习任务

### 任务 1：快捷键功能
实现页面快捷键：Ctrl+S 保存，Ctrl+F 搜索，Esc 关闭。

### 任务 2：无限滚动
实现滚动到底部时自动加载更多内容。

### 任务 3：拖拽排序
实现列表项的拖拽排序功能。

---

## 🔗 相关资源

- [MDN - 事件介绍](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Building_blocks/Events)
- [MDN - 事件参考](https://developer.mozilla.org/zh-CN/docs/Web/Events)
- [MDN - Event 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/Event)
