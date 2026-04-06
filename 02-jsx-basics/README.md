# 02 - JSX 基础语法

## 🎯 本节目标
- 理解 JSX 的本质和作用
- 掌握 JSX 的基本语法规则
- 学会在 JSX 中使用 JavaScript 表达式
- 了解 JSX 与普通 HTML 的区别

---

## 📖 什么是 JSX？

### 📌 一句话定义

**JSX（JavaScript XML）** 是 React 发明的一种语法扩展，让你可以在 JavaScript 代码中直接编写类似 HTML 的标记。

### 📌 用大白话说

想象你写网页时，通常需要两样东西：
1. **HTML 文件**——写页面结构
2. **JavaScript 文件**——写交互逻辑

但问题是，HTML 和 JavaScript 是**分开**的。当你想在 JavaScript 中创建一个按钮，你得这么写：

```javascript
// 传统方式：在 JS 中创建 DOM 元素（又丑又长）
const button = document.createElement('button');
button.textContent = '点击我';
button.className = 'btn';
button.addEventListener('click', () => {
  alert('你点击了按钮！');
});
document.body.appendChild(button);
```

而使用 JSX，你可以直接这样写：

```jsx
// JSX 方式：在 JS 中写"HTML"，简洁又直观
function App() {
  return (
    <button className="btn" onClick={() => alert('你点击了按钮！')}>
      点击我
    </button>
  );
}
```

> **核心概念**：JSX 让你用"写 HTML"的方式来"写 JavaScript"，让代码更直观、更好读。

---

## 🔍 JSX 的本质是什么？

### 📌 它不是魔法！

JSX 看起来像 HTML，但它**不是** HTML。浏览器并不认识 JSX。在代码运行之前，JSX 会被一个工具（叫 Babel 或 Vite 内置的编译器）**翻译**成普通的 JavaScript 代码。

来看看翻译过程：

```jsx
// ========== 你写的 JSX ==========
const element = <h1 className="title">Hello, world!</h1>;

// ========== JSX 被翻译成（React.createElement 调用）==========
const element = React.createElement(
  'h1',                          // 第1个参数：标签名
  { className: 'title' },        // 第2个参数：属性对象
  'Hello, world!'                // 第3个参数：子元素（内容）
);

// ========== React.createElement 返回的就是一个普通的 JS 对象 ==========
// 最终 React 拿到这个对象，把它转换成真实的 DOM 元素，显示在页面上
```

### 📌 为什么要知道这个？

因为理解 JSX 的本质，你就能明白：

1. **JSX 中的标签名可以是任何东西**——`<div>` 是 HTML 标签，`<MyButton>` 是你的自定义组件，它们最终都变成 `React.createElement()` 调用
2. **JSX 中的属性名有特殊规则**——因为它们是 JavaScript 对象的属性名，所以要遵循 JavaScript 命名规则（比如用 `className` 而不是 `class`）
3. **JSX 不是模板语言**——它是 JavaScript 的语法扩展，你可以使用所有 JavaScript 的能力（变量、函数、表达式等）

> **小白的疑问**："我需要手动写 `React.createElement` 吗？"
> 答：不需要！你只需要写 JSX，编译工具会自动帮你转换。了解这个只是帮你理解 JSX 是怎么工作的。

---

## 📝 JSX 基础语法

### 1. 基本元素

#### 📌 HTML 元素

JSX 支持所有 HTML 标签，写法几乎和 HTML 一样：

```jsx
// 常见的 HTML 元素
<div>这是一个 div 容器</div>
<span>这是一个行内元素</span>
<p>这是一个段落</p>
<h1>这是一级标题</h1>

// 自闭合标签（没有子内容的标签，必须加 /）
<img src="photo.jpg" alt="照片" />
<input type="text" placeholder="请输入" />
<br />
<hr />
```

#### 📌 自定义组件元素

```jsx
// 以大写字母开头的标签 = 自定义组件
<MyComponent />          // 你的自定义组件
<UserCard name="张三" />  // 带属性的自定义组件
<Button variant="primary">提交</Button>  // 带子内容的组件

// 以小写字母开头的标签 = HTML 原生标签
<div />    // HTML div 元素
<span />   // HTML span 元素
```

#### ⚠️ 大小写非常重要！

```jsx
// ✅ 大写开头 → React 认为这是你的自定义组件
function MyButton() {
  return <button>点击我</button>;
}

// 在 JSX 中使用
<MyButton />  // 正确！React 会渲染 MyButton 组件

// ❌ 小写开头 → React 认为这是 HTML 原生标签
<mybutton />  // 错误！浏览器不认识 <mybutton> 这个标签
```

> **为什么？** 因为 React 通过**首字母大小写**来区分"HTML 原生标签"和"自定义组件"。这是一个简单但重要的规则。

---

### 2. 表达式嵌入（花括号 {}）

#### 📌 是什么？

在 JSX 中，你可以用**花括号 `{}`** 来嵌入任何 JavaScript 表达式。"表达式"就是一段能计算出某个值的代码。

#### 📌 怎么用？

```jsx
function Greeting({ name, age, isAdmin }) {
  const greeting = `你好, ${name}！`;  // 模板字面量（也是表达式）
  const now = new Date().toLocaleString();  // 函数调用（也是表达式）

  return (
    <div>
      {/* 1. 变量 */}
      <h1>{greeting}</h1>

      {/* 2. 数字 */}
      <p>年龄: {age}</p>

      {/* 3. 布尔值（不会直接显示 true/false，而是什么都不显示） */}
      <span>管理员: {isAdmin ? '是' : '否'}</span>

      {/* 4. 对象属性 */}
      <p>姓名: {name}</p>

      {/* 5. 函数调用 */}
      <p>当前时间: {now}</p>

      {/* 6. 三元表达式（条件渲染） */}
      {isAdmin ? <span className="badge">管理员</span> : <span>普通用户</span>}

      {/* 7. 数学运算 */}
      <p>明年你 {age + 1} 岁</p>

      {/* 8. 数组方法 */}
      <p>{name.split('').reverse().join('')}</p>
    </div>
  );
}
```

#### ⚠️ 花括号里不能放什么？

```jsx
// ❌ 不能放语句（statement），只能放表达式（expression）
<div>{if (true) { return 'yes'; }}</div>     // 错误！if 是语句

// ✅ 可以放三元表达式（它是表达式）
<div>{true ? 'yes' : 'no'}</div>             // 正确

// ❌ 不能放 for 循环
<div>{for (let i = 0; i < 3; i++) { ... }}</div>  // 错误！

// ✅ 可以用 map（它是表达式）
<div>{[1, 2, 3].map(n => <span key={n}>{n}</span>)}</div>  // 正确
```

> **表达式的定义**：任何能写在 `= 右边`的、能计算出某个值的东西，就是表达式。
> - `1 + 1` 是表达式（结果是 2）
> - `name` 是表达式（结果是变量的值）
> - `true ? 'a' : 'b'` 是表达式（结果是 'a' 或 'b'）
> - `if`、`for`、`while` 是**语句**，不是表达式

---

### 3. 属性（Props / Attributes）

#### 📌 是什么？

属性就是写在标签上的"配置项"，用来定制元素的行为和外观。

#### 📌 两种写法：

```jsx
// ====== 1. 字符串属性（用引号包裹）======
<img src="https://example.com/photo.jpg" alt="照片" />
<button type="submit">提交</button>

// ====== 2. 表达式属性（用花括号包裹）======
<img src={imageUrl} />                          {/* 变量 */}
<div className={isActive ? 'active' : ''}>      {/* 三元表达式 */}
<p>计算结果：{2 + 3}</p>                        {/* 数学运算 */}
<button disabled={isDisabled}>提交</button>      {/* 布尔值 */}
<UserProfile {...userData} />                    {/* 展开运算符 */}
```

#### 📌 什么时候用引号，什么时候用花括号？

| 场景 | 写法 | 示例 |
|------|------|------|
| 固定的字符串 | 用引号 `"..."` | `className="container"` |
| 变量或表达式 | 用花括号 `{...}` | `className={myClass}` |
| 字符串拼接 | 用花括号 + 模板字面量 | `className={`btn btn-${size}`}` |

#### 📌 className —— JSX 中最常犯的错

```jsx
// ❌ 错误！在 JSX 中不能用 class（因为 class 是 JavaScript 的保留字）
<div class="container">内容</div>

// ✅ 正确！用 className 替代 class
<div className="container">内容</div>
```

**为什么？** 因为 JSX 最终会被编译成 JavaScript 对象，而 `class` 是 JavaScript 的保留关键字（用于定义类 `class MyClass {}`）。为了避免冲突，React 选择使用 `className`。

> **小白的疑惑**："但是用 class 也不一定会报错啊？"
> 虽然有时候用了 `class` 也能"正常"显示，但 React 会在控制台给出警告。更重要的是，某些 CSS-in-JS 库或 SSR 场景下，`class` 可能导致问题。所以一定要养成用 `className` 的习惯。

#### 📌 htmlFor —— 和 className 类似的原因

```jsx
// ❌ 错误！for 是 JavaScript 的保留字（用于 for 循环）
<label for="email">邮箱</label>

// ✅ 正确！用 htmlFor 替代 for
<label htmlFor="email">邮箱</label>
```

#### 📌 布尔属性 —— 简写技巧

```jsx
// 以下两种写法是等价的：
<input disabled={true} />
<input disabled />   {/* 简写！省略 {true}，更简洁 */}

// 如果布尔值为 false，属性不会被渲染到 DOM 中
<input disabled={false} />
// 渲染结果：<input />（没有 disabled 属性）

// 实际应用示例
<button disabled={!isFormValid}>提交</button>  {/* 表单不合法时禁用按钮 */}
<input readOnly={isReadOnly} />                 {/* 只读模式 */}
<input required />                              {/* 必填字段 */}
```

#### 📌 展开运算符 —— 批量传递属性

```jsx
// 场景：你有一个包含很多属性的对象，想全部传给组件
const userData = {
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com',
  phone: '13800138000'
};

// 不用展开运算符（很啰嗦）
<UserCard name={userData.name} age={userData.age} email={userData.email} phone={userData.phone} />

// 用展开运算符（简洁！）
<UserCard {...userData} />

// 等价于：
// <UserCard name="张三" age={25} email="zhangsan@example.com" phone="13800138000" />
```

> **注意**：展开运算符 `...` 会把对象的所有属性"展开"成独立的 props。这是一个 JavaScript 语法特性，不是 React 特有的。

---

### 4. 子元素（Children）

#### 📌 是什么？

写在**开始标签和结束标签之间的内容**就是"子元素"（children）。

```jsx
// 1. 文本子元素
<h1>这是标题文本</h1>    {/* "这是标题文本" 就是子元素 */}
<p>Hello, React!</p>

// 2. 多个子元素
<div>
  <p>第一段</p>          {/* <p> 第一段 </p> 是子元素 */}
  <p>第二段</p>          {/* <p> 第二段 </p> 也是子元素 */}
</div>

// 3. 元素嵌套
<div>
  <header>
    <h1>标题</h1>        {/* <h1> 是 <header> 的子元素，<header> 是 <div> 的子元素 */}
  </header>
  <main>
    <p>正文</p>
  </main>
</div>

// 4. 表达式作为子元素
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// 5. 组件作为子元素
<Card>
  <h2>卡片标题</h2>      {/* 这些都是 Card 组件的 children */}
  <p>卡片内容</p>
</Card>
```

---

## ⚠️ JSX 规则与注意事项

### 1. 必须有一个根元素（或使用 Fragment）

#### 📌 是什么？

JSX 表达式必须返回**单个根元素**。你不能同时返回多个并列的元素。

#### 📌 为什么？

因为 JSX 最终会变成 `React.createElement()` 调用，而一个函数调用只能返回一个值。就像你不能写 `return 1, 2, 3` 一样。

#### 📌 怎么解决？

```jsx
// ❌ 错误：多个根元素
function App() {
  return (
    <h1>标题</h1>
    <p>段落</p>
  );
  // 等价于 return (h1元素, p元素)，JavaScript 不允许这样
}

// ✅ 方案一：用一个 div 包裹
function App() {
  return (
    <div>
      <h1>标题</h1>
      <p>段落</p>
    </div>
  );
}

// ✅ 方案二：使用 React Fragment（推荐！不产生额外的 DOM 节点）
function App() {
  return (
    <>
      <h1>标题</h1>
      <p>段落</p>
    </>
  );
}
// <></> 是 <React.Fragment></React.Fragment> 的简写
```

#### 📌 Fragment 为什么更好？

```jsx
// 用 div 包裹 → 在页面上会产生一个额外的 <div> 节点
<div>                          {/* 这个 div 是多余的，可能破坏 CSS 布局 */}
  <td>单元格1</td>
  <td>单元格2</td>
</div>

// 用 Fragment 包裹 → 不会产生额外的 DOM 节点
<>
  <td>单元格1</td>             {/* 直接渲染两个 td，没有多余节点 */}
  <td>单元格2</td>
</>

// 实际场景：在 <table> 中渲染多个 <tr> 时，Fragment 非常有用
function Table() {
  return (
    <table>
      <tbody>
        <>
          <tr><td>行1</td></tr>
          <tr><td>行2</td></tr>
        </>
      </tbody>
    </table>
  );
}
```

---

### 2. 必须闭合所有标签

#### 📌 是什么？

在 HTML 中，有些标签是不需要闭合的（比如 `<br>`、`<img>`、`<input>`）。但在 JSX 中，**所有标签必须闭合**。

#### 📌 为什么？

因为 JSX 更接近 XML 规范，而 XML 要求所有标签必须闭合。这有助于避免歧义。

```jsx
// ❌ HTML 风格（JSX 中不允许）
<br>
<input type="text">
<img src="photo.jpg">

// ✅ JSX 风格（自闭合）
<br />
<input type="text" />
<img src="photo.jpg" />
<hr />

// ✅ 配对标签正常闭合
<div></div>
<span>内容</span>
<p>段落</p>
```

---

### 3. camelCase 命名规则

#### 📌 是什么？

在 JSX 中，所有属性名都使用 **camelCase（小驼峰）** 命名法，而不是 HTML 中的全小写。

#### 📌 为什么？

因为 JSX 中的属性最终会变成 JavaScript 对象的属性名。JavaScript 的惯例是用 camelCase 命名。

#### 📌 常见映射表：

| HTML 属性 | JSX 属性 | 说明 |
|-----------|----------|------|
| `class` | `className` | `class` 是 JS 保留字 |
| `for` | `htmlFor` | `for` 是 JS 保留字 |
| `tabindex` | `tabIndex` | camelCase 命名 |
| `onclick` | `onClick` | 驼峰命名 |
| `onchange` | `onChange` | 驼峰命名 |
| `onsubmit` | `onSubmit` | 驼峰命名 |
| `background-color`（CSS） | `backgroundColor`（内联样式） | CSS 属性也用驼峰 |
| `font-size`（CSS） | `fontSize`（内联样式） | CSS 属性也用驼峰 |

#### 📌 事件处理命名对比：

```jsx
// HTML 中的事件（全小写）
<button onclick="handleClick()">点击</button>
<input onchange="handleChange()" />
<form onsubmit="handleSubmit()"></form>

// JSX 中的事件（camelCase，用花括号传递函数引用）
<button onClick={handleClick}>点击</button>
<input onChange={handleChange} />
<form onSubmit={handleSubmit}></form>
```

> **特别注意**：在 HTML 中，事件处理通常是字符串 `"handleClick()"`。但在 JSX 中，事件处理是函数引用 `handleClick`（不加引号、不加括号）。加括号 `handleClick()` 会在渲染时立即执行，而不是在点击时执行。

---

### 4. 内联样式

#### 📌 是什么？

在 JSX 中，你可以通过 `style` 属性直接给元素添加样式。和 HTML 不同的是，JSX 中的 `style` 值必须是一个 **JavaScript 对象**。

#### 📌 为什么是对象而不是字符串？

因为 JSX 的理念是"用 JavaScript 做所有事情"。使用对象可以让你：
- 动态计算样式值
- 利用 JavaScript 的变量和表达式
- 获得更好的类型检查（配合 TypeScript）

#### 📌 怎么用？

```jsx
// ❌ 错误：字符串形式（HTML 的写法，JSX 不支持）
<div style="color: red; font-size: 16px;">内容</div>

// ✅ 正确：对象形式（注意有两层花括号！）
<div style={{ color: 'red', fontSize: '16px' }}>内容</div>
// 外层 {} = JSX 表达式
// 内层 {} = JavaScript 对象

// ✅ 推荐：把样式对象提取为变量
const myStyle = {
  color: 'red',
  fontSize: '16px',
  backgroundColor: '#f0f0f0',  // 注意：CSS 的 background-color 变成了 backgroundColor
  borderRadius: '8px',
  padding: '10px 20px',
};

<div style={myStyle}>内容</div>

// ✅ 动态样式
function Button({ isPrimary }) {
  const buttonStyle = {
    backgroundColor: isPrimary ? '#007bff' : '#6c757d',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
  };

  return <button style={buttonStyle}>{isPrimary ? '主要按钮' : '次要按钮'}</button>;
}
```

#### 📌 CSS 属性名转换规则：

| CSS 属性 | JSX 内联样式 | 原因 |
|----------|-------------|------|
| `background-color` | `backgroundColor` | 驼峰命名 |
| `font-size` | `fontSize` | 驼峰命名 |
| `margin-top` | `marginTop` | 驼峰命名 |
| `z-index` | `zIndex` | 驼峰命名 |
| `border-radius` | `borderRadius` | 驼峰命名 |
| `line-height` | `lineHeight` | 驼峰命名 |
| `font-weight` | `fontWeight` | 驼峰命名 |

> **规律**：所有 CSS 属性名中带 `-` 的，去掉 `-`，后面的单词首字母大写。
> **特例**：`-webkit-` 等浏览器前缀在 JSX 中用驼峰：`WebkitTransition`（首字母大写）。

> **实用建议**：虽然内联样式很方便，但在大型项目中，推荐使用 CSS Modules 或 CSS-in-JS 库（如 styled-components）来管理样式，这样更易维护。

---

## 🔥 JSX 高级用法

### 1. 条件渲染

#### 📌 是什么？

根据条件来决定是否显示某个元素，或者显示不同的元素。

#### 📌 三种常用方式：

```jsx
function UserProfile({ isLoggedIn, user, isLoading }) {

  // ====== 方式一：三元运算符（二选一）======
  // 适合：需要在两个元素之间切换
  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h2>欢迎回来，{user.name}！</h2>
          <p>你的邮箱：{user.email}</p>
        </div>
      ) : (
        <div>
          <h2>请先登录</h2>
          <button>登录</button>
        </div>
      )}
    </div>
  );

  // ====== 方式二：逻辑与 &&（显示或隐藏）======
  // 适合：某个条件为 true 时才显示，否则什么都不显示
  // 注意：左侧必须是可以转为布尔值的表达式
  return (
    <div>
      <h2>用户资料</h2>
      {isAdmin && <span className="badge">管理员</span>}
      {user.vip && <span className="vip-badge">VIP 用户</span>}
      {showWarning && (
        <div className="warning">
          ⚠️ 你的账户即将过期
        </div>
      )}
    </div>
  );

  // ====== 方式三：提前 return（复杂条件）======
  // 适合：条件判断逻辑比较复杂时
  if (isLoading) {
    return <div>加载中...</div>;
  }
  if (!isLoggedIn) {
    return <div>请先登录</div>;
  }
  if (!user) {
    return <div>用户不存在</div>;
  }
  // 以上条件都不满足时，正常渲染
  return <div>欢迎，{user.name}！</div>;
}
```

#### ⚠️ `&&` 的一个陷阱

```jsx
// ❌ 危险！如果 count 是 0，会显示 "0" 在页面上
// 因为 0 是 falsy 值，但 JSX 会渲染数字 0
<div>
  {count && <span>有 {count} 条消息</span>}
</div>
// 当 count = 0 时，页面会显示 "0"

// ✅ 安全！显式转换为布尔值
<div>
  {count > 0 && <span>有 {count} 条消息</span>}
</div>

// ✅ 或者用三元运算符
<div>
  {count > 0 ? <span>有 {count} 条消息</span> : null}
</div>
```

> **小白的疑问**："什么是 falsy 值？"
> 在 JavaScript 中，以下值在条件判断中会被视为 `false`（叫 falsy 值）：
> `false`、`0`、`""`（空字符串）、`null`、`undefined`、`NaN`
> 其他所有值都是 truthy（视为 `true`）。

---

### 2. 列表渲染

#### 📌 是什么？

用一个数组中的数据，重复生成多个相似的 JSX 元素。这在前端开发中非常常见——比如渲染用户列表、商品列表、消息列表等。

#### 📌 怎么用？

```jsx
const fruits = [
  { id: 1, name: '苹果', color: '红色', price: 5.5 },
  { id: 2, name: '香蕉', color: '黄色', price: 3.0 },
  { id: 3, name: '橙子', color: '橙色', price: 4.5 },
];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit.id}>
          {fruit.name} - {fruit.color} - ¥{fruit.price}
        </li>
      ))}
    </ul>
  );
}
```

#### 📌 key 属性 —— 列表渲染的"身份证"

```jsx
// 每个列表项都需要一个唯一的 key 属性
// key 帮助 React 识别哪些元素发生了变化，从而高效更新 DOM

// ✅ 好的 key：稳定且唯一
<li key={user.id}>         {/* 数据的唯一 ID（最佳选择）*/ }
<li key={item.sku}>        {/* 商品编号 */}
<li key={`${row.id}-${col.id}`}>  {/* 组合键 */}

// ❌ 不好的 key：不稳定的值
<li key={Math.random()}>   {/* 每次渲染都变，完全没用 */}
<li key={index}>           {/* 数组索引，只在列表不会增删时可以用 */}
```

> **为什么不能用 index 做 key？**
> 因为当列表发生变化（插入、删除、排序）时，index 会改变，React 就无法正确追踪哪个元素是哪个了。
> 
> 例如：你有一个列表 `[A, B, C]`，它们的 key 分别是 `0, 1, 2`。
> 如果你在前面插入一个 `X`，列表变成 `[X, A, B, C]`，key 变成了 `0, 1, 2, 3`。
> React 会认为 key=0 的元素从 A 变成了 X，key=1 的从 B 变成了 A……
> 结果就是 React 会错误地复用/更新元素，导致页面显示异常。
> 
> **但如果列表是静态的、不会增删排序**，用 index 做 key 也是可以的（虽然不推荐）。

---

### 3. 注释

#### 📌 在 JSX 中写注释的特殊写法

```jsx
function App() {
  return (
    <div>
      {/* 这是 JSX 中的注释方式 —— 用花括号包裹 /* */}

      {/* 
         多行注释也可以这样写
         第二行注释
         第三行注释
      */}

      <h1>标题</h1>

      {
        // 这种单行注释方式也可以（写在花括号内）
      }

      {/* 
        ⚠️ 注意：不能直接在 JSX 标签旁边写 HTML 风格的注释
        <!-- 这是 HTML 注释，在 JSX 中不支持！ -->
      */}

      <p>内容</p>
    </div>
  );
}
```

> **为什么注释要这么写？** 因为 JSX 本质上是 JavaScript，而 `/* */` 是 JavaScript 的注释语法。花括号 `{}` 告诉 JSX "这里面是 JavaScript 代码"。

---

### 4. 模板字面量与 className 动态拼接

#### 📌 实际开发中非常常见的场景

```jsx
// 场景：根据状态动态生成 className
function Button({ size, variant, isActive, isDisabled }) {
  // 使用模板字面量拼接 className
  const className = `btn btn-${size} btn-${variant} ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;

  return (
    <button className={className.trim()} disabled={isDisabled}>
      提交
    </button>
  );
}

// 使用示例
<Button size="large" variant="primary" isActive={true} />
// className 结果："btn btn-large btn-primary active "

// ⚠️ 注意末尾可能有多余的空格，用 .trim() 去除
// 或者用更优雅的方式：数组过滤
function Button2({ size, variant, isActive }) {
  const className = [
    'btn',
    `btn-${size}`,
    `btn-${variant}`,
    isActive ? 'active' : null,  // null 不会被渲染
  ]
    .filter(Boolean)  // 过滤掉 falsy 值（null, undefined, false, ''）
    .join(' ');       // 用空格连接

  return <button className={className}>提交</button>;
}
```

---

## 💡 最佳实践

### 1. 保持 JSX 简洁

```jsx
// ❌ 过于复杂的 JSX（嵌套太深，难以阅读）
return (
  <div>
    {users.map(user => (
      <div key={user.id}>
        <h3>{user.name}</h3>
        {user.posts.map(post => (
          <article key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            {post.comments.map(comment => (
              <div key={comment.id}>
                <strong>{comment.author}:</strong> {comment.text}
              </div>
            ))}
          </article>
        ))}
      </div>
    ))}
  </div>
);

// ✅ 拆分为小组件，逻辑清晰
function CommentItem({ comment }) {
  return (
    <div>
      <strong>{comment.author}:</strong> {comment.text}
    </div>
  );
}

function PostItem({ post }) {
  return (
    <article>
      <h4>{post.title}</h4>
      <p>{post.content}</p>
      {post.comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </article>
  );
}

function UserSection({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      {user.posts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}

function App() {
  return (
    <div>
      {users.map(user => (
        <UserSection key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### 2. 把复杂表达式提取为变量

```jsx
// ❌ JSX 中嵌入复杂的逻辑
return (
  <div>
    <h1>{user.firstName + ' ' + user.lastName}</h1>
    <p>{user.age >= 18 ? '成年人' : '未成年人'} - {user.role === 'admin' ? '管理员' : '普通用户'}</p>
  </div>
);

// ✅ 提前计算，让 JSX 保持简洁
const fullName = `${user.firstName} ${user.lastName}`;
const ageLabel = user.age >= 18 ? '成年人' : '未成年人';
const roleLabel = user.role === 'admin' ? '管理员' : '普通用户';

return (
  <div>
    <h1>{fullName}</h1>
    <p>{ageLabel} - {roleLabel}</p>
  </div>
);
```

### 3. 合理换行和缩进

```jsx
// ❌ 写在一行，难以阅读
<div><h1>{title}</h1><p>{description}</p><button onClick={handleClick}>{label}</button></div>

// ✅ 合理换行，每个元素一行
<div>
  <h1>{title}</h1>
  <p>{description}</p>
  <button onClick={handleClick}>
    {label}
  </button>
</div>
```

---

## ✅ 阶段检查清单

完成本节后，你应该能够：

- [ ] 解释 JSX 的本质（`React.createElement` 的语法糖）
- [ ] 在 JSX 中用 `{}` 正确嵌入 JavaScript 表达式
- [ ] 区分 JSX 和 HTML 的差异（`className`、`camelCase`、自闭合标签等）
- [ ] 使用三元运算符和 `&&` 进行条件渲染
- [ ] 使用 `map` 进行列表渲染，并正确使用 `key`
- [ ] 编写规范、可读性强的 JSX 代码
- [ ] 理解内联样式的对象语法和 CSS 属性名转换规则

---

## 📝 练习任务

### 任务 1：个人信息卡片
创建一个展示用户信息的卡片组件：
```jsx
// 要求包含：
- 用户头像（<img> 元素）
- 姓名、职位、公司信息
- 技能列表（使用数组 + map 渲染）
- 根据用户等级显示不同的徽章样式（条件渲染）
- 联系按钮（仅 VIP 用户显示）
```

### 任务 2：商品列表
创建一个商品列表组件：
```jsx
// 要求包含：
- 商品图片、名称、价格、描述
- 使用 map 渲染商品列表
- 根据库存状态显示不同样式（有货/缺货/预售）
- 价格超过 1000 的商品显示"热销"标签
- 使用内联样式实现不同的状态颜色
```

### 任务 3（思考题）
- 为什么 JSX 中的标签必须闭合？如果不闭合会发生什么？
- `className="btn"` 和 `className={"btn"}` 有什么区别？哪个更好？
- 如何在 JSX 中渲染 `null`、`undefined`、`false`、`true`？它们在页面上会显示什么？

---

## 🔬 JSX 的底层原理——编译与转换

> 这一节我们深入 JSX 的"幕后"，看看你写的 JSX 代码到底是怎么变成浏览器能识别的内容的。理解这些原理，能帮你更好地排查各种奇怪的报错。

### 1. JSX 到底是什么？——它不是 HTML！

#### JSX 只是 React.createElement() 的语法糖

我们前面说过 JSX 会被编译成 `React.createElement()` 调用。现在让我们更深入地看看这个过程：

```
你写的代码                    编译后的代码（自动完成，你看不见）
─────────────                ─────────────────────────────
<div className="app">        React.createElement(
  <h1>Hello</h1>               'div',
  <p>World</p>                 { className: 'app' },
</div>                         React.createElement('h1', null, 'Hello'),
                               React.createElement('p', null, 'World')
                             )
```

💡 **大白话**：JSX 就是一种"语法糖"——它让代码看起来像 HTML，但实际上是 JavaScript 函数调用的"甜衣包装"。就像 `arr.map()` 是 `Array.prototype.map.call(arr)` 的简写一样，JSX 是 `React.createElement()` 的简写。

#### createElement 返回的是什么？（React Element 对象）

`React.createElement()` 返回的**不是一个 DOM 节点**，而是一个**普通的 JavaScript 对象**（React Element）：

```javascript
// 你写的 JSX
const element = <h1 className="title" key="t1">Hello</h1>;

// 等价于
const element = React.createElement('h1', { className: 'title', key: 't1' }, 'Hello');

// React.createElement 返回的真实结构（简化版）：
const element = {
  $$typeof: Symbol(React.element),  // React 的"身份证标记"
  type: 'h1',                       // 元素类型：标签名或组件函数
  key: 't1',                        // 用于列表 diff 的 key
  ref: null,                        // DOM 引用（本例中没有）
  props: {                          // 所有属性和子元素
    className: 'title',
    children: 'Hello'               // 文本子元素
  }
};

// ⚠️ 注意：此时页面上还什么都没有！
// 这只是一个"描述对象"，就像一张"装修图纸"
// React 拿到这张图纸后，才会去真正创建 DOM 元素
```

> **类比**：React Element 就像一张**装修设计图**。设计图上写着"这里要放一张蓝色的沙发"，但它本身不是沙发。React 就是施工队，拿到设计图后才会去真正的房间里摆放家具（操作 DOM）。

#### React Element vs React Component vs Component Instance

这是 React 中最容易混淆的三个概念，让我们用类比来搞清楚：

| 概念 | 定义 | 类比 | 代码示例 |
|------|------|------|---------|
| **React Element** | `createElement()` 返回的 JS 对象，描述"要渲染什么" | 订单卡片（写着"一杯拿铁"） | `{ type: 'div', props: {...} }` |
| **React Component** | 你定义的函数或类，描述"怎么创建 Element" | 咖啡机（知道怎么做拿铁） | `function Coffee() { ... }` |
| **Component Instance** | 组件被调用后在内存中创建的对象 | 咖啡机做出来的那杯拿铁 | 每次渲染时调用函数产生的结果 |

```
React Component（咖啡机）──调用──→ React Element（订单）──→ React（施工队）──→ DOM（真实的沙发）

// Component 是一个"配方/蓝图"
function Button({ label }) {
  return <button>{label}</button>;  // 返回的是 Element，不是 DOM！
}

// 调用 Component 产生 Element
<Button label="提交" />
// → React 内部调用 Button({ label: "提交" })
// → 返回一个 React Element 对象 { type: Button, props: { label: "提交" } }

// React 拿到 Element 后，递归处理，最终生成真实 DOM
// → <button>提交</button>
```

---

### 2. Babel 如何编译 JSX？

#### @babel/plugin-transform-react-jsx 的工作原理

JSX 的编译是由 Babel（或 Vite 内置的编译器）完成的。核心插件是 `@babel/plugin-transform-react-jsx`。

编译过程：

```
┌──────────────┐    Babel 编译器     ┌─────────────────────────┐
│  你写的 JSX   │ ──────────────────→ │  浏览器能执行的 JS 代码   │
│              │                     │                         │
│ <div>Hello</div>│  AST 解析+转换   │ React.createElement(    │
│              │                     │   'div', null, 'Hello'  │
└──────────────┘                     └─────────────────────────┘
```

> 🔍 **AST（抽象语法树）**：Babel 不是简单地"字符串替换"，而是先把你的代码解析成一棵树结构（AST），然后对树进行变换，最后再从树生成新代码。就像翻译不是逐字替换，而是先理解句子结构再翻译。

#### JSX 编译前后的完整对比

```jsx
// ========== 示例 1：简单元素 ==========
// 编译前
const el = <div id="box">Hello</div>;
// 编译后
const el = React.createElement('div', { id: 'box' }, 'Hello');

// ========== 示例 2：嵌套元素 ==========
// 编译前
const el = (
  <div className="container">
    <h1>标题</h1>
    <ul>
      <li>项目1</li>
      <li>项目2</li>
    </ul>
  </div>
);
// 编译后
const el = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, '标题'),
  React.createElement(
    'ul',
    null,
    React.createElement('li', null, '项目1'),
    React.createElement('li', null, '项目2')
  )
);
// 💡 看到了吗？嵌套的 JSX 变成了嵌套的 createElement 调用
// 每一层标签都对应一个 createElement

// ========== 示例 3：带表达式的 JSX ==========
// 编译前
const name = 'React';
const el = <h1>Hello, {name}! {2 + 3}</h1>;
// 编译后（花括号内的表达式原样保留）
const name = 'React';
const el = React.createElement('h1', null, 'Hello, ', name, '! ', 2 + 3);

// ========== 示例 4：组件 ==========
// 编译前
function App() {
  return <MyButton label="Click" />;
}
// 编译后
function App() {
  return React.createElement(MyButton, { label: 'Click' });
}
// ⚠️ 注意：组件（大写开头）传的是变量引用，不是字符串！
// 原生标签（小写）传的是字符串 'div'
```

#### React 17 的 JSX Transform（不需要 import React 了）

在 React 16 及之前，每个使用 JSX 的文件都必须导入 React：

```jsx
// React 16 及之前：必须手动导入
import React from 'react';  // ⬅️ 不导入就会报错！

function App() {
  return <h1>Hello</h1>;  // 编译后会变成 React.createElement(...)
}
```

从 React 17 开始，引入了新的 JSX 编译方式：

```jsx
// React 17+：不需要手动导入 React 了！
function App() {
  return <h1>Hello</h1>;  // 编译后不再依赖 React.createElement
}
```

新旧编译方式对比：

```javascript
// ===== React 16 的编译方式（Classic Transform）=====
import React from 'react';

function App() {
  return <h1>Hello</h1>;
}

// 编译后：
function App() {
  return React.createElement('h1', null, 'Hello');
}

// ===== React 17+ 的编译方式（Automatic Transform）=====
// 不需要 import React 了！

import { jsx as _jsx } from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Hello' });
}
```

#### 为什么 React 17 改变了 JSX 编译方式？

| 原因 | 说明 |
|------|------|
| **减少样板代码** | 不再需要每个文件都 `import React` |
| **更好的 Tree Shaking** | 只引入实际用到的函数，而不是整个 React 对象 |
| **为未来做准备** | 为 React 编译器优化预留空间 |

> 💡 **大白话**：以前的 JSX 编译就像每次做菜都要把整个厨房搬过来（`import React`），但实际上你只需要用一把菜刀（`createElement`）。新编译方式直接给你菜刀就行了，不需要搬厨房。

---

### 3. React Element 的内部结构

#### 展示 React Element 对象的真实结构

让我们用代码直接打印一个 React Element 的完整结构：

```javascript
// 在浏览器控制台中运行
const element = <div className="app" key="k1" ref={null}>
  <h1>Hello</h1>
  <span>World</span>
</div>;

console.log(element);
// 输出（简化版）：
{
  $$typeof: Symbol(react.element),    // 🔑 React 内部用来识别 Element 的标记
  type: 'div',                         // 标签类型（原生标签是字符串，组件是函数/类）
  key: 'k1',                           // Diff 算法用来判断元素是否可复用
  ref: null,                           // DOM 节点引用（用于直接操作 DOM）
  props: {
    className: 'app',                  // 传入的属性
    children: [                        // 子元素（也是一个 React Element 数组）
      {
        $$typeof: Symbol(react.element),
        type: 'h1',
        key: null,
        ref: null,
        props: { children: 'Hello' }
      },
      {
        $$typeof: Symbol(react.element),
        type: 'span',
        key: null,
        ref: null,
        props: { children: 'World' }
      }
    ]
  }
}
```

> 🔍 **`$$typeof` 的作用**：这是一个安全机制。React 用 `Symbol(react.element)` 来标记真正的 React Element，防止恶意构造的对象被当作 React Element 来处理。类似于"工作证"——只有拿着工作证的人才能进入大楼。

#### 用代码手动创建 React Element 来理解本质

```jsx
import React from 'react';

// ===== 方式一：用 JSX（你平时写的）=====
const jsxElement = (
  <div className="greeting">
    <h1>Hello, {name}!</h1>
    <p>Welcome to React</p>
  </div>
);

// ===== 方式二：手动调用 createElement（完全等价）=====
const manualElement = React.createElement(
  'div',
  { className: 'greeting' },
  React.createElement('h1', null, 'Hello, ', name, '!'),
  React.createElement('p', null, 'Welcome to React')
);

// jsxElement === manualElement? 不会严格相等（不同的对象引用），
// 但它们描述的内容是完全相同的

// ===== 方式三：直接构造对象（React 内部做的事情）=====
// ⚠️ 一般不需要这样做，但有助于理解原理
const rawElement = {
  $$typeof: Symbol.for('react.element'),
  type: 'div',
  props: {
    className: 'greeting',
    children: [
      { $$typeof: Symbol.for('react.element'), type: 'h1', props: { children: 'Hello!' } },
      { $$typeof: Symbol.for('react.element'), type: 'p', props: { children: 'Welcome' } }
    ]
  }
};
// React 内部在渲染时，就是处理这种结构的对象
```

#### React.createElement 的完整参数解析

```javascript
React.createElement(
  type,      // 第1个参数：元素类型
  [config],  // 第2个参数：属性对象（可选）
  [...children]  // 第3+个参数：子元素（可变参数）
)
```

各参数详解：

```
┌─────────────────────────────────────────────────────────┐
│              React.createElement 参数说明                  │
├──────────┬──────────────────────────────────────────────┤
│  type    │ 'div'、'span'（HTML 标签 → 字符串）            │
│          │ MyButton（自定义组件 → 函数/类引用）           │
│          │ Fragment（Fragment → Symbol）                 │
├──────────┼──────────────────────────────────────────────┤
│  config  │ { className, onClick, style, ... }           │
│          │ 所有 HTML 属性 + key + ref                    │
│          │ key 和 ref 不会被传到 DOM 上                   │
├──────────┼──────────────────────────────────────────────┤
│ children │ 可以是：字符串、数字、React Element、           │
│          │ null/undefined/boolean（不渲染）               │
│          │ 数组（包含以上类型）                           │
└──────────┴──────────────────────────────────────────────┘
```

```jsx
// 完整示例：理解每个参数
React.createElement(
  // type: 可以是字符串（HTML标签）或函数/类（组件）
  'ul',
  
  // config: 属性对象（key 和 ref 是 React 特殊属性）
  { className: 'list', key: 'my-list', id: 'todo-list' },
  
  // children: 第3个参数起都是子元素（会自动放到 props.children 中）
  React.createElement('li', null, '学习'),
  React.createElement('li', null, '编码'),
  React.createElement('li', null, '调试'),
  '纯文本也可以',     // 字符串子元素
  42,                 // 数字子元素（会被渲染为文本）
  null                // null 会被忽略，什么都不渲染
);

// 💡 children 的处理规则：
// 1. 只有一个子元素 → props.children 是那个子元素本身
// 2. 多个子元素 → props.children 是一个数组
// 3. 没有子元素 → props.children 是 undefined
```

> ⚠️ **常见误区**：`React.createElement` 创建的是"虚拟的描述对象"，不是真实的 DOM。真正的 DOM 创建发生在 React 的"提交"阶段（Commit Phase），那时 React 会根据 Element 的描述调用 `document.createElement()` 等原生 DOM API 来操作页面。

---

## 🔗 下一步

掌握 JSX 后，让我们进入 **组件基础** 学习——把 JSX 封装成可复用的组件！

[→ 03 - 组件基础](../03-components/)
