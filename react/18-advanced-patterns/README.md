# 18 - 高级设计模式

## 🎯 本节目标
- 理解什么是"设计模式"，以及为什么我们需要它
- 掌握 React 中的 6 大常见设计模式
- 学会在真实项目中根据需求选择合适的模式
- 理解从 HOC → Render Props → Hooks 的技术演进脉络

---

## 📖 什么是"设计模式"？为什么需要它？

### 一个生活中的比喻

想象你在厨房做饭。你可以随手把所有调料、锅碗瓢盆堆在台面上——做饭当然也能做，但厨房会越来越乱，下次做菜找东西就很痛苦。

**设计模式**就像是厨房里的"收纳法则"：
- 刀具放在刀架上（固定的位置）
- 调料按类别归类到不同的罐子里（分类管理）
- 做完菜立刻收拾（保持整洁）

这些"法则"不是法律规定你必须这么做，而是**前人总结出的最佳实践**——按照这些方法来，你的厨房会整洁、高效、好维护。

### 编程中的设计模式

在软件开发中，我们也会遇到类似的问题：
- 代码越写越多，变得难以维护
- 多个组件有相似逻辑，到处复制粘贴
- 想修改一个功能，却要改好几个地方

**设计模式**就是程序员们总结出来的、经过验证的"代码组织方案"。它不是某一个具体的技术，而是一种**思维方式**——面对特定问题时，用一种优雅、高效、可维护的方式去解决。

### React 中的模式演进

React 的设计模式经历了一条清晰的演进路线，了解这条路线有助于你理解"为什么现在用 Hooks"：

```
早期（2015-2017）         →  中期（2017-2019）        →  现代（2019 至今）
   Mixins（混入）          →  HOC（高阶组件）          →  Hooks（钩子）
   （已废弃，不推荐）         + Render Props              （当前主流）
```

为什么会有这种演进？因为每种模式都有它的**优点和缺点**，后一种模式往往是为了解决前一种模式的痛点而诞生的。我们会在下面的学习中逐一了解。

---

## 📐 六大模式概览

| 模式 | 一句话解释 | 生活比喻 | 复杂度 |
|------|-----------|---------|--------|
| **Container/Presentational** | 把"做事"和"展示"分开 | 厨师做菜 vs 服务员上菜 | ⭐⭐ |
| **Render Props** | 把渲染权交给使用者 | 提供食材，让你自己决定怎么炒 | ⭐⭐⭐ |
| **HOC** | 给组件"穿装备" | 给角色穿上不同的装备获得不同能力 | ⭐⭐⭐ |
| **Compound Components** | 一组组件协同工作 | 一套餐具（刀叉勺）搭配使用 | ⭐⭐⭐ |
| **Controlled/Uncontrolled** | 谁来掌控状态？ | 自动挡 vs 手动挡汽车 | ⭐⭐ |
| **Provider Pattern** | 全局共享状态 | 广播系统——所有人都收到消息 | ⭐⭐ |

---

## 1. Container/Presentational 模式（容器/展示组件）

### 这是什么？

这是最基础也最实用的模式。它的核心思想很简单：**把组件分成两类，一类负责"做事"，一类负责"好看"**。

打个比方：你去餐厅吃饭，有两个人为你服务：
- **厨师（容器组件）**：在后厨忙碌——查看库存、准备食材、控制火候、把控口味。你不会看到他，但他在默默工作。
- **服务员（展示组件）**：把做好的菜端给你、摆好盘、让你看得赏心悦目。他不管菜是怎么做的，只负责"呈现"。

### 为什么需要这个模式？

如果没有这种分离，你的组件会变成这样：

```jsx
// ❌ 不好的做法：一个组件又管数据又管 UI
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... 几十行数据获取逻辑 ...

  return (
    // ... 几十行 UI 代码 ...
  );
}
```

这种代码有几个问题：
1. **难以复用**：如果另一个页面也需要"用户列表"的 UI，但数据来源不同呢？你得把整个组件复制一份，只改数据获取的部分。
2. **难以测试**：你想测试 UI 渲染对不对，却要先 mock 掉数据获取；你想测试数据逻辑对不对，却要渲染整个 UI。
3. **难以维护**：改 UI 样式和改数据逻辑在同一个文件里，改一个不小心影响了另一个。

### 怎么用？

```jsx
// === 第一步：写展示组件（"服务员"） ===
// 它只关心一件事：收到数据后怎么显示
// 它不知道数据从哪来，也不知道怎么修改数据

function UserList({ users, isLoading, onSelectUser }) {
  // 如果正在加载，显示加载动画
  if (isLoading) {
    return <div className="loading">加载中...</div>;
  }

  // 如果没有用户数据，显示空状态
  if (!users || users.length === 0) {
    return <div className="empty">暂无用户数据</div>;
  }

  // 有数据，正常渲染列表
  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id}>
          <span>{user.name}</span>
          <span>{user.email}</span>
          <button onClick={() => onSelectUser(user.id)}>
            查看详情
          </button>
        </li>
      ))}
    </ul>
  );
}

// === 第二步：写容器组件（"厨师"） ===
// 它负责数据获取、业务逻辑
// 它不关心 UI 长什么样

function UserListContainer() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 组件挂载时获取数据
  useEffect(() => {
    async function loadUsers() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('获取用户失败:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  // 点击用户后跳转到详情页
  const handleSelectUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  // 把数据和回调传给展示组件
  return (
    <UserList
      users={users}
      isLoading={isLoading}
      onSelectUser={handleSelectUser}
    />
  );
}
```

### 实际好处

1. **展示组件可以复用**：假设你有"管理员用户列表"和"普通用户列表"，UI 完全一样但数据来源不同。展示组件 `UserList` 不用改，只需写两个不同的容器组件即可。

2. **易于测试**：
   - 测试展示组件：传入假数据，检查渲染结果，不需要网络请求
   - 测试容器组件：mock 掉 `fetch`，检查是否正确调用了 API

3. **团队协作**：设计师/前端可以专注于展示组件的 UI，后端/逻辑开发者可以专注于容器组件的数据逻辑。

> **现代实践提示**：有了 Hooks 之后，很多人用 Custom Hook 替代容器组件。即：把数据逻辑封装成 `useUsers()` 这样的 Hook，然后在页面组件中直接调用。本质思想是一样的——**分离逻辑和 UI**。

---

## 2. Render Props 模式

### 这是什么？

"Render Props"这个名字听起来很学术，但它的含义很简单：

> **组件不自己决定渲染什么，而是把"怎么渲染"的决定权交给使用者。**

生活比喻：假设你开了一家"食材配送公司"。你不直接卖做好的菜，而是把食材送到客户家，让客户自己决定怎么炒。不同的客户可以做出完全不同的菜。

在代码中，"食材"就是组件内部管理的**状态或逻辑**，"怎么炒"就是一个**函数**（由使用者提供）。

### 为什么需要这个模式？

假设你需要实现"鼠标位置追踪"的功能：
- 在页面 A 中，你希望鼠标位置显示为一个跟随鼠标的红点
- 在页面 B 中，你希望鼠标位置显示为一行坐标文字
- 在页面 C 中，你希望鼠标移动时改变背景颜色

"获取鼠标位置"的逻辑是**相同的**，但"如何渲染"是**不同的**。如果每种情况都写一个组件，就会产生大量重复代码。

### 怎么用？

```jsx
// === 第一步：写一个提供"鼠标位置"的组件 ===
// 它只负责追踪鼠标，不负责渲染
function MouseTracker({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 关键：不自己渲染 UI，而是把状态传给 children 函数
  // children 在这里是 { x, y } => <JSX>
  return children(position);
}

// === 第二步：使用者自己决定怎么渲染 ===

// 使用方式 1：渲染一个跟随鼠标的红点
function App1() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <div>
          <p>鼠标位置: ({x}, {y})</p>
          <div style={{
            position: 'absolute',
            left: x - 10,
            top: y - 10,
            width: 20,
            height: 20,
            background: 'red',
            borderRadius: '50%'
          }} />
        </div>
      )}
    </MouseTracker>
  );
}

// 使用方式 2：渲染为坐标文字
function App2() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <h1>你的鼠标在 ({x}, {y}) 这个位置</h1>
      )}
    </MouseTracker>
  );
}

// 使用方式 3：根据鼠标位置改变背景颜色
function App3() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: `rgb(${x % 255}, ${y % 255}, 100)`
        }}>
          移动鼠标试试！
        </div>
      )}
    </MouseTracker>
  );
}
```

看！**同一个 `MouseTracker` 组件，通过不同的 Render Props，实现了完全不同的 UI 效果**。这就是 Render Props 的威力——逻辑复用，渲染自由。

### 为什么叫"Render Props"？

因为传给组件的 prop 是一个**用于渲染的函数**：

```jsx
// children 也是一个 prop，只不过它写在标签之间
<MouseTracker>
  {({ x, y }) => <div>...</div>}   // ← 这个就是 render prop
</MouseTracker>

// 你也可以用其他名称
<MouseTracker render={({ x, y }) => <div>...</div>} />
```

### 它和 Hooks 的关系

如果你仔细看上面的 `MouseTracker`，会发现它的核心逻辑可以提取成一个 Hook：

```jsx
// 把鼠标追踪逻辑提取成自定义 Hook
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}

// 使用 Hook（比 Render Props 更简洁）
function App() {
  const { x, y } = useMousePosition();
  return <div>鼠标在 ({x}, {y})</div>;
}
```

**结论**：在 React Hooks 出现之后，大多数 Render Props 的使用场景都可以用自定义 Hook 替代，且代码更简洁。但理解 Render Props 仍然很重要，因为：
1. 很多第三方库仍然使用这种模式
2. 有些场景下 Render Props 仍然有优势（比如需要包裹 JSX 结构时）

---

## 3. Higher-Order Components（HOC，高阶组件）

### 这是什么？

"高阶组件"这个名字可能让你觉得很高深，但它其实非常简单：

> **HOC 就是一个函数，它接收一个组件，返回一个"增强版"的新组件。**

生活比喻：想象你有一个普通的手机。你可以给它贴膜（防刮花）、装壳（防摔）、加挂绳（防丢）。手机本身没变，但它获得了新的"能力"。

HOC 就是这种"给组件加装能力"的机制。

### 为什么需要这个模式？

在开发中，有很多"横切关注点"（Cross-Cutting Concerns）——也就是多个组件都需要但与业务逻辑无关的功能：
- 权限检查：只有登录用户才能看到某些页面
- 数据加载：多个页面都需要先加载数再显示内容
- 日志记录：开发时需要追踪组件的渲染和更新

如果每个组件都手动写一遍这些逻辑，代码会大量重复。HOC 让你**写一次逻辑，应用到任意组件上**。

### 怎么用？

#### 基础示例：添加加载状态

```jsx
// 定义一个 HOC：给任何组件添加"加载中"的功能
function withLoading(WrappedComponent) {
  // 返回一个新组件
  function EnhancedComponent({ isLoading, ...restProps }) {
    if (isLoading) {
      return <div>加载中，请稍候...</div>;
    }
    // 不是加载状态，正常渲染原始组件
    return <WrappedComponent {...restProps} />;
  }

  // 设置显示名称，方便调试时在 DevTools 中识别
  EnhancedComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return EnhancedComponent;
}

// 使用：给 UserProfile 组件添加加载功能
const UserProfileWithLoading = withLoading(UserProfile);

// 在页面中使用
function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <UserProfileWithLoading
      isLoading={isLoading}
      name="张三"
    />
  );
}
```

#### 实战示例：权限控制 HOC

```jsx
// withAuth：检查用户是否登录，未登录则跳转到登录页
function withAuth(WrappedComponent, options = {}) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // 未登录：重定向到登录页
    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // 已登录但角色不够：显示无权限页面
    if (options.requiredRole && !options.requiredRole.includes(user.role)) {
      return <div>你没有权限访问此页面</div>;
    }

    // 验证通过：渲染原始组件，并注入用户信息
    return <WrappedComponent {...props} user={user} />;
  };
}

// 使用：只有管理员才能访问后台
const AdminPanel = withAuth(AdminDashboard, { requiredRole: ['admin'] });

// 在路由中使用
<Route path="/admin" element={<AdminPanel />} />
```

### HOC 的缺点（为什么后来被 Hooks 取代？）

HOC 虽然好用，但有一些明显的问题：

1. **嵌套地狱**：多个 HOC 套在一起，代码难以阅读
   ```jsx
   // 看看这层层的包裹...
   export default withLogger(
     withAuth(
       withTheme(
         withLoading(UserProfile)
       )
     )
   );
   ```

2. **Props 来源不清晰**： WrappedComponent 收到的 props 中，有些是外部传入的，有些是 HOC 注入的，很难区分

3. **命名冲突**：多个 HOC 可能注入同名的 prop

4. **调试困难**：在 React DevTools 中看到的是一层层的匿名组件

### 现代替代方案

大多数 HOC 现在都可以用 **自定义 Hooks** 替代：

```jsx
// HOC 版本
const AdminPanel = withAuth(AdminDashboard);

// Hook 版本（更清晰！）
function AdminPanel() {
  const { user, isAuthenticated } = useAuth();  // 自定义 Hook
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <AdminDashboard user={user} />;
}
```

> **总结**：HOC 是 React 历史上的重要模式，理解它有助于阅读老项目和第三方库。但在新项目中，优先使用 Hooks。

---

## 4. Compound Components（复合组件）

### 这是什么？

"复合组件"是指**一组协同工作的组件**，它们一起使用才能发挥作用，外部使用者不需要了解内部的状态管理细节。

生活比喻：一套乐高积木。你不需要理解每个零件的内部结构，只需要按照"说明书"把它们组合在一起，就能搭出一个完整的作品。在 React 中，这些"积木"就是各个子组件。

最经典的例子就是你每天都会用到的东西——HTML 的 `<select>` 和 `<option>`：

```html
<!-- 你不需要告诉 <select> 内部怎么管理"选中"状态 -->
<!-- 它们天然就是一组协同工作的组件 -->
<select>
  <option value="apple">苹果</option>
  <option value="banana">香蕉</option>
  <option value="orange">橙子</option>
</select>
```

React 中的复合组件模式就是让你能创建类似这种"天然协同"的组件 API。

### 为什么需要这个模式？

假设你想做一个"手风琴"（Accordion，就是那种点击标题展开/收起内容的组件）。

**不用复合组件的写法**（不灵活）：
```jsx
// 每个手风琴项都要传入 index，还要手动管理 openIndex 状态
<Accordion
  items={[
    { title: 'React 是什么？', content: 'React 是一个 UI 库' },
    { title: '什么是 JSX？', content: 'JSX 是 JS 的扩展语法' },
  ]}
  activeIndex={0}
  onChange={setActiveIndex}
/>
```

这种写法的问题：
- 不灵活：如果我想在标题旁边加个图标呢？在内容中嵌入一个表格呢？都得通过额外的 props 去支持，API 会越来越臃肿。

**用复合组件的写法**（灵活、声明式）：
```jsx
<Accordion defaultIndex={0}>
  <AccordionHeader index={0}>React 是什么？</AccordionHeader>
  <AccordionPanel index={0}>
    React 是一个用于构建用户界面的 JavaScript 库。
  </AccordionPanel>

  <AccordionHeader index={1}>什么是 JSX？</AccordionHeader>
  <AccordionPanel index={1}>
    <p>JSX 是一种 JavaScript 的语法扩展。</p>
    <img src="jsx-example.png" alt="JSX 示例" />  {/* 想加什么就加什么！ */}
  </AccordionPanel>
</Accordion>
```

这种写法的优势：
- **灵活**：每个子组件的内容可以是任意 JSX
- **声明式**：一眼就能看出组件的结构
- **封装性**：使用者不需要知道 `openIndex` 状态怎么管理的

### 怎么实现？

核心是使用 **React Context** 来在组件之间共享状态：

```jsx
import { createContext, useContext, useState } from 'react';

// 第一步：创建一个 Context 来共享"哪个面板是打开的"
const AccordionContext = createContext();

// 第二步：主容器组件，管理状态并通过 Context 分发
function Accordion({ children, defaultIndex }) {
  const [openIndex, setOpenIndex] = useState(defaultIndex);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <AccordionContext.Provider value={{ openIndex, toggle }}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// 第三步：标题组件，通过 Context 获取状态并处理点击
function AccordionHeader({ children, index }) {
  const { openIndex, toggle } = useContext(AccordionContext);
  const isOpen = openIndex === index;

  return (
    <div className={`header ${isOpen ? 'open' : ''}`} onClick={() => toggle(index)}>
      {children}
      <span>{isOpen ? '−' : '+'}</span>
    </div>
  );
}

// 第四步：面板组件，通过 Context 判断是否显示
function AccordionPanel({ children, index }) {
  const { openIndex } = useContext(AccordionContext);

  if (openIndex !== index) return null;

  return <div className="panel">{children}</div>;
}
```

### 现实中的例子

很多优秀的 UI 库都大量使用复合组件模式：

- **Radix UI**：`<Dialog>`, `<DialogTrigger>`, `<DialogContent>`, `<DialogClose>`
- **React Router**：`<Routes>`, `<Route>`, `<Link>`, `<Navigate>`
- **Headless UI**：`<Listbox>`, `<ListboxButton>`, `<ListboxOptions>`, `<ListboxOption>`

---

## 5. Controlled/Uncontrolled 模式（受控/非受控组件）

### 这是什么？

这个模式解决的核心问题是：**谁掌控组件的状态？**

生活比喻——**自动挡 vs 手动挡汽车**：
- **受控组件 = 自动挡**：你只需要告诉汽车"我想加速"，变速箱会自动帮你换挡。你不需要关心当前是几挡，一切由外部系统管理。
- **非受控组件 = 手动挡**：你自己决定什么时候换挡。汽车内部有自己的状态（当前几挡），你自己掌控一切。

在 React 中：
- **受控组件**：组件的状态由**父组件**完全控制。父组件通过 props 传入值，通过回调接收变化。
- **非受控组件**：组件内部**自己管理**状态。父组件只在需要时通过 ref 读取。

### 受控组件（自动挡）

```jsx
// 父组件完全掌控输入框的值
function SearchBar() {
  const [searchText, setSearchText] = useState('');

  return (
    <input
      value={searchText}        // ← 值由父组件控制
      onChange={(e) => setSearchText(e.target.value)}  // ← 变化时通知父组件
    />
  );
}
```

**特点**：
- 每次输入，父组件都会更新 state，然后重新渲染
- 父组件可以随时修改、清空、格式化输入值
- 适合需要**实时验证**的场景（比如搜索框实时过滤列表）

### 非受控组件（手动挡）

```jsx
// 输入框自己管理自己的值
function ContactForm() {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 只在提交时才读取输入框的值
    console.log('你输入了:', inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        defaultValue="请输入你的名字"  // ← 只设置初始值，之后不再干预
        ref={inputRef}                // ← 通过 ref 来读取值
      />
      <button type="submit">提交</button>
    </form>
  );
}
```

**特点**：
- 组件内部自己管理状态，不会因为每次输入都触发父组件重新渲染
- 父组件不能实时知道输入内容
- 适合**只需要最终值**的场景（比如表单提交）

### 什么时候用哪个？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 实时搜索/过滤 | 受控 | 需要每次输入都获取值进行过滤 |
| 表单验证 | 受控 | 需要实时检查输入是否合法 |
| 文件上传 | 非受控 | 文件不能通过 value 控制 |
| 简单表单提交 | 非受控 | 只在提交时需要值，减少不必要的渲染 |
| 富文本编辑器 | 非受控 | 内容复杂，受控会导致性能问题 |

### 进阶：同时支持两种模式

优秀的组件库（如 Ant Design、MUI）通常会同时支持两种模式：

```jsx
function FlexibleInput({ value: controlledValue, defaultValue, onChange, ...props }) {
  // 如果外部传了 value，就是受控模式；否则是非受控模式
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;

  const currentValue = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);  // 非受控：更新内部状态
    }
    onChange?.(newValue);  // 无论哪种模式都通知外部
  };

  return <input value={currentValue} onChange={handleChange} {...props} />;
}

// 受控用法
<FlexibleInput value={text} onChange={setText} />

// 非受控用法
<FlexibleInput defaultValue="初始值" onChange={(val) => console.log(val)} />
```

---

## 6. Provider Pattern（全局状态共享）

### 这是什么？

Provider 模式利用 React Context 来在组件树中**共享数据**，避免"Props Drilling"（逐层传递 props 的痛苦）。

生活比喻：
- **Props Drilling** 就像传话游戏：A 告诉 B，B 告诉 C，C 告诉 D...每层都要"经手"一次
- **Provider 模式** 就像广播系统：A 发出消息，所有需要的人都能直接收到，不需要中间人

### Props Drilling 的痛点

```jsx
// ❌ Props Drilling：theme 从 App 一层层传到 Button
function App() {
  const [theme, setTheme] = useState('dark');
  return <Page theme={theme} />;
}
function Page({ theme }) {
  return <Header theme={theme} />;  // Page 自己不用 theme，但不得不接收并传递
}
function Header({ theme }) {
  return <Navigation theme={theme} />;  // Navigation 也是
}
function Navigation({ theme }) {
  return <Button theme={theme} />;  // 终于到了真正需要的地方！
}
function Button({ theme }) {
  return <button className={theme}>Click me</button>;
}
```

如果中间任何一个组件"忘记"传递 theme，整个链条就断了。当组件层级很深时，这简直是噩梦。

### 用 Provider 模式解决

```jsx
// ✅ 使用 Context + Provider：直接跨越层级传递
const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('dark');

  return (
    <ThemeContext.Provider value={theme}>
      <Page />  {/* Page 不需要知道 theme 的存在 */}
    </ThemeContext.Provider>
  );
}

function Button() {
  // Button 直接从 Context 获取 theme，不管它在第几层！
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### 什么时候用 Provider？

Provider 不是万能的，需要合理使用：

| 场景 | 是否适合用 Provider |
|------|-------------------|
| 主题（深色/浅色模式） | ✅ 全局都需要 |
| 当前登录用户信息 | ✅ 多处需要访问 |
| 国际化语言设置 | ✅ 全局需要 |
| 表单的状态 | ❌ 只在表单内部使用，不需要全局 |
| 组件自己的 UI 状态 | ❌ 如弹窗开关、下拉展开，用 useState 即可 |

> **重要提醒**：不要滥用 Context！每次 Context 的值变化，所有消费它的组件都会重新渲染。如果你的 Context 中存储了频繁变化的数据（如鼠标位置），会导致严重的性能问题。对于复杂状态管理，考虑使用 Zustand、Jotai 等专门的库。

---

## 💡 模式选择指南

在实际项目中，你不需要刻意使用所有模式。根据场景选择最合适的就好：

```
你的问题是……
│
├─ "逻辑和 UI 混在一起太乱了"
│   → Container/Presentational 模式
│
├─ "多个组件有相同的逻辑，想复用"
│   → 优先用自定义 Hooks
│   → 如果需要包裹 JSX 结构，用 Render Props
│
├─ "想给组件添加通用能力（权限、日志、主题）"
│   → 新项目用自定义 Hooks
│   → 老项目或第三方库可能用 HOC
│
├─ "想创建一组灵活搭配使用的组件"
│   → Compound Components 模式
│
├─ "组件状态由谁控制？"
│   → 需要实时控制 → 受控模式
│   → 只关心最终值 → 非受控模式
│
└─ "数据需要跨多层组件共享"
    → Provider 模式（少量全局状态）
    → 状态管理库（复杂状态）
```

---

## ✅ 阶段检查清单

- [ ] 能解释什么是"设计模式"，以及为什么需要它
- [ ] 能实现 Container/Presentational 分离
- [ ] 理解 Render Props 的原理，知道它和 Hooks 的关系
- [ ] 理解 HOC 的原理和缺点，知道为什么 Hooks 是更好的替代
- [ ] 能用 Context 实现复合组件
- [ ] 知道什么时候用受控组件、什么时候用非受控组件
- [ ] 理解 Provider 模式，知道它适合和不适合的场景

---

## 📝 练习任务

1. **Tabs 组件**：用复合组件模式实现 `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>`，让使用者可以像写 HTML 一样声明式地使用
2. **withForm HOC**：实现一个 `withForm` 高阶组件，自动为表单组件注入 `values`, `errors`, `handleChange`, `handleSubmit` 等能力
3. **改造旧代码**：找一个你之前写的组件，尝试用上面学到的模式进行重构，体会代码质量的提升

---

## 🏗️ 大型 React 项目的工程化实践

### 1. Monorepo 管理实战

#### 什么时候该用 Monorepo？

```
✅ 适合 Monorepo 的信号：
  • 多个项目共享组件库 / 工具函数
  • 有多个关联的前端应用（Web + Admin + H5）
  • 团队频繁跨项目修改
  • 想统一 lint / test / build 配置

❌ 不适合 Monorepo 的信号：
  • 项目之间没有代码共享
  • 团队很小（< 3 人）且只维护一个项目
  • 各项目技术栈差异大（React + Vue + Angular 混用）
```

#### pnpm workspaces + Turborepo 配置

```bash
# 1. 初始化 Monorepo
mkdir my-monorepo && cd my-monorepo
pnpm init

# 2. 安装 Turborepo
pnpm add -Dw turbo

# 3. 创建目录结构
mkdir -p packages/ui packages/utils apps/web apps/admin
```

```json
// pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// package.json（根目录）
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

```
Monorepo 目录结构
my-monorepo/
├── apps/
│   ├── web/           # 主站应用
│   │   ├── package.json
│   │   └── src/
│   └── admin/         # 管理后台
│       ├── package.json
│       └── src/
├── packages/
│   ├── ui/            # 共享 UI 组件库
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── utils/         # 共享工具函数
│   │   ├── package.json
│   │   └── src/
│   └── tsconfig/      # 共享 TypeScript 配置
│       ├── base.json
│       └── react.json
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

#### 共享包设计

```json
// packages/ui/package.json
{
  "name": "@myrepo/ui",
  "version": "0.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

```tsx
// packages/ui/src/index.ts —— 导出入口
export { Button } from './components/Button';
export { Modal } from './components/Modal';
export { Input } from './components/Input';
export { Toast } from './components/Toast';
```

#### Monorepo 的 CI/CD 策略

```yaml
# GitHub Actions —— 只构建和测试受影响的包
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Turborepo 需要完整的 git 历史

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      # Turborepo 会自动识别哪些包发生了变化
      # 只构建和测试受影响的包及其依赖
      - run: pnpm turbo build test lint
```

---

### 2. 组件库设计与开发

#### 组件 API 设计原则

```
组件 API 设计的 5 个原则：

1. 一致性    → 所有组件的 API 风格统一
   示例：size 都用 'sm' | 'md' | 'lg'
         variant 都用 'primary' | 'secondary' | 'outline'

2. 可控性    → 同时支持受控和非受控模式
   示例：<Input value={val} onChange={fn} />    // 受控
         <Input defaultValue="初始值" />        // 非受控

3. 可扩展性  → 提供转义舱（escape hatch）
   示例：className / style / as prop
         <Button as="a" href="/link">链接按钮</Button>

4. 可访问性  → 内置 ARIA 属性
   示例：role, aria-label, aria-expanded 等

5. 可组合性  → 通过 children / render prop 支持自定义
   示例：<Modal><Modal.Header /><Modal.Body /></Modal>
```

```tsx
// Button 组件 —— 良好的 API 设计示例
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 按钮类型 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 是否加载中 */
  isLoading?: boolean;
  /** 图标（渲染在文字前面） */
  icon?: React.ReactNode;
  /** 整体宽度 */
  fullWidth?: boolean;
  /** 渲染为其他元素 */
  as?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = 'md', variant = 'primary', isLoading, icon, fullWidth, as: Component = 'button', children, disabled, ...rest }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn('btn', `btn-${variant}`, `btn-${size}`, fullWidth && 'btn-full')}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? <Spinner className="btn-spinner" /> : icon}
        {children}
      </Component>
    );
  }
);
```

#### Storybook 文档自动生成

```bash
# 安装 Storybook
npx storybook@latest init
```

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'], // 自动生成文档
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};
```

#### 组件版本管理（Changesets）

```bash
# 安装 Changesets
pnpm add -Dw @changesets/cli
pnpm changeset init
```

```bash
# 发布新版本流程
pnpm changeset         # 选择变更的包和版本类型
pnpm changeset version # 更新版本号和 CHANGELOG
pnpm changeset publish # 发布到 npm
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

#### 主题系统实现

```tsx
// 设计令牌（Design Tokens）
const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    gray: {
      50: '#f9fafb',
      900: '#111827',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  fontSizes: {
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
  },
} as const;

// CSS Variables 方案（推荐）
// 在 :root 或 [data-theme="dark"] 中定义变量
const themeVars = {
  light: `
    --color-primary: ${tokens.colors.primary[600]};
    --color-bg: #ffffff;
    --color-text: ${tokens.colors.gray[900]};
    --color-border: ${tokens.colors.gray[50]};
  `,
  dark: `
    --color-primary: ${tokens.colors.primary[400]};
    --color-bg: ${tokens.colors.gray[900]};
    --color-text: #f9fafb;
    --color-border: ${tokens.colors.gray[700]};
  `,
};

// 在组件中使用 CSS Variables
function ThemedButton() {
  return (
    <button className="themed-btn">Click me</button>
  );
}

// CSS
// .themed-btn { background: var(--color-primary); color: var(--color-text); }
```

---

### 3. API 层架构设计

#### API Client 封装

```tsx
// lib/api-client.ts —— Axios 实例封装
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 —— 自动附加 token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 —— 统一错误处理
apiClient.interceptors.response.use(
  (response) => response.data, // 直接返回 data
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // token 过期，跳转登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // 统一错误提示
    const message = (error.response?.data as any)?.message || error.message;
    toast.error(message);

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### React Query 使用模式

```tsx
// hooks/useUsers.ts —— 封装 API Hook
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

// 查询用户列表
export function useUsers(params: { page: number; pageSize: number }) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => apiClient.get('/users', { params }),
    placeholderData: (oldData) => oldData, // 翻页时保留旧数据
  });
}

// 查询单个用户
export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => apiClient.get(`/users/${id}`),
    enabled: !!id, // id 存在时才请求
  });
}

// 创建用户（乐观更新）
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => apiClient.post('/users', data),
    onSuccess: () => {
      // 创建成功后，使用户列表缓存失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('用户创建成功');
    },
  });
}

// 删除用户（乐观更新）
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/users/${id}`),
    onMutate: async (id) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['users'] });

      // 保存当前缓存
      const previousUsers = queryClient.getQueryData(['users']);

      // 乐观更新：立即从列表中移除
      queryClient.setQueryData(['users'], (old: any) => ({
        ...old,
        items: old.items.filter((u: any) => u.id !== id),
      }));

      return { previousUsers };
    },
    onError: (_err, _id, context) => {
      // 出错时回滚
      queryClient.setQueryData(['users'], context?.previousUsers);
      toast.error('删除失败');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

#### API 响应类型统一处理

```tsx
// types/api.ts
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

// hooks/useUsers.ts
export function useUsers(params: { page: number }) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['users', params],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        '/users',
        { params }
      );
      return res.data; // 自动推导类型
    },
  });
}
```

#### 请求取消和竞态条件处理

```tsx
import { useEffect, useRef, useState } from 'react';

// 方案 1：使用 AbortController
function useSearch(query: string) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // 取消上一次未完成的请求
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setResults(data);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('搜索失败:', err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  return { results, loading };
}

// 方案 2：React Query 自动处理竞态
// React Query 内置了竞态条件处理，每次新的请求会自动取消上一个
export function useSearchWithRQ(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => apiClient.get('/search', { params: { q: query } }),
    enabled: !!query.trim(),
  });
}
```

---

### 4. CI/CD 与自动化部署

#### GitHub Actions 工作流配置

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ─── 第 1 步：代码质量检查 ───
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check  # tsc --noEmit

  # ─── 第 2 步：测试 ───
  test:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # ─── 第 3 步：构建 ───
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      # 上传构建产物
      - uses: actions/upload-artifact@v4
        with:
          name: build-dist
          path: dist/

  # ─── 第 4 步：部署（仅 main 分支） ───
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          name: build-dist
          path: dist/

      # 部署到 Vercel（示例）
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### 自动化版本管理和 Changelog 生成

```bash
# 安装 standard-version（语义化版本管理）
pnpm add -Dw standard-version
```

```json
// package.json
{
  "scripts": {
    "release": "standard-version",
    "release:first": "standard-version --first-release"
  }
}
```

```
版本号规范（SemVer）：
  major.minor.patch

  • patch (1.0.0 → 1.0.1) ：Bug 修复，向后兼容
  • minor (1.0.0 → 1.1.0) ：新功能，向后兼容
  • major (1.0.0 → 2.0.0) ：破坏性变更

  commit message 约定：
    feat: 新功能 → 自动 bump minor
    fix: 修复   → 自动 bump patch
    BREAKING CHANGE → 自动 bump major
```

```bash
# 使用方式
git add .
git commit -m "feat: 添加用户搜索功能"
pnpm release   # 自动更新版本号和 CHANGELOG.md
git push --follow-tags
```

#### Lighthouse 性能评分集成

```yaml
# 在 CI 中集成 Lighthouse 检查
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    configPath: .lighthouserc.json
    uploadArtifacts: true
```

```json
// .lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

### 5. 项目性能优化实战 Checklist

#### 代码分割策略

```tsx
// 路由级代码分割（React.lazy + Suspense）
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}

// 组件级代码分割（非首屏关键组件）
function ProductPage() {
  return (
    <div>
      <ProductInfo /> {/* 首屏关键，正常加载 */}
      <Suspense fallback={<CommentsSkeleton />}>
        <LazyComments /> {/* 评论区，懒加载 */}
      </Suspense>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <LazyRecommendations /> {/* 推荐区，懒加载 */}
      </Suspense>
    </div>
  );
}

const LazyComments = lazy(() => import('./components/Comments'));
const LazyRecommendations = lazy(() => import('./components/Recommendations'));
```

#### 图片优化

```tsx
// 1. 响应式图片
<img
  srcSet="
    small.jpg 320w,
    medium.jpg 640w,
    large.jpg 1024w
  "
  sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1024px"
  src="medium.jpg"
  alt="响应式图片示例"
  loading="lazy"
/>

// 2. 图片懒加载
<img src={imageUrl} alt={alt} loading="lazy" decoding="async" />

// 3. WebP 格式（现代浏览器）+ JPEG 降级
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="WebP 降级" loading="lazy" />
</picture>
```

#### 打包体积分析

```bash
# Vite 项目
pnpm add -D vite-plugin-visualizer
```

```tsx
// vite.config.ts
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,              // 自动打开浏览器
      gzipSize: true,          // 显示 gzip 压缩后大小
      brotliSize: true,        // 显示 brotli 压缩后大小
      filename: 'stats.html',  // 输出文件
    }),
  ],
});
```

```bash
# Webpack 项目
pnpm add -D webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: true }),
  ],
};
```

#### 首屏加载优化

```tsx
// Skeleton 加载占位（首屏优化）
function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" /> {/* 标题骨架 */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded" /> {/* 卡片骨架 */}
        ))}
      </div>
    </div>
  );
}

// 预加载关键资源（index.html）
/*
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preconnect" href="https://api.myapp.com" />
<link rel="dns-prefetch" href="https://cdn.myapp.com" />
*/
```

#### Core Web Vitals 优化指南

| 指标 | 含义 | 目标 | 优化方向 |
|------|------|------|---------|
| **LCP** | 最大内容绘制 | < 2.5s | 服务端渲染、图片优化、CDN |
| **INP** | 交互到下一帧绘制 | < 200ms | 减少主线程阻塞、代码分割 |
| **CLS** | 累积布局偏移 | < 0.1 | 设置图片尺寸、避免动态插入内容 |

```tsx
// LCP 优化：预加载关键图片
<img
  src={heroImage}
  alt="Hero"
  width={1200}        // ⭐ 设置尺寸防止 CLS
  height={600}
  priority            // Next.js: 预加载 LCP 图片
  fetchPriority="high" // 原生: 高优先级加载
/>

// INP 优化：避免主线程阻塞
// ❌ 不好：在渲染期间进行大量计算
function HeavyComponent({ data }) {
  const sorted = data.sort(complexSort).filter(complexFilter); // 阻塞主线程
  return <List items={sorted} />;
}

// ✅ 好：用 useDeferredValue 或 useMemo
function HeavyComponent({ data }) {
  const deferredData = useDeferredValue(data);
  const sorted = useMemo(() => deferredData.sort(complexSort).filter(complexFilter), [deferredData]);
  return <List items={sorted} />;
}

// CLS 优化：为图片/视频设置固定尺寸比例
function ResponsiveImage({ src, alt }) {
  return (
    <div style={{ aspectRatio: '16/9', width: '100%', background: '#f0f0f0' }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
    </div>
  );
}
```

✅ **性能优化 Checklist：**

```
□ 路由级代码分割（React.lazy）
□ 非首屏组件懒加载
□ 图片使用 WebP + 响应式尺寸 + loading="lazy"
□ 关键字体使用 font-display: swap
□ 使用 CSS 容器替代 JS 动画（transform / opacity）
□ 列表渲染使用虚拟滚动（react-window / @tanstack/virtual）
□ API 数据使用 React Query 缓存
□ 避免在渲染路径中创建新对象/函数（useMemo / useCallback）
□ 第三方库按需导入（lodash-es / @ant-design/icons）
□ Lighthouse 评分 > 90 分
□ LCP < 2.5s, INP < 200ms, CLS < 0.1
```

---

[→ 19 - 服务端渲染](../19-server-side-rendering/)
