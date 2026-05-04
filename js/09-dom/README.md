# 09 - DOM 操作

## 🎯 本节目标
- 理解 DOM 的概念和结构
- 掌握元素的获取和创建
- 学会修改元素内容和样式
- 了解 DOM 遍历和操作

---

## 📖 什么是 DOM？

DOM（Document Object Model）是 HTML 文档的编程接口。它将文档表示为节点树，JavaScript 可以通过 DOM API 操作页面内容。

```text
document
└── html
    ├── head
    │   ├── title
    │   └── meta
    └── body
        ├── header
        │   └── h1
        ├── main
        │   └── p
        └── footer
```

---

## 🔍 获取元素

### 通过 ID 获取

```javascript
const element = document.getElementById('myId');
```

### 通过选择器获取

```javascript
const el = document.querySelector('.myClass');      // 获取第一个匹配元素
const els = document.querySelectorAll('.myClass');  // 获取所有匹配元素

const div = document.querySelector('div.container');
const link = document.querySelector('a[href^="https"]');
```

### 通过标签/类名获取

```javascript
const divs = document.getElementsByTagName('div');
const items = document.getElementsByClassName('item');
```

### 特殊元素

```javascript
document.documentElement;  // <html>
document.head;             // <head>
document.body;             // <body>
document.title;            // 页面标题
document.URL;              // 页面 URL
```

---

## 📝 修改内容

### innerHTML

```javascript
const el = document.getElementById('content');

el.innerHTML = '<strong>加粗文字</strong>';  // 解析 HTML
el.innerHTML += '<p>追加内容</p>';           // 追加
```

### textContent

```javascript
const el = document.getElementById('content');

el.textContent = '纯文本内容';  // 不解析 HTML
el.textContent += '追加文本';
```

### innerText

```javascript
const el = document.getElementById('content');

el.innerText = '可见文本';  // 考虑 CSS 样式
```

### 区别

| 属性 | 解析 HTML | 考虑样式 | 性能 |
|------|----------|----------|------|
| `innerHTML` | ✅ | ❌ | 较慢 |
| `textContent` | ❌ | ❌ | 最快 |
| `innerText` | ❌ | ✅ | 较慢 |

---

## 🎨 修改样式

### style 属性

```javascript
const el = document.getElementById('box');

el.style.color = 'red';
el.style.backgroundColor = 'blue';  // 驼峰命名
el.style.fontSize = '20px';
el.style.display = 'none';

// 多个样式
Object.assign(el.style, {
  color: 'white',
  background: 'blue',
  padding: '10px'
});
```

### className

```javascript
const el = document.getElementById('box');

el.className = 'active';        // 覆盖所有类
el.className += ' highlight';   // 添加类
```

### classList（推荐）

```javascript
const el = document.getElementById('box');

el.classList.add('active');           // 添加类
el.classList.remove('active');        // 移除类
el.classList.toggle('active');        // 切换类
el.classList.contains('active');      // 检查类
el.classList.replace('old', 'new');   // 替换类

// 添加多个类
el.classList.add('class1', 'class2', 'class3');
```

### CSS 变量

```javascript
const el = document.documentElement;

el.style.setProperty('--main-color', '#3498db');
el.style.getPropertyValue('--main-color');
```

---

## 🔧 创建和插入元素

### 创建元素

```javascript
const div = document.createElement('div');
const text = document.createTextNode('Hello');
const fragment = document.createDocumentFragment();
```

### 插入元素

```javascript
const parent = document.getElementById('parent');
const child = document.createElement('div');

parent.appendChild(child);              // 末尾添加
parent.insertBefore(child, parent.firstChild);  // 指定位置前插入

// 新方法（推荐）
parent.append(child);                   // 末尾添加（支持多个）
parent.prepend(child);                  // 开头添加
parent.before(child);                   // 元素前添加
parent.after(child);                    // 元素后添加
```

### 删除元素

```javascript
const el = document.getElementById('box');

el.remove();                  // 删除自己
el.parentNode.removeChild(el); // 旧方法
```

### 克隆元素

```javascript
const el = document.getElementById('box');

const clone = el.cloneNode();        // 浅克隆（不包含子元素）
const deepClone = el.cloneNode(true); // 深克隆（包含子元素）
```

---

## 🔗 DOM 遍历

### 父子关系

```javascript
const el = document.getElementById('item');

el.parentNode;           // 父节点
el.parentElement;        // 父元素节点
el.childNodes;           // 所有子节点
el.children;             // 所有子元素
el.firstChild;           // 第一个子节点
el.firstElementChild;    // 第一个子元素
el.lastChild;            // 最后一个子节点
el.lastElementChild;     // 最后一个子元素
```

### 兄弟关系

```javascript
const el = document.getElementById('item');

el.nextSibling;           // 下一个兄弟节点
el.nextElementSibling;    // 下一个兄弟元素
el.previousSibling;       // 上一个兄弟节点
el.previousElementSibling; // 上一个兄弟元素
```

---

## 📊 属性操作

### 获取/设置属性

```javascript
const link = document.querySelector('a');

link.getAttribute('href');          // 获取属性
link.setAttribute('href', 'https://example.com');  // 设置属性
link.removeAttribute('target');     // 删除属性
link.hasAttribute('target');        // 检查属性
```

### data 属性

```javascript
const el = document.querySelector('[data-id]');

el.dataset.id;          // 获取 data-id
el.dataset.userName;    // 获取 data-user-name（自动转驼峰）
el.dataset.newAttr = 'value';  // 设置 data-new-attr
```

### 表单属性

```javascript
const input = document.querySelector('input');

input.value;            // 输入值
input.checked;          // 是否选中（checkbox/radio）
input.disabled;         // 是否禁用
input.readOnly;         // 是否只读
input.focus();          // 获取焦点
input.blur();           // 失去焦点
input.select();         // 选中内容
```

---

## 💻 实战示例：动态列表

```javascript
const TodoList = {
  items: [],
  
  render() {
    const ul = document.getElementById('todoList');
    ul.innerHTML = '';
    
    this.items.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="${item.done ? 'done' : ''}">${item.text}</span>
        <button onclick="TodoList.toggle(${index})">完成</button>
        <button onclick="TodoList.remove(${index})">删除</button>
      `;
      ul.appendChild(li);
    });
  },
  
  add(text) {
    this.items.push({ text, done: false });
    this.render();
  },
  
  toggle(index) {
    this.items[index].done = !this.items[index].done;
    this.render();
  },
  
  remove(index) {
    this.items.splice(index, 1);
    this.render();
  }
};
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 DOM 的概念
- [ ] 会使用各种方法获取元素
- [ ] 掌握元素内容的修改
- [ ] 会操作元素样式和类名
- [ ] 能够创建、插入、删除元素

---

## 📝 练习任务

### 任务 1：动态表格
创建一个表格，可以添加、删除、编辑行。

### 任务 2：标签页
实现一个标签页组件，点击切换内容。

### 任务 3：模态框
实现一个模态框，支持打开、关闭、点击遮罩关闭。

---

## 🔗 相关资源

- [MDN - DOM 简介](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model/Introduction)
- [MDN - Element](https://developer.mozilla.org/zh-CN/docs/Web/API/Element)
- [MDN - Document](https://developer.mozilla.org/zh-CN/docs/Web/API/Document)
