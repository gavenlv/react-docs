# 01 - JavaScript 简介与环境搭建

## 🎯 本节目标
- 理解 JavaScript 是什么以及为什么学习它
- 了解 JavaScript 的作用和发展历史
- 掌握 JavaScript 的三种引入方式
- 学会使用浏览器开发者工具调试 JavaScript

---

## 📖 什么是 JavaScript？

### 一句话解释

JavaScript（简称 JS）是一种轻量级的、解释型的、即时编译的编程语言。如果说 HTML 是网页的"骨架"，CSS 是网页的"皮肤"，那么 JavaScript 就是网页的"大脑"。

### 生活类比

想象你在装修房子：

| 装修房子 | 网页开发 |
|---------|---------|
| 房子结构（墙、门、窗） | HTML（网页结构） |
| 墙面颜色、地板材质 | CSS（网页样式） |
| 灯光开关、门锁、智能家居 | JavaScript（网页交互） |

> 💡 **关键理解**：JavaScript 让网页"动起来"，可以响应用户的操作、处理数据、与服务器通信等。

### JavaScript 的作用

```html
<!-- 没有 JavaScript 的网页 -->
<button>点击我</button>
<!-- 点击按钮没有任何反应 -->
```

```html
<!-- 加上 JavaScript 的网页 -->
<button id="myBtn">点击我</button>
<script>
  document.getElementById('myBtn').addEventListener('click', function() {
    alert('你点击了按钮！');
  });
</script>
<!-- 点击按钮会弹出提示框 -->
```

### JavaScript 能做什么？

| 领域 | 应用场景 |
|------|----------|
| **网页交互** | 表单验证、动画效果、用户操作响应 |
| **前端框架** | React、Vue、Angular 构建复杂应用 |
| **后端开发** | Node.js 构建服务器端应用 |
| **移动开发** | React Native、Ionic 开发跨平台 App |
| **桌面应用** | Electron 开发桌面软件 |
| **游戏开发** | Phaser、Three.js 开发网页游戏 |
| **数据可视化** | D3.js、ECharts 创建图表 |

---

## 🤔 为什么学习 JavaScript？

### 1. 无处不在

JavaScript 是唯一一种在所有浏览器中运行的编程语言。

```text
浏览器市场份额（2024）：
Chrome    ████████████████████ 65%
Safari    ████ 18%
Edge      ███ 5%
Firefox   ██ 3%
其他      ██ 9%
```

### 2. 生态系统丰富

- **npm**：世界上最大的软件包注册表，超过 200 万个包
- **框架**：React、Vue、Angular、Svelte 等
- **工具**：Webpack、Vite、ESLint、Prettier 等

### 3. 就业前景好

| 职位 | JavaScript 必要性 |
|------|------------------|
| 前端开发工程师 | ⭐⭐⭐⭐⭐ 必须精通 |
| 全栈开发工程师 | ⭐⭐⭐⭐⭐ 必须精通 |
| Node.js 后端工程师 | ⭐⭐⭐⭐⭐ 必须精通 |
| 移动开发工程师 | ⭐⭐⭐⭐ 重要技能 |
| 产品经理 | ⭐⭐ 了解即可 |

---

## 📝 JavaScript 的三种引入方式

### 1. 行内脚本（Inline Script）

直接在 HTML 标签的事件属性中写 JavaScript。

```html
<button onclick="alert('你点击了按钮！')">点击我</button>
```

**优点：**
- 简单直接，适合快速测试

**缺点：**
- ❌ 代码和 HTML 混在一起
- ❌ 无法复用
- ❌ 难以维护
- ❌ 不推荐在实际项目中使用

**适用场景：** 
- 临时测试
- 简单的学习示例

---

### 2. 内部脚本（Internal Script）

在 HTML 文件的 `<script>` 标签中写 JavaScript。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>内部脚本示例</title>
  <script>
    function sayHello() {
      alert('你好，世界！');
    }
  </script>
</head>
<body>
  <button onclick="sayHello()">点击问好</button>
</body>
</html>
```

**优点：**
- ✅ JavaScript 集中在 `<script>` 中，比行内脚本更清晰
- ✅ 不需要额外的 JS 文件
- ✅ 适合单页面应用

**缺点：**
- ❌ 无法在多个页面间复用
- ❌ HTML 文件会变大

**适用场景：**
- 单页面网站
- 简单的学习示例
- 组件库的示例页面

---

### 3. 外部脚本（External Script）⭐ 推荐

将 JavaScript 写在单独的 `.js` 文件中，然后在 HTML 中引入。

**文件结构：**
```
my-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── utils/
│       └── helpers.js
└── images/
```

**index.html：**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>外部脚本示例</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <h1>欢迎</h1>
  <button id="myBtn">点击我</button>
  
  <!-- 引入 JavaScript 文件 -->
  <script src="js/main.js"></script>
</body>
</html>
```

**js/main.js：**
```javascript
document.getElementById('myBtn').addEventListener('click', function() {
  alert('你点击了按钮！');
});
```

**优点：**
- ✅ 内容与行为完全分离
- ✅ 可以在多个页面间复用
- ✅ 浏览器会缓存 JS 文件，加快加载速度
- ✅ 易于维护和团队协作
- ✅ 可以使用模块化开发

**缺点：**
- 需要额外的 HTTP 请求（但可以合并和压缩）

**适用场景：**
- ✅ **几乎所有项目**（推荐）

---

## 🔍 浏览器开发者工具

### 打开开发者工具

| 浏览器 | 快捷键 |
|--------|--------|
| Chrome / Edge | `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) |
| Firefox | `F12` 或 `Ctrl+Shift+I` (Mac: `Cmd+Option+I`) |
| Safari | `Cmd+Option+I`（需先在设置中启用） |

### Console 面板功能

1. **执行 JavaScript 代码**
   ```javascript
   // 直接在 Console 中输入代码并按回车执行
   console.log('Hello, World!');
   
   // 进行数学计算
   1 + 2 + 3  // 输出: 6
   
   // 操作 DOM
   document.body.style.backgroundColor = 'lightblue';
   ```

2. **查看输出信息**
   ```javascript
   console.log('普通日志');
   console.warn('警告信息');
   console.error('错误信息');
   console.info('提示信息');
   console.table([{name: '张三', age: 25}, {name: '李四', age: 30}]);
   ```

3. **调试代码**
   ```javascript
   // 使用 debugger 关键字设置断点
   function calculateSum(a, b) {
     debugger;  // 代码会在这里暂停
     return a + b;
   }
   ```

### Sources 面板功能

- 查看和编辑源代码
- 设置断点
- 单步执行代码
- 查看变量值
- 监视表达式

### 实用技巧

```javascript
// 1. 快速选择元素
// 在 Elements 面板选中元素后，可以在 Console 中用 $0 引用它
$0.style.color = 'red';

// 2. 清空控制台
// 点击 🚫 图标或使用 Ctrl+L (Mac: Cmd+K)
console.clear();

// 3. 查看对象结构
const user = { name: '张三', age: 25, skills: ['HTML', 'CSS', 'JS'] };
console.dir(user);

// 4. 计时
console.time('循环耗时');
for (let i = 0; i < 1000000; i++) {}
console.timeEnd('循环耗时');  // 输出: 循环耗时: 2.5ms
```

---

## 💻 第一个 JavaScript 项目

让我们创建一个简单的计数器应用：

**HTML (index.html)：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>计数器</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>计数器</h1>
    <div class="counter">
      <button id="decreaseBtn" class="btn">-</button>
      <span id="count" class="count">0</span>
      <button id="increaseBtn" class="btn">+</button>
    </div>
    <button id="resetBtn" class="reset-btn">重置</button>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

**CSS (style.css)：**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:hover {
  background: #764ba2;
  transform: scale(1.1);
}

.count {
  font-size: 48px;
  font-weight: bold;
  color: #2c3e50;
  min-width: 100px;
}

.reset-btn {
  padding: 10px 30px;
  border: none;
  border-radius: 25px;
  background: #e74c3c;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.reset-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}
```

**JavaScript (script.js)：**
```javascript
let count = 0;

const countElement = document.getElementById('count');
const increaseBtn = document.getElementById('increaseBtn');
const decreaseBtn = document.getElementById('decreaseBtn');
const resetBtn = document.getElementById('resetBtn');

function updateDisplay() {
  countElement.textContent = count;
  
  if (count > 0) {
    countElement.style.color = '#27ae60';
  } else if (count < 0) {
    countElement.style.color = '#e74c3c';
  } else {
    countElement.style.color = '#2c3e50';
  }
}

increaseBtn.addEventListener('click', function() {
  count++;
  updateDisplay();
});

decreaseBtn.addEventListener('click', function() {
  count--;
  updateDisplay();
});

resetBtn.addEventListener('click', function() {
  count = 0;
  updateDisplay();
});
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 理解 JavaScript 的作用和重要性
- [ ] 掌握三种 JavaScript 引入方式及其适用场景
- [ ] 会使用外部脚本组织项目
- [ ] 会使用浏览器开发者工具调试 JavaScript
- [ ] 能够创建简单的 JavaScript 项目

---

## 📝 练习任务

### 任务 1：创建问候页面
创建一个页面，包含一个输入框和一个按钮，点击按钮后显示"你好，[输入的名字]！"

### 任务 2：调试练习
打开任意网站，使用开发者工具：
- 在 Console 中执行 `console.log('Hello')`
- 修改页面上的文字内容
- 改变页面的背景颜色
- 使用 `console.table()` 显示一个数组

---

## 🔗 相关资源

- [MDN JavaScript 教程](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [JavaScript.info](https://javascript.info/)
- [ECMAScript 规范](https://tc39.es/ecma262/)
