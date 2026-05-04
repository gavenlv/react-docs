# 01 - React 简介与环境搭建

## 🎯 本节目标
- 理解 React 是什么以及为什么使用它
- 了解 React 的核心概念和特点
- 完成开发环境搭建
- 创建第一个 React 应用

---

## 📖 什么是 React？

### 一句话解释

React 是一个由 Meta（原 Facebook）开发的 **JavaScript 库**，用来**构建网页上的用户界面（UI）**。你可以把它理解为一个"网页组装工具"——它帮你把复杂的网页拆成一个个小组件，然后像搭积木一样把它们拼在一起。

### 生活类比

想象你在搭乐高城堡：

| 乐高城堡 | React 应用 |
|---------|-----------|
| 城堡整体 | 一个完整的网页应用 |
| 每块积木 | 一个 React 组件（如按钮、卡片、导航栏） |
| 积木说明书 | 你的代码（告诉 React 怎么组装） |
| 换一块积木 | 数据变化时，React 自动更新对应的 UI |
| 积木可以重复使用 | 组件可以复用在不同的页面中 |

> 💡 **关键理解**：React 不是一种编程语言，而是一个工具库。它运行在 JavaScript 之上，让你能更高效地写出漂亮的网页界面。

### 前置知识：你需要了解什么？

在学习 React 之前，你需要具备以下基础知识：

1. **HTML** — 网页的骨架，用来定义页面结构（标题、段落、图片等）
2. **CSS** — 网页的化妆师，用来让页面变好看（颜色、字体、布局等）
3. **JavaScript（JS）** — 网页的大脑，用来让页面动起来（响应用户操作、处理数据等）

> ⚠️ **如果你还没掌握这三种技术**，建议先花 1-2 周学习 HTML、CSS 和 JavaScript 的基础知识。推荐在 [MDN Web Docs](https://developer.mozilla.org/zh-CN/) 上学习。

### React 的历史（了解即可）

- **2011 年**：Facebook 内部开始使用 React 开发 News Feed
- **2013 年 5 月**：React 正式开源，向全世界发布
- **2015 年**：React Native 发布（用 React 写手机 App）
- **2019 年**：React Hooks 发布（革命性的新写法）
- **2022 年**：React 18 发布（支持并发模式）
- **至今**：React 已成为全球最流行的前端框架之一

---

## 🤔 为什么需要 React？

### 不用 React 的世界（传统网页开发）

在没有 React 的时代，开发者需要**手动操作网页元素**（DOM 操作）。这就像你有一份白纸，每次想修改内容，都需要用橡皮擦掉旧内容，再重新写上新内容。

```javascript
// 传统方式：命令式编程 —— 你要告诉浏览器"怎么做"
// 第1步：找到页面上的标题元素
const titleElement = document.getElementById('title');

// 第2步：修改它的文字内容
titleElement.textContent = '新的标题';

// 第3步：修改它的样式
titleElement.style.color = 'red';
titleElement.style.fontSize = '24px';

// 第4步：给它添加一个点击事件
titleElement.addEventListener('click', function() {
  alert('标题被点击了！');
});
```

**传统方式的问题：**
- 代码冗长，做一件简单的事要写很多行代码
- 当网页很复杂时，代码会变得一团糟，难以维护
- 手动操作 DOM 容易出现 bug（比如忘记更新某个地方）
- 不同浏览器的行为不一致，需要处理兼容性问题

### 用 React 的世界

React 把上面的步骤简化了——你只需要描述"**要显示什么**"，React 会自动帮你处理"**怎么更新**"。

```jsx
// React 方式：声明式编程 —— 你只需要描述"要什么"
function MyPage() {
  const [title, setTitle] = useState('Hello React!');  // 定义数据
  const [color, setColor] = useState('red');           // 定义样式

  return (
    // 直接用类似 HTML 的语法描述 UI
    <h1
      style={{ color: color, fontSize: '24px' }}
      onClick={() => alert('标题被点击了！')}
    >
      {title}
    </h1>
  );
}
```

> 💡 **类比理解**：传统方式像自己动手做饭（买菜、洗菜、切菜、炒菜）；React 方式像去餐厅点菜（你只管说"我要番茄炒蛋"，厨师帮你搞定一切）。

### React 解决的核心问题

| 问题 | React 的解决方案 |
|------|----------------|
| 手动操作 DOM 太麻烦 | 虚拟 DOM 自动帮你高效更新 |
| 代码混乱难维护 | 组件化让代码结构清晰 |
| 数据和 UI 不同步 | 单向数据流让变化可预测 |
| 代码不好复用 | 组件可以像积木一样反复使用 |
| 大型应用难以管理 | React 生态（Router、Redux 等）提供完整方案 |

---

## 🔬 React 的核心特点

### 1. 声明式设计（Declarative）

**类比**：就像你告诉出租车司机"我要去火车站"，而不是一步步告诉他"往前开100米，左转，再开200米..."。

```javascript
// 命令式（传统 DOM 操作）—— 告诉浏览器"怎么做"
const button = document.createElement('button');     // 创建按钮
button.innerText = '点击我';                          // 设置文字
button.onclick = () => alert('Hello!');              // 绑定事件
document.body.appendChild(button);                   // 添加到页面

// 声明式（React）—— 告诉 React"我要什么"
function Button() {
  return <button onClick={() => alert('Hello!')}>点击我</button>;
  // React 会自动帮你创建、设置、添加到页面
}
```

**为什么声明式更好？**
- 代码更容易理解和维护
- 出了 bug 更容易找到原因
- 数据变化时 UI 自动更新，不需要你手动操作

### 2. 组件化（Component-Based）

**类比**：就像你用乐高积木搭城堡，每个积木都是一个"组件"。

```
一个典型的网页应用结构：
App（整个应用）
├── Header（顶部导航栏）
│   ├── Logo（网站 Logo）
│   └── Navigation（导航菜单）
│       └── NavItem（每个菜单项 ×N）
├── MainContent（主要内容区域）
│   ├── Sidebar（侧边栏）
│   │   └── FilterPanel（筛选面板）
│   └── ArticleList（文章列表）
│       └── Article（每篇文章 ×N）
│           ├── ArticleTitle（文章标题）
│           ├── ArticleContent（文章内容）
│           └── CommentList（评论区）
│               └── Comment（每条评论 ×N）
└── Footer（底部信息栏）
```

**组件化的好处：**
- 🔁 **可复用**：同一个按钮组件可以在 100 个地方使用
- 🔧 **易维护**：修一个按钮的样式，所有用到它的地方都自动更新
- 🧪 **易测试**：单独测试每个组件，不依赖其他部分
- 👥 **易协作**：不同人负责不同的组件，互不影响

### 3. 虚拟 DOM（Virtual DOM）

**类比**：想象你在画一幅画。

- **没有虚拟 DOM**：每次修改，你都要把整幅画擦掉重画（非常慢）
- **有虚拟 DOM**：你在脑中先想好要改哪里，然后只改那个地方（很快）

**工作原理（简化版）：**

```
第1步：React 在内存中创建一个"虚拟 DOM"（网页的副本）
       ┌─────────────────────────┐
       │    虚拟 DOM（内存中）     │
       │  <div>                   │
       │    <h1>Hello</h1>        │  ← 这就是虚拟 DOM
       │    <p>World</p>          │
       │  </div>                  │
       └─────────────────────────┘

第2步：数据变化时，React 创建一个新的虚拟 DOM
       ┌─────────────────────────┐
       │  新的虚拟 DOM（内存中）   │
       │  <div>                   │
       │    <h1>Hello React!</h1> │  ← 只有 h1 变了
       │    <p>World</p>          │
       │  </div>                  │
       └─────────────────────────┘

第3步：React 对比两个虚拟 DOM，找出差异
       差异：h1 的内容从 "Hello" → "Hello React!"

第4步：只把变化的部分更新到真实网页上
       真实 DOM：只更新 h1 标签，其他不动
```

> 💡 **性能优势**：传统方式修改 DOM 就像"搬一次家把所有家具都换新"，而虚拟 DOM 像是"只换坏掉的那把椅子"——效率差很多。

### 4. 单向数据流（Unidirectional Data Flow）

**类比**：数据像水流一样，只能从上游（父组件）流到下游（子组件），不能倒流。

```
数据流向示意图：

App（数据源：用户列表）
  │
  ├──→ UserList（接收用户列表）
  │       │
  │       ├──→ UserCard（接收单个用户）
  │       └──→ UserCard（接收单个用户）
  │
  └──→ Sidebar（接收统计信息）

子组件不能直接修改父组件的数据！
如果需要修改，要通过"回调函数"通知父组件。
```

**为什么不允许子组件直接修改父组件的数据？**
- 让数据的变化路径清晰可追踪
- 出了 bug 时，容易找到是哪里改了数据
- 避免多个组件同时修改同一个数据导致的混乱

---

## 🏗️ React 的生态系统

React 本身只是一个 UI 库，但它有一个庞大的生态系统：

| 工具 | 作用 | 生活类比 |
|------|------|---------|
| **React** | 核心 UI 库 | 乐高积木本身 |
| **React Router** | 页面导航/路由 | 城堡的走廊（连接不同房间） |
| **Redux / Zustand** | 全局状态管理 | 城堡的仓库（存放共享物资） |
| **React Query** | 数据请求管理 | 城堡的信使（去外面取东西） |
| **Next.js** | 全栈框架 | 一整套城堡建造工具包 |
| **Vite** | 构建工具 | 乐高积木的分拣机 |
| **TypeScript** | 类型系统 | 乐高积木的说明书（防止拼错） |

> 💡 **初学者建议**：刚开始只需要学 React 本身，其他工具以后按需学习。不要被庞大的生态吓到！

---

## ⚖️ React 适合什么场景？

### ✅ 非常适合用 React 的场景

| 场景 | 为什么适合 | 实际案例 |
|------|-----------|---------|
| **单页应用（SPA）** | 页面切换流畅，无需重新加载 | Gmail、Trello、Notion |
| **复杂交互的 Web 应用** | 组件化让复杂 UI 易于管理 | 在线编辑器、数据仪表盘 |
| **需要高度复用组件的项目** | 组件可以在多个项目间共享 | 设计系统（Ant Design、Material UI） |
| **大型团队协作开发** | 组件化 + 模块化利于分工 | 企业级管理后台 |
| **移动端应用** | React Native 可以用同一套技术写 App | Facebook、Instagram、Discord |

### ❌ 可能不适合 React 的场景

| 场景 | 原因 | 更好的选择 |
|------|------|-----------|
| **简单的静态展示页面** | 用 React 反而增加了复杂度 | 纯 HTML + CSS |
| **SEO 要求极高的网站** | React 默认不生成 HTML（搜索引擎可能抓不到） | Next.js（SSR）或静态网站生成器 |
| **对包体积极度敏感** | React 本身有约 40KB | Preact（React 的轻量替代，只有 3KB） |
| **内容为主的博客/文档站** | 不需要复杂的交互 | Hugo、Jekyll、WordPress |

---

## 🛠️ 开发环境搭建

> 💡 **前提条件**：确保你已经安装了 **Node.js**（JavaScript 运行环境）。
> 去官网下载：[https://nodejs.org](https://nodejs.org) ，选择 LTS（长期支持）版本安装。
> 安装完成后，打开终端（Windows 按 `Win+R` 输入 `cmd`），输入 `node -v` 检查是否安装成功。

### 方式一：Create React App（推荐初学者，但已不推荐新项目使用）

> ⚠️ **注意**：Create React App (CRA) 已经停止维护，官方推荐使用 Vite（方式二）。这里保留是为了帮助你理解，如果你在网上看到 CRA 相关的教程，知道它是什么。

```bash
# 使用 npx 创建新项目（npx 是 Node.js 自带的工具，用来运行 npm 包）
npx create-react-app my-react-app

# 进入项目目录
cd my-react-app

# 启动开发服务器（会自动打开浏览器）
npm start
```

**项目结构解释：**

```
my-react-app/
├── node_modules/          # 第三方依赖包（不用管，自动生成）
│   └── 几千个文件夹...      # npm 自动下载的库文件
│
├── public/                # 公共静态资源（直接复制到最终网站）
│   ├── index.html         # HTML 模板（页面的"骨架"）
│   ├── favicon.ico        # 浏览器标签上的小图标
│   └── manifest.json      # PWA 配置（让网页像手机 App 一样）
│
├── src/                   # 源代码（你主要在这里写代码！）
│   ├── App.css            # App 组件的样式文件
│   ├── App.js             # 主组件（应用的"入口"）
│   ├── App.test.js        # App 的测试文件
│   ├── index.css          # 全局样式
│   ├── index.js           # JavaScript 入口文件
│   ├── logo.svg           # Logo 图片
│   └── reportWebVitals.js # 性能监控
│
├── .gitignore             # Git 忽略配置（告诉 Git 哪些文件不需要提交）
├── package.json           # 项目配置文件（依赖列表、脚本命令等）
├── package-lock.json      # 依赖版本锁定文件
└── README.md              # 项目说明文件
```

**`package.json` 是什么？**

```json
{
  "name": "my-react-app",         // 项目名称
  "version": "0.1.0",             // 项目版本号
  "dependencies": {               // 运行时依赖（项目必须的库）
    "react": "^18.2.0",           // React 核心库
    "react-dom": "^18.2.0",       // React DOM 渲染库
    "react-scripts": "5.0.1"      // CRA 的构建脚本
  },
  "scripts": {                    // 可用的命令
    "start": "react-scripts start",   // 启动开发服务器
    "build": "react-scripts build",   // 打包生成最终文件
    "test": "react-scripts test"      // 运行测试
  }
}
```

### 方式二：Vite（推荐！）

> ⭐ **官方推荐**：Vite 是目前最流行的 React 项目构建工具，速度快、配置简单。

```bash
# 第1步：使用 Vite 创建 React 项目
# npm create 是 npm 的命令，vite 是工具名
# my-vite-app 是你的项目名（可以自定义）
# --template react 指定使用 React 模板
npm create vite@latest my-vite-app -- --template react

# 第2步：进入项目目录
cd my-vite-app

# 第3步：安装依赖（下载需要的第三方库）
npm install

# 第4步：启动开发服务器
npm run dev
```

**Vite 的优势：**

| 特性 | Create React App | Vite |
|------|-----------------|------|
| 启动速度 | 30秒-2分钟 | **不到1秒** |
| 热更新（保存后刷新） | 1-3秒 | **毫秒级** |
| 构建速度 | 较慢 | **快 10-100 倍** |
| 配置难度 | 较复杂 | **简单** |
| 是否还在维护 | ❌ 已停止 | ✅ 活跃开发中 |

**Vite 项目结构：**

```
my-vite-app/
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── App.css          # App 样式
│   ├── App.jsx          # 主组件（注意是 .jsx 扩展名！）
│   ├── index.css        # 全局样式
│   └── main.jsx         # 入口文件
├── index.html           # HTML 模板（放在根目录，不在 public 里）
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置文件
```

### 方式三：Next.js（全栈框架）

适合需要 SEO、服务端渲染（SSR）或全栈开发的项目：

```bash
npx create-next-app@latest my-next-app
cd my-next-app
npm run dev
```

**适合什么场景？**
- 需要 SEO（搜索引擎优化）的网站（如博客、电商）
- 需要 SSR（服务端渲染）提升首屏加载速度
- 需要写 API 接口的全栈应用
- 企业级大型项目

> 💡 **初学者建议**：先用 Vite 学好 React 基础，等熟练后再学 Next.js。

### 方式四：在线体验（零安装，推荐零基础新手）

如果不想折腾环境搭建，可以直接在浏览器中体验 React：

| 在线工具 | 网址 | 特点 |
|---------|------|------|
| **CodeSandbox** | [codesandbox.io](https://codesandbox.io/) | 功能最全，类似真实开发环境 |
| **StackBlitz** | [stackblitz.com](https://stackblitz.com/) | 启动极快，使用 WebAssembly |
| **React 官方 Playground** | [react.dev/learn](https://react.dev/learn) | 官方教程自带编辑器 |

---

## 💻 第一个 React 应用

### Hello World 示例

打开 `src/App.jsx`（Vite 项目）或 `src/App.js`（CRA 项目），替换为以下代码：

```jsx
// 导入 React（Vite 项目中通常不需要这行，但写上也不会出错）
import React from 'react';

// 定义一个名为 App 的函数组件
// 这个函数返回的就是页面上要显示的内容
function App() {
  // 在 JSX 中，我们用类似 HTML 的语法来描述 UI
  return (
    <div className="App">
      {/* className 用来设置 CSS 类名（HTML 中用 class） */}
      <header className="App-header">
        {/* 这里是 JavaScript 表达式，用花括号 {} 包裹 */}
        <h1>Hello, React!</h1>
        <p>欢迎来到 React 世界</p>

        {/* 这是一个按钮，点击后会弹出一个提示框 */}
        <button onClick={() => {
          alert('你点击了按钮！');
        }}>
          点我试试
        </button>
      </header>
    </div>
  );
}

// 导出 App 组件，让其他文件可以使用它
export default App;
```

### 理解这段代码

让我逐行解释每一行在做什么：

```
function App() {          ← 定义一个函数，名字叫 App
  return (                ← 返回一些内容（这就是页面要显示的东西）
    <div className="App"> ← 创建一个 div 容器，CSS 类名是 "App"
      <header>            ← 创建一个 header 元素
        <h1>Hello!</h1>   ← 创建一个一级标题，内容是 "Hello!"
      </header>           ← 关闭 header
    </div>                ← 关闭 div
  );                      ← 结束 return 语句
}                         ← 结束函数

export default App;       ← 把 App 导出，让其他文件可以使用
```

### 修改代码看效果

试着修改上面的代码，观察浏览器中的变化：

```jsx
function App() {
  // 1. 试试修改变量
  const name = '小明';  // 改成你的名字
  const today = new Date().toLocaleDateString();  // 获取今天的日期

  // 2. 试试添加 CSS 样式
  const cardStyle = {
    border: '2px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    maxWidth: '400px',
    margin: '50px auto',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  return (
    <div style={cardStyle}>
      <h1>你好，{name}！👋</h1>
      <p>今天是 {today}</p>
      <p>你正在学习 React，太棒了！🎉</p>
    </div>
  );
}

export default App;
```

> 💡 **热更新（HMR）**：保存文件后，浏览器会**自动刷新**显示新的内容，你不需要手动刷新页面！这是开发工具提供的一个非常方便的功能。

---

## 🔧 开发工具配置

### VS Code（推荐编辑器）

[下载 VS Code](https://code.visualstudio.com/) —— 免费且最流行的代码编辑器。

**必装插件：**

| 插件名称 | 作用 | 为什么需要 |
|---------|------|-----------|
| **ES7+ React/Redux/React-Native snippets** | 代码片段快捷输入 | 输入 `rfc` 按回车就能自动生成组件模板 |
| **Prettier** | 代码自动格式化 | 让代码排版整齐美观 |
| **ESLint** | 代码错误检查 | 写错代码时会立刻提示 |
| **Auto Rename Tag** | 自动重命名标签 | 修改 HTML 开始标签时，结束标签自动跟着变 |
| **Bracket Pair Colorizer** | 括号彩色高亮 | 方便匹配对应的括号（VS Code 已内置） |

**安装方式：**
1. 打开 VS Code
2. 按 `Ctrl + Shift + X`（Mac 按 `Cmd + Shift + X`）
3. 搜索插件名称
4. 点击 **Install**

**VS Code 推荐设置：**

按 `Ctrl + ,` 打开设置，搜索 `format on save`，勾选保存时自动格式化。

### React DevTools（浏览器调试工具）

React DevTools 是一个浏览器扩展，可以让你**查看和调试 React 组件**。

1. Chrome 浏览器：去 [Chrome Web Store](https://chrome.google.com/webstore) 搜索 "React Developer Tools"
2. Firefox 浏览器：去 [Firefox Add-ons](https://addons.mozilla.org) 搜索 "React Developer Tools"
3. 安装后，按 `F12` 打开开发者工具，会多出两个标签页：
   - **Components**：查看组件树、props、state
   - **Profiler**：分析组件渲染性能

---

## ❓ 常见问题（FAQ）

### Q1：React 和 Vue/Angular 有什么区别？

| 特性 | React | Vue | Angular |
|------|-------|-----|---------|
| 开发者 | Meta | 尤雨溪（个人） | Google |
| 学习难度 | 中等 | 较低 | 较高 |
| 语法 | JSX（HTML in JS） | 模板语法（JS in HTML） | TypeScript + 模板 |
| 状态管理 | 需要第三方库 | 内置 Vuex/Pinia | 内置 RxJS |
| 适合人群 | 大型团队/复杂应用 | 初学者/中小项目 | 企业级/Java 背景开发者 |

> 💡 **建议**：对于初学者，选 React 或 Vue 都可以，学会一个后学另一个很容易。本教程选择 React 是因为它在全球范围内使用更广泛。

### Q2：我需要数学很好才能学前端吗？

不需要！前端开发主要需要的是**逻辑思维**和**耐心**。只要你能理解"如果...那么..."这样的条件判断，就能学前端。

### Q3：学完 React 能找到工作吗？

React 是目前前端开发岗位的**核心技能**之一。根据统计，超过 60% 的前端招聘要求会 React。但找工作还需要：HTML/CSS 基础、JavaScript 深入、计算机网络基础、项目经验等。

### Q4：开发环境搭建遇到问题怎么办？

常见问题及解决方案：

```bash
# 问题1：npm 不是内部命令
# 解决：确保 Node.js 安装成功，并重启终端

# 问题2：端口 3000 被占用
# 解决：Vite 会自动使用 3001、3002...等端口
# 或者手动指定端口：npm run dev -- --port 3001

# 问题3：npm install 很慢
# 解决：使用国内镜像源
npm config set registry https://registry.npmmirror.com

# 问题4：创建项目时报错
# 解决：尝试清除 npm 缓存
npm cache clean --force
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 用自己的话解释 React 是什么（能说给别人听）
- [ ] 说出 React 的 4 个核心特点（声明式、组件化、虚拟 DOM、单向数据流）
- [ ] 使用 Vite 创建一个新的 React 项目
- [ ] 理解项目的基本目录结构（知道 src/ 和 public/ 分别放什么）
- [ ] 运行并修改一个简单的 React 应用，看到效果
- [ ] 配置好 VS Code 开发环境（安装插件）
- [ ] 安装 React DevTools 浏览器扩展

---

## 📝 练习任务

### 练习 1：创建个人介绍页面 🌟

**难度**：⭐

要求：
- 显示你的姓名、职业/学校、爱好
- 使用不同的 HTML 元素（h1, h2, p, ul, li 等）
- 添加基本的 CSS 样式（内联样式即可）
- 添加一个按钮，点击后显示一段新的文字

**提示：**
```jsx
function MyIntro() {
  const [showMore, setShowMore] = useState(false);

  return (
    <div>
      <h1>我是小明</h1>
      <p>一个热爱编程的学生</p>
      <button onClick={() => setShowMore(!showMore)}>
        {showMore ? '收起' : '了解更多'}
      </button>
      {showMore && <p>我正在学习 React！</p>}
    </div>
  );
}
```

### 练习 2：探索项目结构 🌟🌟

**难度**：⭐⭐

1. 打开 `package.json`，找到 `dependencies` 字段，看看你的项目依赖了哪些库
2. 尝试修改 `index.html` 中的 `<title>` 标签，看浏览器标签页标题是否变化
3. 尝试删除 `src/App.jsx` 中的一些代码，看浏览器中会出现什么效果
4. 在 `src/` 目录下创建一个新文件 `Test.jsx`，写一个简单的组件

### 练习 3：对比传统 DOM 和 React（思考题）🌟

**难度**：⭐

思考以下问题，不用写代码：

1. 如果要在页面上添加 100 个按钮，传统方式需要写多少行代码？React 方式呢？
2. 如果要修改所有按钮的文字，传统方式怎么改？React 方式怎么改？
3. 哪种方式更容易维护？为什么？

---

## 🛠️ 开发者必备工具箱

> 💡 **工欲善其事，必先利其器。** 本节为你整理了 React 开发中最实用、最必备的工具和配置，帮你从新手快速成长为高效的开发者。

---

### 1. 🔍 React Developer Tools 安装与使用

React Developer Tools（简称 React DevTools）是 React 官方提供的浏览器调试工具，可以让你像"透视"一样查看组件的结构和状态。

#### 安装步骤

**Chrome / Edge（基于 Chromium 的浏览器）：**

1. 打开 Chrome Web Store：https://chrome.google.com/webstore
2. 搜索 **"React Developer Tools"**
3. 点击 **"添加到 Chrome"** 按钮
4. 安装完成后，浏览器右上角会出现一个 React 图标 🧪
5. 图标显示蓝色 = 当前页面使用了 React；灰色 = 没有检测到 React

**Firefox：**

1. 打开 Firefox Add-ons：https://addons.mozilla.org
2. 搜索 **"React Developer Tools"**
3. 点击 **"添加到 Firefox"**

> ⚠️ **注意**：安装后需要**刷新页面**才能看到 DevTools 面板。

#### 核心功能面板

安装成功后，按 `F12` 打开浏览器开发者工具，你会看到多出两个标签页：

```
浏览器 DevTools 标签栏：
┌─────────┬──────────┬──────────┬────────┬──────────┬──────────┐
│ Elements│ Console  │  ...     │ ⭐ Components │ ⭐ Profiler  │
└─────────┴──────────┴──────────┴────────┴──────────┴──────────┘
                                       ↑ React 特有标签页 ↑
```

#### Components 面板详解

Components 面板是 React DevTools 中**最常用**的功能，用来查看组件树、Props、State 等。

**查看组件树：**

```
📸 Components 面板截图示意：
┌──────────────────────────────────────────┐
│ 🔍 Search components...                   │
├──────────────────────────────────────────┤
│ ▼ <App>                                  │
│   ▼ <Router>                             │
│     ▼ <Header>                           │
│       │ <Logo />                         │
│       │ <NavMenu items={[...]}>          │  ← 点击组件可展开详情
│       ▼ <MainContent>                    │
│         │ <Sidebar />                    │
│         ▼ <UserList>                     │
│           │ <UserCard key="1" />         │  ← 选中高亮
│           │ <UserCard key="2" />         │
│           │ <UserCard key="3" />         │
├──────────────────────────────────────────┤
│ 📋 右侧面板（选中组件的详情）：            │
│   hooks:                                 │
│     useState: "张三"                     │
│     useState: false                      │
│   props:                                 │
│     name: "张三"                         │
│     age: 25                              │
└──────────────────────────────────────────┘
```

**核心操作：**

| 操作 | 方法 | 说明 |
|------|------|------|
| 查看组件树 | 左侧面板 | 展示整个应用的组件层级 |
| 查看 Props | 选中组件 → 右侧面板 | 显示组件接收的所有属性 |
| 查看 State | 选中组件 → 右侧面板 hooks | 显示 useState 等 Hook 的值 |
| 查看 Hooks | 选中组件 → 右侧面板 | useState、useEffect、useContext 等 |
| 直接修改 Props | 点击右侧值 → 编辑 | 方便调试不同数据 |
| 高亮组件 | 鼠标悬停在组件上 | 页面对应区域会显示蓝色高亮边框 |

#### 定位"哪个组件在重新渲染" 🔧

这是性能调优中最常用的技巧之一：

**方法一：开启高亮更新**

1. 打开 React DevTools → 点击右上角 **⚙️ 设置图标**
2. 勾选 **"Highlight updates when components render"**
3. 每次组件重新渲染时，页面上会出现彩色方块
   - 🟡 黄色 = 低频渲染（正常）
   - 🔵 蓝色 = 中频渲染
   - 🟢 绿色 = 高频渲染（需要关注！可能是性能问题）

```
📸 渲染高亮效果示意：
┌────────────────────┐
│  [<UserCard>]      │  ← 出现绿色方块 = 每次父组件更新它都跟着渲染
│  Name: 张三         │     可能需要用 React.memo() 优化
│  Age: 25           │
└────────────────────┘
```

**方法二：使用 Profiler 录制渲染**

1. 切换到 **Profiler** 标签页
2. 点击 **"Record"** 按钮（圆点图标）
3. 在页面上操作（点击按钮、输入文字等）
4. 点击 **"Stop"** 停止录制
5. 查看火焰图，找出渲染时间最长的组件

#### 搜索和过滤组件

当组件树很深时，搜索功能非常实用：

| 操作 | 方法 |
|------|------|
| 按名称搜索 | 在顶部搜索框输入组件名（如 `UserCard`） |
| 按文件路径过滤 | 在设置中开启 "Show component names" |
| 固定某个组件 | 右键组件 → "Pin to top"，方便对比查看 |
| 只看有状态的组件 | 搜索 `state:` 或 `hooks:` |

---

### 2. ⚡ VS Code 必装扩展清单

> 💡 **推荐理由**：好的工具配置能让你的开发效率提升 50% 以上。

#### 必装扩展

| 扩展名称 | ID | 作用 | 推荐指数 |
|---------|-----|------|---------|
| **ES7+ React/Redux/React-Native snippets** | `dsznajder.es7-react-js-snippets` | 输入简写自动生成组件模板代码 | ⭐⭐⭐⭐⭐ |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | 修改 HTML/JSX 开始标签时，结束标签自动跟随 | ⭐⭐⭐⭐⭐ |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind CSS 类名智能提示（如果用 Tailwind） | ⭐⭐⭐⭐⭐ |
| **Error Lens** | `usernamehw.errorlens` | 在代码行内直接显示错误和警告信息 | ⭐⭐⭐⭐⭐ |
| **Code Spell Checker** | `streetsidesoftware.code-spell-checker` | 实时拼写检查，避免变量名拼写错误 | ⭐⭐⭐⭐ |
| **Prettier** | `esbenp.prettier-vscode` | 代码自动格式化工具 | ⭐⭐⭐⭐⭐ |
| **ESLint** | `dbaeumer.vscode-eslint` | JavaScript/TypeScript 代码检查工具 | ⭐⭐⭐⭐⭐ |
| **GitLens** | `eamodio.gitlens` | 查看代码的 Git 提交历史（鼠标悬停即可看到） | ⭐⭐⭐⭐ |
| **Bracket Pair Colorization** | 内置 | 括号彩色高亮（VS Code 已内置，无需安装） | ⭐⭐⭐⭐ |
| **Material Icon Theme** | `PKief.material-icon-theme` | 文件图标美化，一眼区分文件类型 | ⭐⭐⭐ |

#### ES7+ React Snippets 常用代码片段

安装后，在 `.jsx` 文件中输入以下简写，按 `Tab` 即可生成代码：

| 简写 | 生成内容 | 说明 |
|------|---------|------|
| `rfc` | 函数组件（无 import） | 最常用 |
| `rfce` | 函数组件（带 export） | 推荐使用 |
| `rafce` | 带箭头函数的组件 | 现代写法 |
| `imrc` | `import React from 'react'` | 导入 React |
| `imr` | `import React, { useState } from 'react'` | 导入 React + Hook |
| `useState` | `const [state, setState] = useState(initialValue)` | 快速创建 state |
| `useEffect` | `useEffect(() => { ... }, [])` | 快速创建 effect |
| `fpcc` | 带 PropTypes 的函数组件 | 需要类型检查时 |

```
📸 实际使用效果：
输入 rafce → 按 Tab → 自动生成：

import React from 'react'

const Header = () => {
  return (
    <div>Header</div>
  )
}

export default Header
```

#### VS Code 调试配置（Chrome 联调）

在项目根目录创建 `.vscode/launch.json`，可以直接在 VS Code 中打断点调试：

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "🚀 启动 Chrome 调试",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    }
  ]
}
```

**使用步骤：**

1. 在代码中点击行号左侧，添加红色断点 🔴
2. 按 `F5` 启动调试
3. Chrome 会自动打开并连接到 VS Code
4. 当代码执行到断点时，VS Code 会暂停，你可以查看变量、调用堆栈等

#### 推荐的 settings.json 配置

按 `Ctrl + Shift + P` → 输入 "Open User Settings (JSON)" 打开配置文件：

```json
// VS Code settings.json 推荐配置
{
  // ===== 编辑器基础 =====
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.formatOnSave": true,

  // ===== 默认格式化工具 =====
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // ===== 文件关联 =====
  "files.associations": {
    "*.jsx": "javascriptreact",
    "*.tsx": "typescriptreact"
  },

  // ===== Emmet 配置（快速写 HTML/JSX）=====
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "javascriptreact": "javascriptreact"
  },

  // ===== 代码提示优化 =====
  "javascript.suggest.autoImports": true,
  "typescript.suggest.autoImports": true,

  // ===== 终端 =====
  "terminal.integrated.fontSize": 13,

  // ===== Git =====
  "git.autofetch": true,
  "git.confirmSync": false,

  // ===== Exclude 文件（文件搜索时忽略）=====
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/dist": true,
    "**/.next": true
  },

  // ===== 搜索排除 =====
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/*.min.js": true
  }
}
```

---

### 3. 🌐 Chrome DevTools 在 React 开发中的应用

Chrome DevTools（按 `F12` 打开）是前端开发者最重要的调试工具，掌握它能让你快速定位和解决问题。

#### Console 面板的高级用法

除了 `console.log()`，Console 面板还有很多强大的方法：

```javascript
// ===== 1. console.table() —— 表格化展示数据 =====
const users = [
  { name: '张三', age: 25, city: '北京' },
  { name: '李四', age: 30, city: '上海' },
  { name: '王五', age: 28, city: '广州' },
];
console.table(users);
// 📸 效果：以漂亮的表格形式展示数组/对象

// ===== 2. console.group() —— 分组日志 =====
console.group('🛒 用户下单流程');
  console.log('1. 用户点击购买按钮');
  console.log('2. 验证库存...');
  console.group('📦 库存验证');
    console.log('商品ID: 12345, 库存: 10');
    console.log('库存充足 ✅');
  console.groupEnd();
  console.log('3. 创建订单...');
console.groupEnd();
// 📸 效果：日志按层级折叠显示，清晰有条理

// ===== 3. console.time() / console.timeEnd() —— 计时 =====
console.time('⏱️ 渲染时间');
// ... 执行一些代码 ...
renderHeavyComponent();
console.timeEnd('⏱️ 渲染时间');
// 📸 输出：⏱️ 渲染时间: 152.3ms

// ===== 4. console.count() —— 计数器 =====
// 用来检查某个函数被调用了多少次
function handleSearch(keyword) {
  console.count('🔍 搜索调用次数');
  // ... 搜索逻辑 ...
}
// 📸 输出：
// 🔍 搜索调用次数: 1
// 🔍 搜索调用次数: 2
// 🔍 搜索调用次数: 3

// ===== 5. console.assert() —— 断言 =====
const user = { name: '张三', age: 25 };
console.assert(user.age >= 18, '用户未成年！');
// 如果条件为 false，才会输出错误信息

// ===== 6. console.trace() —— 调用堆栈追踪 =====
function ComponentA() { ComponentB(); }
function ComponentB() { ComponentC(); }
function ComponentC() { console.trace('📍 调用追踪'); }
ComponentA();
// 📸 效果：显示完整的函数调用链，快速找到"谁调用了这个函数"

// ===== 7. console.warn() / console.error() / console.info() =====
console.warn('⚠️ 这个API即将废弃');
console.error('❌ 请求失败：网络超时');
console.info('ℹ️ 应用已初始化完成');
```

#### Network 面板：分析 API 请求瀑布流

```
📸 Network 面板截图示意：
┌─────────────────────────────────────────────────────────┐
│ 🔍 Filter  ☁️ | ⚙️ Presets |                           │
├──────────────┬───────┬────────┬────────┬───────────────┤
│ Name         │ Status│ Type   │ Size   │ Time          │
├──────────────┼───────┼────────┼────────┼───────────────┤
│ index.html   │ 200   │ doc    │ 2.1KB  │ 15ms          │
│ main.jsx     │ 200   │ script │ 1.5KB  │ 23ms          │
│ App.jsx      │ 200   │ script │ 3.2KB  │ 45ms          │
│ GET /api/user│ 200   │ fetch  │ 1.8KB  │ 320ms  ⚠️     │  ← 这个慢了
│ GET /api/list│ 404   │ fetch  │ 0.2KB  │ 150ms  ❌     │  ← 这个报错了
│ avatar.png   │ 304   │ img    │ 45KB   │ 12ms          │
├──────────────┴───────┴────────┴────────┴───────────────┤
│ 瀑布流图（Waterfall）：                                   │
│ index.html  ██                                            │
│ main.jsx    ██████                                        │
│ App.jsx     ██████████                                   │
│ api/user    ████████████████████████████████████████ ⚠️  │  ← 瓶颈！
│ api/list    ██████████████████████ ❌                     │
│ avatar.png  █████                                        │
└─────────────────────────────────────────────────────────┘
```

**常用操作：**

| 操作 | 方法 | 用途 |
|------|------|------|
| 过滤请求类型 | 点击 XHR/Fetch 按钮 | 只看 API 请求 |
| 查看请求/响应详情 | 点击请求行 → Headers/Payload/Response | 查看 API 返回的数据 |
| 重新发送请求 | 右键请求 → Replay XHR | 方便调试 |
| 阻断请求 | 右键请求 → Block request URL | 模拟接口失败 |
| 复制 cURL | 右键请求 → Copy → Copy as cURL | 分享给后端排查 |
| 录制并导出 | 🟢 开始录制 → 导出 HAR | 保存网络请求数据 |

#### Performance 面板：录制页面性能

**使用步骤：**

1. 打开 **Performance** 面板
2. 点击 **"Record"** 按钮（或按 `Ctrl + E`）
3. 在页面上操作（滚动、点击、切换页面等，操作 3-5 秒）
4. 点击 **"Stop"** 停止
5. 分析结果

```
📸 Performance 面板关键指标：
┌──────────────────────────────────────────┐
│ Summary（概览）：                         │
│   Loading: 150ms     ✅ (< 500ms 好)     │
│   Scripting: 800ms   ⚠️ (< 200ms 好)     │
│   Rendering: 350ms   ⚠️                  │
│   Painting: 120ms    ✅                  │
│                                          │
│ Main（主线程火焰图）：                     │
│   ████████████████ handleSearch  800ms   │  ← 这段代码执行太久了
│   ██████████ filterList       450ms      │  ← 找到瓶颈！
│   ████ renderList             200ms      │
│   ██ updateDOM                50ms       │
└──────────────────────────────────────────┘
```

#### Application 面板：存储与缓存

**常用功能：**

| 功能 | 说明 | 使用场景 |
|------|------|---------|
| **Local Storage** | 查看和修改 localStorage | 检查用户配置、Token 存储 |
| **Session Storage** | 查看和修改 sessionStorage | 临时数据调试 |
| **Cookies** | 查看/删除 Cookie | 调试登录状态 |
| **Service Workers** | 查看/注销 Service Worker | PWA 调试 |
| **Cache Storage** | 查看缓存数据 | 检查离线缓存是否生效 |
| **Manifest** | 查看 PWA 配置 | PWA 功能调试 |

#### 模拟慢速网络和移动设备

**模拟移动设备：**

1. 点击 DevTools 左上角的 **📱 Toggle device toolbar** 按钮（或按 `Ctrl + Shift + M`）
2. 选择设备类型（iPhone 14, iPad, Galaxy S23 等）
3. 可以自定义屏幕宽度和高度

**模拟慢速网络：**

1. 在 Network 面板中，找到 **"Online"** 下拉菜单
2. 选择网络速度：
   - **Slow 3G**：模拟 3G 网络（极慢，适合测试加载状态）
   - **Fast 3G**：模拟快速 3G
   - **Offline**：完全断网（测试离线功能）
   - **Custom**：自定义上传/下载速度和延迟

```
📸 网络节流选项：
┌─────────────────────┐
│ Online              │  ← 默认（无限制）
├─────────────────────┤
│ Fast 3G             │  → 1.6 Mbps / 750 KB/s
│ Slow 3G             │  → 400 Kbps / 300 KB/s
│ Offline             │  → 断网
├─────────────────────┤
│ Custom...           │  → 自定义速度和延迟
└─────────────────────┘
```

#### 条件断点（Conditional Breakpoint）

> 💡 **场景**：你只想在某个变量为特定值时才停下来调试，不想每次都停。

**使用步骤：**

1. 在代码行号上**右键**
2. 选择 **"Add conditional breakpoint..."**
3. 输入条件表达式（如 `userId === 123`）
4. 当条件满足时才会暂停

```
📸 条件断点设置：
第 45 行: const item = list.find(i => i.id === id);
   → 右键第45行 → Add conditional breakpoint
   → 输入: id === 'abc123'
   → 只有当 id 为 'abc123' 时才会暂停
```

**常用的条件表达式：**

```javascript
// 只在特定用户时暂停
userId === 456

// 只在数组为空时暂停
items.length === 0

// 只在价格异常时暂停
price > 10000

// 只在响应报错时暂停
response.status >= 400
```

#### Logpoints（日志断点）

> 💡 **场景**：你想在某个位置打印日志，但不想修改源代码。

**使用步骤：**

1. 在代码行号上**右键**
2. 选择 **"Add logpoint..."**
3. 输入要打印的表达式（用 `{}` 包裹变量名）
4. 日志会直接输出到 Console 面板，**不影响源代码**

```
📸 Logpoint 设置：
第 30 行: setData(result);
   → 右键第30行 → Add logpoint
   → 输入: '获取到数据:', { result }
   → Console 面板自动输出：获取到数据: {name: "张三", age: 25}

📌 好处：
  - 不需要修改源代码
  - 不需要重新保存文件
  - 用完即删，零污染
```

---

### 4. 📏 ESLint + Prettier 配置最佳实践

#### 为什么需要代码规范？

想象一个团队在写代码，每个人都用自己的风格：

```
// 开发者 A 的风格（无分号、双引号）
const name = "张三"
console.log(name)

// 开发者 B 的风格（有分号、单引号）
const name = '张三';
console.log(name);

// 开发者 C 的风格（无分号、模板字符串）
const name = `张三`
console.log( name )
```

> ⚠️ **问题**：Git 每次合并代码时，到处都是格式差异的修改，很难看出真正改了什么逻辑。

**ESLint + Prettier = 团队的"统一语言"**

| 工具 | 作用 | 类比 |
|------|------|------|
| **ESLint** | 检查代码质量和风格 | 语文老师检查语法和错别字 |
| **Prettier** | 自动格式化代码 | 排版工人自动整理版面 |

#### Vite 项目的 ESLint 配置

```bash
# 安装 ESLint 及其相关插件
npm install -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier

# 创建 ESLint 配置文件
npx eslint init
```

**`eslint.config.js` 配置（ESLint 扁平配置格式）：**

```javascript
// eslint.config.js
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default [
  // 基础 JS 推荐规则
  js.configs.recommended,

  // Prettier 配置（关闭与 Prettier 冲突的规则）
  prettierConfig,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect', // 自动检测 React 版本
      },
    },
    rules: {
      // ===== React 相关规则 =====
      'react/react-in-jsx-scope': 'off',              // React 17+ 不需要手动导入 React
      'react/prop-types': 'warn',                     // 建议使用 PropTypes（用 TS 可关闭）
      'react/self-closing-comp': 'error',              // 没有子元素时必须自闭合 <Component />
      'react/jsx-no-duplicate-props': 'error',         // 禁止重复的 props
      'react/jsx-no-undef': 'error',                   // 禁止使用未定义的组件

      // ===== React Hooks 规则（重要！）=====
      'react-hooks/rules-of-hooks': 'error',           // Hook 只能在顶层调用
      'react-hooks/exhaustive-deps': 'warn',           // useEffect 依赖完整性检查

      // ===== 代码质量规则 =====
      'no-unused-vars': ['warn', {                    // 未使用变量警告
        argsIgnorePattern: '^_',                       // 以 _ 开头的参数忽略
        varsIgnorePattern: '^_',                       // 以 _ 开头的变量忽略
      }],
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error',                        // 优先使用 const
      'no-var': 'error',                              // 禁止使用 var
      'eqeqeq': ['warn', 'always'],                   // 强制使用 === 而不是 ==
      'curly': ['error', 'multi-line'],               // 多行 if 必须使用花括号
    },
  },
];
```

#### Prettier 配置

```bash
# 安装 Prettier
npm install -D prettier
```

**`.prettierrc` 配置文件：**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "arrowParens": "always",
  "endOfLine": "auto"
}
```

**配置说明：**

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `semi` | `true` | 语句末尾加分号 |
| `singleQuote` | `true` | 使用单引号代替双引号 |
| `tabWidth` | `2` | 缩进宽度为 2 个空格 |
| `trailingComma` | `"es5"` | 在 ES5 兼容的地方加尾逗号（对象、数组） |
| `printWidth` | `80` | 每行最大 80 个字符 |
| `bracketSpacing` | `true` | 对象花括号内加空格 `{ foo }` |
| `jsxSingleQuote` | `false` | JSX 使用双引号 |
| `arrowParens` | `"always"` | 箭头函数参数始终加括号 `(x) => x` |

#### Husky + lint-staged 的 Git Hook 配置

> 💡 **目的**：在每次 `git commit` 之前，自动检查和格式化代码，防止不规范的代码被提交。

```bash
# 安装依赖
npm install -D husky lint-staged

# 初始化 Husky
npx husky init
```

**`package.json` 中添加 lint-staged 配置：**

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

**配置 Git Hook：**

```bash
# 在 pre-commit 钩子中运行 lint-staged
echo "npx lint-staged" > .husky/pre-commit
```

**工作流程：**

```
你执行 git commit
       ↓
Husky 触发 pre-commit 钩子
       ↓
lint-staged 只检查你修改过的文件（不是全量检查，速度很快！）
       ↓
ESLint 检查代码质量 → 自动修复可修复的问题
       ↓
Prettier 格式化代码
       ↓
如果通过 → 提交成功 ✅
如果有无法自动修复的错误 → 提交被阻止 ❌，需要手动修复
```

#### VS Code 保存自动格式化

在 `.vscode/settings.json` 中添加（项目级配置，确保团队一致）：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

### 5. 🔀 Git 工作流与分支策略

#### 适合 React 项目的分支策略（Git Flow 简化版）

对于中小型 React 项目，推荐使用**简化版的 Git Flow**：

```
分支策略示意图：

main (生产环境代码)
 │
 ├──── feature/login-page (开发登录页面)
 │       │
 │       └──── → 开发完成后合并到 main
 │
 ├──── feature/user-profile (开发个人资料页)
 │
 └──── hotfix/fix-login-bug (紧急修复登录 Bug)
         └──── → 直接合并到 main

核心规则：
1. main 分支永远是稳定可发布的状态
2. 新功能从 main 拉出 feature 分支开发
3. 开发完成后通过 Pull Request 合并回 main
4. 紧急修复用 hotfix 分支
```

**常用分支类型：**

| 分支类型 | 命名格式 | 生命周期 | 说明 |
|---------|---------|---------|------|
| `main` | `main` | 永久 | 生产环境代码，受保护 |
| `feature/*` | `feature/功能名` | 临时 | 新功能开发 |
| `bugfix/*` | `bugfix/问题描述` | 临时 | 非紧急 Bug 修复 |
| `hotfix/*` | `hotfix/紧急修复` | 临时 | 紧急 Bug 修复 |

#### .gitignore 配置（Node.js / React 项目）

```gitignore
# ===== 依赖 =====
node_modules/
.pnp
.pnp.js

# ===== 构建输出 =====
dist/
build/
.next/
out/

# ===== 环境变量（重要！不要提交到 Git）=====
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# ===== 编辑器 =====
.vscode/
.idea/
*.swp
*.swo
*~

# ===== 操作系统 =====
.DS_Store
Thumbs.db

# ===== 日志 =====
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ===== 测试覆盖率 =====
coverage/

# ===== 其他 =====
*.tgz
.npmrc
```

#### Commit Message 规范

采用 **Conventional Commits** 规范，格式：`<type>(<scope>): <subject>`

```bash
# 功能开发
git commit -m "feat(login): 添加微信扫码登录功能"
git commit -m "feat(user): 实现个人资料编辑页面"

# Bug 修复
git commit -m "fix(cart): 修复购物车数量计算错误的问题"
git commit -m "fix(auth): 解决 token 过期后未自动跳转登录页"

# 文档更新
git commit -m "docs(readme): 更新项目安装说明"
git commit -m "docs(api): 补充接口文档"

# 代码重构（不改变功能）
git commit -m "refactor(utils): 优化日期格式化函数"

# 性能优化
git commit -m "perf(list): 使用虚拟滚动优化长列表渲染性能"

# 样式调整
git commit -m "style(header): 调整导航栏间距和字体大小"

# 测试
git commit -m "test(auth): 添加登录模块单元测试"

# 构建/工具链
git commit -m "chore(deps): 升级 React 到 18.3 版本"
```

**Type 对照表：**

| Type | 说明 | 版本影响 |
|------|------|---------|
| `feat` | 新功能 | MINOR 版本 +1 |
| `fix` | Bug 修复 | PATCH 版本 +1 |
| `docs` | 文档更新 | 无 |
| `style` | 代码格式（不影响逻辑） | 无 |
| `refactor` | 重构（不改变功能） | 无 |
| `perf` | 性能优化 | PATCH 版本 +1 |
| `test` | 测试 | 无 |
| `chore` | 构建过程或辅助工具 | 无 |

#### 常用 Git 操作技巧

**1. git stash —— 临时保存工作区**

```bash
# 场景：你正在开发 feature 分支，突然需要切到 main 修 Bug
# 但当前代码还没写完，不想 commit

# 保存当前修改（像"暂存"）
git stash
git stash save "正在开发登录功能，做到一半"

# 切到 main 修 Bug
git checkout main
# ... 修完 Bug ...

# 回到 feature 分支，恢复之前的工作
git checkout feature/login
git stash pop   # 恢复最近的 stash 并删除记录

# 查看 stash 列表
git stash list

# 恢复指定的 stash（不删除记录）
git stash apply stash@{0}
```

**2. git cherry-pick —— 摘取某个提交**

```bash
# 场景：你在 feature 分支修了一个 Bug，
# 但这个 Bug 在 main 分支也存在，你想把这个修复"搬运"过去

# 1. 查看提交历史，找到要搬运的 commit hash
git log --oneline
# 输出：a1b2c3d fix(login): 修复登录按钮点击无响应

# 2. 切到目标分支
git checkout main

# 3. 摘取那个提交
git cherry-pick a1b2c3d
```

**3. git rebase —— 整理提交历史**

```bash
# 场景：你的 feature 分支有 5 个 commit，
# 合并到 main 前想整理成 1 个干净的 commit

# 交互式 rebase（最近 3 个提交）
git rebase -i HEAD~3

# 会打开编辑器，你可以：
# pick abc1234 feat: 添加登录页面     → 保留
# squash def5678 feat: 添加表单验证   → 合并到上一个
# squash ghi9012 fix: 修复样式问题    → 合并到上一个
# → 保存后，3 个 commit 变成 1 个

# ⚠️ 注意：如果已经 push 到远程，用 rebase 会改写历史
# 团队协作时请谨慎使用，建议只在个人分支上使用
```

**4. 其他实用技巧**

```bash
# 撤销上一次 commit（保留修改）
git reset --soft HEAD~1

# 查看某一行代码是谁写的（代码追责神器 😄）
git blame src/components/Login.jsx

# 查看两个分支的差异
git diff main..feature/login

# 查看某个文件的修改历史
git log --follow -p src/components/Header.jsx

# 快速回退到上一个版本（不创建 commit）
git checkout -- src/App.jsx
```

> 💡 **小贴士**：建议安装 VS Code 扩展 **GitLens** 或 **Git Graph**，可以用可视化的方式查看分支、提交历史，比命令行直观很多。

---

## 🔗 下一步

准备好进入下一节了吗？接下来我们将学习 **JSX 基础语法**——React 的核心语法！

[→ 02 - JSX 基础](../02-jsx-basics/)
