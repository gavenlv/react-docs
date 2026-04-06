# 01 - React 简介与环境搭建

## 🎯 本节目标
- 理解 React 是什么以及为什么使用它
- 了解 React 的核心概念和特点
- 完成开发环境搭建
- 创建第一个 React 应用

---

## 📖 什么是 React？

React 是一个由 Meta（原 Facebook）开发的 JavaScript 库，用于构建用户界面。

### 核心特点

#### 1. **声明式设计**
```javascript
// 命令式（传统 DOM 操作）
const button = document.createElement('button');
button.innerText = '点击我';
button.onclick = () => alert('Hello!');
document.body.appendChild(button);

// 声明式（React）
function Button() {
  return <button onClick={() => alert('Hello!')}>点击我</button>;
}
```

#### 2. **组件化**
将 UI 拆分为独立、可复用的组件：
```
App
├── Header
│   ├── Logo
│   └── Navigation
├── MainContent
│   ├── Sidebar
│   └── ArticleList
│       └── Article (×N)
└── Footer
```

#### 3. **虚拟 DOM**
- React 在内存中维护一个虚拟 DOM 树
- 状态变化时，计算最小差异并高效更新真实 DOM
- 提升性能，优化用户体验

#### 4. **单向数据流**
- 数据从父组件流向子组件
- 通过 props 传递数据
- 使数据流清晰可预测

### 适用场景

✅ **适合使用 React 的场景：**
- 单页应用（SPA）
- 需要复杂交互的 Web 应用
- 组件需要高度复用的项目
- 大型团队协作开发

❌ **可能不适合的场景：**
- 简单的静态页面
- SEO 要求极高的内容网站（需配合 SSR）
- 对包体积极其敏感的项目

---

## 🛠️ 开发环境搭建

### 方式一：Create React App（推荐初学者）

```bash
# 使用 npx 创建新项目
npx create-react-app my-react-app

# 进入项目目录
cd my-react-app

# 启动开发服务器
npm start
```

**项目结构：**
```
my-react-app/
├── node_modules/          # 依赖包
├── public/               # 静态资源
│   ├── index.html        # HTML 模板
│   └── favicon.ico       # 图标
├── src/                  # 源代码
│   ├── App.css          # 主组件样式
│   ├── App.js           # 主组件
│   ├── index.css        # 全局样式
│   └── index.js         # 入口文件
├── .gitignore           # Git 忽略配置
├── package.json         # 项目配置
└── README.md            # 项目说明
```

### 方式二：Vite（推荐，更快速）

```bash
# 使用 Vite 创建 React 项目
npm create vite@latest my-vite-app -- --template react

# 进入项目目录
cd my-vite-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**Vite 的优势：**
- ⚡ 极速的冷启动（秒级启动）
- 🔥 即时的模块热更新（HMR）
- 📦 真正的按需编译
- 🚀 优化的构建输出

### 方式三：Next.js（全栈框架）

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

**适合：**
- 需要 SSR/SSG 的项目
- 全栈应用开发
- 企业级项目

---

## 💻 第一个 React 应用

### Hello World 示例

打开 `src/App.js`：

```jsx
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello, React!</h1>
        <p>欢迎来到 React 世界</p>
      </header>
    </div>
  );
}

export default App;
```

### 修改后的效果
保存文件后，浏览器会自动刷新显示新的内容！

---

## 🔧 VS Code 推荐插件

1. **ES7+ React/Redux/React-Native snippets** - 代码片段
2. **Prettier** - 代码格式化
3. **ESLint** - 代码检查
4. **Auto Rename Tag** - 自动重命名标签
5. **Bracket Pair Colorizer** - 括号高亮

安装方式：
1. 打开 VS Code
2. 按 `Ctrl + Shift + X`
3. 搜索插件名称
4. 点击 Install

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 解释 React 是什么及其核心特点
- [ ] 使用 Create React App 或 Vite 创建项目
- [ ] 理解基本的项目结构
- [ ] 运行并修改一个简单的 React 应用
- [ ] 配置好 VS Code 开发环境

---

## 📝 练习任务

### 任务 1：创建个人介绍页面
要求：
- 显示你的姓名、职业、爱好
- 使用多个组件拆分 UI
- 添加基本的 CSS 样式

### 任务 2：探索项目结构
- 查看 package.json 了解依赖
- 尝试修改不同文件观察变化
- 阅读官方文档的"Hello World"部分

---

## 🔗 下一步

准备好进入下一节了吗？接下来我们将学习 **JSX 基础语法**！

[→ 02 - JSX 基础](../02-jsx-basics/)
